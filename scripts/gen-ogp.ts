import { readFile, writeFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";

const W = 1200;
const H = 630;
const LOGO_SIZE = 160;
const GAP = 48;
const FONT_SIZE = 100;
const BG = "#0A0F1C";

const logoSvg = await readFile("public/logo.svg", "utf-8");
const logoBase64 = Buffer.from(logoSvg).toString("base64");

// Estimate text width to center the icon+text group horizontally
const textWidth = FONT_SIZE * 0.56 * "Pokéblank".length;
const groupWidth = LOGO_SIZE + GAP + textWidth;
const groupX = (W - groupWidth) / 2;
const centerY = H / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${BG}" />
  <image href="data:image/svg+xml;base64,${logoBase64}"
    x="${groupX}" y="${centerY - LOGO_SIZE / 2}"
    width="${LOGO_SIZE}" height="${LOGO_SIZE}" />
  <text
    x="${groupX + LOGO_SIZE + GAP}" y="${centerY}"
    font-family="system-ui, sans-serif" font-size="${FONT_SIZE}" font-weight="700"
    fill="#FFFFFF" dominant-baseline="middle">Pokéblank</text>
</svg>`;

const resvg = new Resvg(svg, { fitTo: { mode: "width", value: W } });
const png = resvg.render().asPng();
await writeFile("public/ogp.png", png);
console.log("Generated public/ogp.png");
