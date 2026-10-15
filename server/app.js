import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { categories, getDemoArticles } from "./demo.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const countries = new Set(["all", "mx", "us", "es", "ar", "co"]);
const safeUrl = (value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

export function createApp({
  apiKey = "",
  mode = "auto",
  fetchImpl = fetch,
  cacheMs = 300_000,
} = {}) {
  const app = express();
  const cache = new Map();
  const inFlight = new Map();
  const demo = mode === "demo" || (mode === "auto" && !apiKey.trim());
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });

  app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", mode: demo ? "demo" : "live" }),
  );
  app.get("/api/news", async (req, res) => {
    const {
      category = "general",
      q = "",
      country = "all",
      lang = "es",
    } = req.query;
    if (
      typeof category !== "string" ||
      !categories.includes(category) ||
      typeof q !== "string" ||
      q.length > 200 ||
      typeof country !== "string" ||
      !countries.has(country) ||
      typeof lang !== "string" ||
      !["es", "en"].includes(lang)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Revisa la categoría, el país, el idioma y la búsqueda (máximo 200 caracteres).",
        });
    }
    if (demo) {
      const articles = getDemoArticles(category, q.trim());
      return res.json({
        articles,
        totalArticles: articles.length,
        mode: "demo",
        cached: false,
      });
    }
    if (!apiKey.trim()) {
      return res
        .status(503)
        .json({
          error:
            "Falta configurar NEWS_API_KEY en el archivo .env del servidor.",
        });
    }
    const key = JSON.stringify([category, q.trim(), country, lang]);
    const existing = cache.get(key);
    if (existing && existing.expires > Date.now())
      return res.json({ ...existing.data, cached: true });
    cache.delete(key);

    const load = async () => {
      const url = new URL("https://gnews.io/api/v4/top-headlines");
      url.search = new URLSearchParams({
        category,
        lang,
        max: "10",
        apikey: apiKey.trim(),
        nullable: "description,content,image",
      });
      if (q.trim()) url.searchParams.set("q", q.trim());
      if (country !== "all") url.searchParams.set("country", country);
      const response = await fetchImpl(url, {
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        const errors = {
          400: "GNews no pudo interpretar la búsqueda. Prueba con otros términos.",
          401: "La API Key de GNews no es válida. Revisa la configuración del servidor.",
          403: "GNews rechazó el acceso. Revisa la clave, la cuota y los permisos de tu plan.",
          429: "Se alcanzó el límite de consultas de GNews. Inténtalo más tarde.",
        };
        const error = new Error(
          errors[response.status] ||
            "El proveedor de noticias no está disponible. Inténtalo más tarde.",
        );
        error.status = response.status === 429 ? 429 : 502;
        throw error;
      }
      const payload = await response.json();
      if (!Array.isArray(payload.articles))
        throw new Error("Invalid provider response");
      const data = {
        articles: payload.articles
          .filter((article) => article && typeof article.title === "string")
          .map((article, index) => ({
            id: safeUrl(article.url) || `article-${index}`,
            title: article.title,
            description:
              typeof article.description === "string"
                ? article.description
                : "",
            content: typeof article.content === "string" ? article.content : "",
            url: safeUrl(article.url),
            image: safeUrl(article.image),
            publishedAt:
              typeof article.publishedAt === "string" &&
              Number.isFinite(Date.parse(article.publishedAt))
                ? article.publishedAt
                : null,
            source: {
              name:
                typeof article.source?.name === "string"
                  ? article.source.name
                  : "Fuente original",
            },
          })),
        totalArticles: Number.isFinite(payload.totalArticles)
          ? payload.totalArticles
          : payload.articles.length,
        mode: "live",
        cached: false,
      };
      // Una caché pequeña evita gastar cuota al volver a una categoría.
      if (cache.size >= 100) cache.delete(cache.keys().next().value);
      cache.set(key, { data, expires: Date.now() + cacheMs });
      return data;
    };
    try {
      if (!inFlight.has(key))
        inFlight.set(
          key,
          load().finally(() => inFlight.delete(key)),
        );
      res.json(await inFlight.get(key));
    } catch (error) {
      // Nunca devolvemos URLs del proveedor ni mensajes que puedan contener la clave.
      const timeout =
        error.name === "TimeoutError" || error.name === "AbortError";
      res.status(timeout ? 504 : error.status || 502).json({
        error: timeout
          ? "La consulta tardó demasiado. Vuelve a intentarlo."
          : error.status
            ? error.message
            : "No pudimos conectar con GNews. Vuelve a intentarlo.",
      });
    }
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "Ruta de API no encontrada." }),
  );
  app.use(express.static(path.join(root, "dist")));
  app.get("/{*path}", (_req, res) =>
    res.sendFile(path.join(root, "dist", "index.html")),
  );
  return app;
}
