import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env } from "./utils/constants";
import { allowedOrigin } from "./utils/cors";
import puppeteer from "@cloudflare/puppeteer";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("Hello! cf-workers!"));
app.use("/screenshot/*", cors({ origin: allowedOrigin }));

app.post("/screenshot", async (c) => {
  const body = await c.req.json();
  const { url } = body;
  if (!url) {
    return c.json({ error: "url is required" }, 400);
  }
  const normalizedUrl = new URL(url).toString();

  const cachedImage = await c.env.BROWSER_KV.get(url, { type: "arrayBuffer" });
  if (cachedImage) {
    return new Response(cachedImage, {
      headers: {
        "content-type": "image/jpeg",
      },
    });
  }

  const browser = await puppeteer.launch(c.env.MYBROWSER);
  const page = await browser.newPage();
  await page.goto(normalizedUrl);
  const img = (await page.screenshot()) as Buffer;

  return new Response(img, {
    headers: {
      "content-type": "image/jpeg",
    },
  });
});

export default app;
