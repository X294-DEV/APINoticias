import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./app.js";

async function withServer(options, run) {
  const server = createApp(options).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await run((route) => fetch(`${base}${route}`));
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
      fetchImpl: async (url) => {
        calls++;
        assert.equal(url.origin, "https://gnews.io");
        assert.equal(url.searchParams.get("apikey"), "test-secret");
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
