// Trimcraft site: the only script. Shows the latest release version and the optional support link.
"use strict";

const CONFIG = {
  repo: "trimcraft/trimcraft",
  // Donation page, e.g. "https://github.com/sponsors/<name>". Empty keeps the Support link hidden.
  supportUrl: "",
};

function showSupportLink() {
  if (!CONFIG.supportUrl) return;
  const item = document.getElementById("support-item");
  const link = document.getElementById("support-link");
  if (!item || !link) return;
  link.href = CONFIG.supportUrl;
  item.hidden = false;
}

async function showLatestVersion() {
  const el = document.getElementById("version");
  if (!el) return;
  const key = "trimcraft-latest";
  try {
    // Cache for an hour per visitor, to stay well inside the API's anonymous rate limit.
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (cached && Date.now() - cached.at < 3600_000) {
      render(el, cached.tag);
      return;
    }
  } catch {
    // Storage can be unavailable (private mode); just fetch.
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${CONFIG.repo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
      referrerPolicy: "no-referrer",
      credentials: "omit",
    });
    if (!res.ok) return;
    const data = await res.json();
    const tag = typeof data.tag_name === "string" ? data.tag_name : "";
    if (!/^v?\d+\.\d+\.\d+([.-][\w.]+)?$/.test(tag)) return;
    render(el, tag);
    try {
      sessionStorage.setItem(key, JSON.stringify({ tag, at: Date.now() }));
    } catch {
      // ignore
    }
  } catch {
    // Offline or blocked: keep the plain "Latest release" text.
  }
}

function render(el, tag) {
  el.textContent = `Latest release ${tag.startsWith("v") ? tag : "v" + tag}`;
}

showSupportLink();
showLatestVersion();
