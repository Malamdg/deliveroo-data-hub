import * as esbuild from "esbuild";

const isWatchMode = process.argv.includes("--watch");

const userscriptHeader = `// ==UserScript==
// @name         Deliveroo Data Hub
// @namespace    https://github.com/Malamdg/deliveroo-data-hub
// @version      0.1.0
// @description  Retrieve and export your Deliveroo order history as structured JSON.
// @author       MalaM
// @match        https://deliveroo.fr/*
// @match        https://www.deliveroo.fr/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

`;

const config = {
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "dist/deliveroo-data-hub.user.js",
  format: "iife",
  target: ["es2020"],
  banner: {
    js: userscriptHeader
  },
  loader: {
    ".html": "text",
    ".css": "text"
  },
  legalComments: "none",
  sourcemap: false
};

if (isWatchMode) {
  const context = await esbuild.context(config);
  await context.watch();
  console.log("[deliveroo-data-hub] Watching...");
} else {
  await esbuild.build(config);
  console.log("[deliveroo-data-hub] Built dist/deliveroo-data-hub.user.js");
}