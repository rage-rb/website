const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";
const CONTENT_SIGNAL = "ai-train=yes, search=yes, ai-input=yes";

function acceptsMarkdown(acceptHeader) {
  if (!acceptHeader) return false;

  // Matches examples:
  // - "text/markdown"
  // - "text/html, text/markdown"
  // - "text/html;q=1.0, text/markdown;q=0.5"
  // Does not match:
  // - "application/json"
  // - "text/markdownish"
  return /(^|,)\s*text\/markdown(?:\s*;[^,]*)?\s*(?=,|$)/i.test(acceptHeader);
}

function toMarkdownPath(pathname) {
  if (pathname === "/") return null;
  if (pathname.endsWith(".md")) return null;
  // exclude file requests:
  //   /assets/app.js
  //   /img/logo.svg
  //   /sitemap.xml
  if (/\.[a-z0-9]+$/i.test(pathname)) return null;

  const withoutSlash = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return withoutSlash ? `${withoutSlash}.md` : null;
}

function withVaryAccept(headers) {
  const existing = headers.get("vary");
  if (!existing) {
    headers.set("vary", "Accept");
    return;
  }

  const values = existing
    .split(",")
    .map((value) => value.trim().toLowerCase());

  if (!values.includes("accept")) headers.set("vary", `${existing}, Accept`);
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return env.ASSETS.fetch(request);
  }

  if (!acceptsMarkdown(request.headers.get("accept"))) {
    return env.ASSETS.fetch(request);
  }

  const url = new URL(request.url);
  const markdownPath = toMarkdownPath(url.pathname);

  if (!markdownPath) {
    return env.ASSETS.fetch(request);
  }

  const markdownUrl = new URL(url);
  markdownUrl.pathname = markdownPath;

  const markdownResponse = await env.ASSETS.fetch(
    new Request(markdownUrl.toString(), request),
  );

  if (markdownResponse.status === 404) {
    return env.ASSETS.fetch(request);
  }

  if (!markdownResponse.ok) {
    return markdownResponse;
  }

  const headers = new Headers(markdownResponse.headers);
  headers.set("content-type", MARKDOWN_CONTENT_TYPE);
  // headers.set("content-signal", CONTENT_SIGNAL);
  withVaryAccept(headers);

  return new Response(markdownResponse.body, {
    status: markdownResponse.status,
    statusText: markdownResponse.statusText,
    headers,
  });
}
