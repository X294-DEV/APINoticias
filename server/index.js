import { createApp } from "./app.js";

const mode = process.env.NEWS_MODE || "auto";
if (!["auto", "live", "demo"].includes(mode))
  throw new Error("NEWS_MODE debe ser auto, live o demo.");
const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT no es válido.");
const app = createApp({ apiKey: process.env.NEWS_API_KEY || "", mode });
app.listen(port, "127.0.0.1", () =>
  console.log(`API de noticias: http://127.0.0.1:${port}`),
);
