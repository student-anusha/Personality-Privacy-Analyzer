// content.js
(function () {
  "use strict";

  // --- site categories for engagement dashboard ---
  const sitePatterns = {
    social: [
      /facebook\.com/,
        /youtube\.com/,
      /instagram\.com/,
      /twitter\.com/,
      /snapchat\.com/,
      /pinterest\.com/,
   
      /reddit\.com/
    ],
    tech: [
      /github\.com/,
      /stackoverflow\.com/,
      /dev\.to/,
      /gitlab\.com/,
      /codepen\.io/,
      /repl\.it/,
      /leetcode\.com/
    ],
    privacy: [
      /duckduckgo\.com/,
      /protonmail\.com/,
      /signal\.org/,
      /torproject\.org/,
      /startpage\.com/,
      /brave\.com/,
      /mail\.google\.com/,
      /vpn\./
    ],
    professional: [
      /medium\.com/,
      /behance\.net/,
      /dribbble\.com/,
    /linkedin\.com/,
      /slideshare\.net/,
      /indeed\.com/,
      /naukri\.com/,
      /glassdoor\.com/,
      /upwork\.com/,
      /fiverr\.com/
    ],
    shopping: [
      /amazon\.in/,
      /amazon\.com/,
      /flipkart\.com/,
      /myntra\.com/,
      /nykaa\.com/,
      /meesho\.com/,
      /zomato\.com/,
      /swiggy\.com/,
      /bigbasket\.com/,
      /blinkit\.com/
    ]
  };

  function detectSiteCategory() {
    const hostname = window.location.hostname.replace(/^www\./, "");
    for (const [category, patterns] of Object.entries(sitePatterns)) {
      if (patterns.some((p) => p.test(hostname))) return category;
    }
    return "other";
  }

  // --- engagement tracking ---
  // Simple engagement logger: time on page, scroll depth, clicks per hostname

const startTime = Date.now();
let maxScroll   = 0;
let clickCount  = 0;

function computeScrollDepth() {
  const doc = document.documentElement;
  const body = document.body;
  const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
  const viewport  = window.innerHeight || doc.clientHeight || body.clientHeight || 0;
  const fullHeight= Math.max(
    body.scrollHeight, body.offsetHeight,
    doc.clientHeight, doc.scrollHeight, doc.offsetHeight
  );
  if (fullHeight <= viewport) return 100;
  const depth = (scrollTop + viewport) / fullHeight * 100;
  maxScroll = Math.max(maxScroll, depth);
}

window.addEventListener("scroll", () => {
  computeScrollDepth();
}, { passive: true });

window.addEventListener("click", () => {
  clickCount += 1;
}, true);

function guessCategory(host) {
  if (/youtube|netflix|primevideo/i.test(host)) return "video";
  if (/instagram|facebook|twitter|whatsapp|reddit/i.test(host)) return "social";
  if (/leetcode|github|stackoverflow|chatgpt|gemini/i.test(host)) return "tech";
  if (/amazon|flipkart|zomato|zepto/i.test(host)) return "shopping";
  if (/linkedin|indeed|naukri/i.test(host)) return "professional";
  return "other";
}

function flushEngagement() {
  const timeSpent = Date.now() - startTime;
  const hostname  = location.hostname.replace(/^www\./, "");
  const entry = {
    hostname,
    timeSpent,
    scrollDepth: Math.round(maxScroll),
    clicks: clickCount,
    category: guessCategory(hostname),
    ts: Date.now()
  };

  chrome.runtime.sendMessage({ action: "logEngagement", entry });
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    flushEngagement();
  }
});

window.addEventListener("beforeunload", () => {
  flushEngagement();
});
})();