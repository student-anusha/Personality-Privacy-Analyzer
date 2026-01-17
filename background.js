// background.js – engagement storage + AI helper + analysis persistence

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  (async () => {
    try {
      if (!req || !req.action) {
        sendResponse({ ok: false, error: "No action" });
        return;
      }

      // ---------- Engagement logging ----------
      if (req.action === "logEngagement") {
        const entry = req.entry;
        if (!entry) {
          sendResponse({ ok: false, error: "No entry" });
          return;
        }
        chrome.storage.local.get(["engagementLog"], (res) => {
          const log = res.engagementLog || [];
          log.push(entry);
          chrome.storage.local.set({ engagementLog: log }, () => {
            sendResponse({ ok: true });
          });
        });
        return; // async
      }

      // ---------- Save analysis ----------
      if (req.action === "saveAnalysis") {
        chrome.storage.local.set({ lastAnalysis: req.data || null }, () => {
          sendResponse({ ok: true });
        });
        return;
      }

      // ---------- API key management ----------
      if (req.action === "setApiKey") {
        const key = (req.apiKey || "").trim();
        if (!key) {
          sendResponse({ ok: false, error: "Empty API key" });
          return;
        }
        chrome.storage.local.set({ openai_api_key: key }, () => {
          sendResponse({ ok: true });
        });
        return;
      }

      if (req.action === "clearApiKey") {
        chrome.storage.local.remove("openai_api_key", () => {
          sendResponse({ ok: true });
        });
        return;
      }

      if (req.action === "getApiKey") {
        chrome.storage.local.get(["openai_api_key"], (res) => {
          sendResponse({ ok: true, apiKey: res.openai_api_key || null });
        });
        return;
      }

      // ---------- AI Call ----------
      if (req.action === "callAI") {
        const summary = req.data || req.summary;
        if (!summary) {
          sendResponse({ ok: false, error: "No summary provided" });
          return;
        }

        const store = await new Promise((r) => chrome.storage.local.get(["openai_api_key"], r));
        const storedKey = (store && store.openai_api_key) ? store.openai_api_key.trim() : "";
        const apiKey = (req.apiKey && req.apiKey.trim()) || storedKey;

        if (!apiKey) {
          sendResponse({ ok: false, error: "No OpenAI API key configured" });
          return;
        }

        const sanitized = {
          top_domains: (summary.topSites || []).slice(0, 20),
          stats: summary.stats || {},
          personality: summary.personality || null,
          privacy: summary.privacy || null,
          timeframe_days: summary.timeframeDays || null
        };

        const messages = [
          {
            role: "system",
            content:
              "You are a privacy-focused assistant. Only use the aggregated metrics provided. " +
              "Never ask for or infer raw URLs or personal identifiers."
          },
          {
            role: "user",
            content:
              "Aggregated browsing summary: " + JSON.stringify(sanitized) +
              "\nReturn: (1) three short insights, (2) three actions to improve privacy/browsing, " +
              "(3) a one-line privacy checklist."
          }
        ];

        const body = {
          model: "gpt-4o-mini",
          messages,
          max_tokens: 400,
          temperature: 0.7
        };

        const resp = await fetch(OPENAI_URL, {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });

        if (!resp.ok) {
          const t = await resp.text();
          sendResponse({ ok: false, error: `OpenAI error ${resp.status}: ${t}` });
          return;
        }

        const json = await resp.json();
        sendResponse({ ok: true, data: json });
        return;
      }

      sendResponse({ ok: false, error: "Unknown action: " + req.action });
    } catch (err) {
      console.error("background error", err);
      sendResponse({ ok: false, error: String(err) });
    }
  })();

  return true; // keep message channel open
});
