import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./app.js";

async function withServer(options, run) {
  const server = createApp(options).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await run((route, options) => fetch(`${base}${route}`, options));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
const providerArticle = {
  title: "Una noticia de prueba",
  description: "Descripción",
  url: "https://example.com/news",
  image: "https://example.com/image.jpg",
  publishedAt: "2026-10-14T12:00:00Z",
  source: { name: "Pruebas" },
};
const providerResponse = (articles = [providerArticle]) =>
  Response.json({ totalArticles: articles.length, articles });

test("sin clave ofrece ejemplos identificados y búsqueda local", async () => {
  await withServer({}, async (request) => {
    const data = await (await request("/api/news?category=technology")).json();
    assert.equal(data.mode, "demo");
    assert.ok(data.articles.length > 0);
    assert.equal(data.articles[0].url, null);
    const empty = await (await request("/api/news?q=zzzzzzzz")).json();
    assert.equal(empty.articles.length, 0);
  });
});

test("rechaza filtros no válidos y parámetros repetidos", async () => {
  await withServer({}, async (request) => {
    for (const query of [
      "category=invalid",
      "country=invalid",
      "lang=invalid",
      "category=world&category=science",
      `q=${"a".repeat(201)}`,
    ]) {
      assert.equal((await request(`/api/news?${query}`)).status, 400);
    }
  });
});

test("el modo live sin clave devuelve un error de configuración", async () => {
  await withServer({ mode: "live" }, async (request) => {
    assert.equal((await request("/api/news")).status, 503);
  });
});

test("envía filtros a GNews, oculta la clave y reutiliza la caché", async () => {
  let calls = 0;
  await withServer(
    {
      apiKey: "test-secret",
      fetchImpl: async (url, options) => {
        calls++;
        assert.equal(url.origin, "https://gnews.io");
        assert.equal(url.searchParams.has("apikey"), false);
        assert.equal(options.headers["X-Api-Key"], "test-secret");
        assert.equal(url.searchParams.get("category"), "science");
        assert.equal(url.searchParams.get("country"), "mx");
        assert.equal(url.searchParams.get("q"), "espacio");
        return providerResponse();
      },
    },
    async (request) => {
      const route = "/api/news?category=science&country=mx&q=espacio";
      const first = await (await request(route)).json();
      assert.equal(first.mode, "live");
      assert.equal(first.cached, false);
      assert.equal(JSON.stringify(first).includes("test-secret"), false);
      assert.equal((await (await request(route)).json()).cached, true);
      assert.equal(calls, 1);
    },
  );
});

test("una clave personal consulta GNews incluso sin .env y en modo demo", async () => {
  await withServer(
    {
      mode: "demo",
      fetchImpl: async (url, options) => {
        assert.equal(options.headers["X-Api-Key"], "personal-test-key");
        assert.equal(url.searchParams.has("apikey"), false);
        return providerResponse();
      },
    },
    async (request) => {
      const response = await request("/api/news", {
        headers: { "X-News-Api-Key": "personal-test-key" },
      });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-store");
      const data = await response.json();
      assert.equal(data.mode, "live");
      assert.equal(JSON.stringify(data).includes("personal-test-key"), false);
      assert.equal((await (await request("/api/news")).json()).mode, "demo");
    },
  );
});

test("la clave personal prevalece y no lee ni modifica la caché del servidor", async () => {
  const calls = [];
  await withServer(
    {
      apiKey: "server-test-key",
      fetchImpl: async (_url, options) => {
        const key = options.headers["X-Api-Key"];
        calls.push(key);
        return providerResponse([
          {
            ...providerArticle,
            title: key === "server-test-key" ? "Servidor" : "Personal",
          },
        ]);
      },
    },
    async (request) => {
      const personal = { headers: { "X-News-Api-Key": "personal-test-key" } };
      assert.equal(
        (await (await request("/api/news")).json()).articles[0].title,
        "Servidor",
      );
      for (let i = 0; i < 2; i++) {
        const data = await (await request("/api/news", personal)).json();
        assert.equal(data.articles[0].title, "Personal");
        assert.equal(data.cached, false);
      }
      const server = await (await request("/api/news")).json();
      assert.equal(server.articles[0].title, "Servidor");
      assert.equal(server.cached, true);
      assert.deepEqual(calls, [
        "server-test-key",
        "personal-test-key",
        "personal-test-key",
      ]);
    },
  );
});

test("dos claves personales simultáneas nunca comparten resultados", async () => {
  const calls = [];
  await withServer(
    {
      fetchImpl: async (_url, options) => {
        const key = options.headers["X-Api-Key"];
        calls.push(key);
        await new Promise((resolve) => setTimeout(resolve, 20));
        return providerResponse([
          {
            ...providerArticle,
            title: key === "personal-key-a" ? "Cuenta A" : "Cuenta B",
          },
        ]);
      },
    },
    async (request) => {
      const data = await Promise.all(
        ["personal-key-a", "personal-key-b"].map(async (key) =>
          (
            await request("/api/news", { headers: { "X-News-Api-Key": key } })
          ).json(),
        ),
      );
      assert.equal(data[0].articles[0].title, "Cuenta A");
      assert.equal(data[1].articles[0].title, "Cuenta B");
      assert.equal(calls.length, 2);
    },
  );
});

test("una clave personal inválida no se sustituye por la clave del servidor", async () => {
  await withServer(
    {
      apiKey: "server-test-key",
      fetchImpl: async (_url, options) => {
        assert.equal(options.headers["X-Api-Key"], "invalid-personal-key");
        return new Response("invalid-personal-key", { status: 401 });
      },
    },
    async (request) => {
      const response = await request("/api/news", {
        headers: { "X-News-Api-Key": "invalid-personal-key" },
      });
      assert.equal(response.status, 502);
      assert.equal(
        (await response.text()).includes("invalid-personal-key"),
        false,
      );
    },
  );
});

test("rechaza claves malformadas antes de contactar con GNews", async () => {
  await withServer(
    {
      fetchImpl: async () => {
        assert.fail("No debe consultar al proveedor");
      },
    },
    async (request) => {
      for (const key of ["", "key with spaces", "a".repeat(257)]) {
        const response = await request("/api/news", {
          headers: { "X-News-Api-Key": key },
        });
        assert.equal(response.status, 400);
      }
    },
  );
});

test("las consultas simultáneas iguales comparten una petición", async () => {
  let calls = 0;
  await withServer(
    {
      apiKey: "test-secret",
      fetchImpl: async () => {
        calls++;
        await new Promise((resolve) => setTimeout(resolve, 30));
        return providerResponse();
      },
    },
    async (request) => {
      const responses = await Promise.all([
        request("/api/news"),
        request("/api/news"),
      ]);
      assert.ok(responses.every((response) => response.ok));
      assert.equal(calls, 1);
    },
  );
});

test("traduce errores de autenticación, permisos y cuota", async () => {
  for (const upstreamStatus of [401, 403, 429, 500]) {
    await withServer(
      {
        apiKey: "test-secret",
        fetchImpl: async () =>
          new Response("test-secret", { status: upstreamStatus }),
      },
      async (request) => {
        const response = await request("/api/news");
        assert.equal(response.status, upstreamStatus === 429 ? 429 : 502);
        assert.equal((await response.text()).includes("test-secret"), false);
      },
    );
  }
});

test("maneja timeouts y respuestas malformadas sin filtrar mensajes internos", async () => {
  for (const fetchImpl of [
    async () => {
      throw new DOMException("test-secret", "TimeoutError");
    },
    async () => Response.json({ invalid: true }),
    async () => {
      throw new Error("test-secret");
    },
  ]) {
    await withServer({ apiKey: "test-secret", fetchImpl }, async (request) => {
      const response = await request("/api/news");
      assert.ok([502, 504].includes(response.status));
      assert.equal((await response.text()).includes("test-secret"), false);
    });
  }
});

test("elimina URLs inseguras y normaliza campos opcionales", async () => {
  await withServer(
    {
      apiKey: "test-secret",
      fetchImpl: async () =>
        providerResponse([
          {
            title: "Prueba",
            url: "javascript:alert(1)",
            image: "data:text/html,test",
            publishedAt: "invalid",
          },
        ]),
    },
    async (request) => {
      const {
        articles: [article],
      } = await (await request("/api/news")).json();
      assert.equal(article.url, null);
      assert.equal(article.image, null);
      assert.equal(article.publishedAt, null);
      assert.equal(article.description, "");
      assert.equal(article.source.name, "Fuente original");
    },
  );
});

test("health y rutas desconocidas no exponen configuración sensible", async () => {
  await withServer({ apiKey: "test-secret" }, async (request) => {
    assert.deepEqual(await (await request("/api/health")).json(), {
      status: "ok",
      mode: "live",
    });
    assert.equal((await request("/api/missing")).status, 404);
  });
});
