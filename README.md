# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
npm install
```

## Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Cloudflare Pages Markdown Negotiation

This repo includes a Pages Function at `functions/[[path]].js` that checks for
`Accept: text/markdown` and, when available, serves the generated `.md` version
of the same route (for example, `/docs/intro` -> `/docs/intro.md`).
The site also ships `static/_headers`, so all responses include:

```txt
Content-Signal: ai-train=yes, search=yes, ai-input=yes
```
