document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      // Go back to analyzer UI in this tab (centered layout already handled in popup.html)
      window.location.href = chrome.runtime.getURL("popup.html");
    });
  }

  chrome.storage.local.get(["engagementLog"], (res) => {
    const log = res.engagementLog || [];

    if (!log.length) {
      console.warn("No engagement data recorded yet.");
      buildKPIs([]);
      buildCharts([]);
      return;
    }

    buildKPIs(log);
    buildCharts(log);
  });
});

// ---------------- KPI Calculations -----------------------

function buildKPIs(log) {
  if (!log.length) {
    document.getElementById("kpiTime").textContent = "0m";
    document.getElementById("kpiScroll").textContent = "0%";
    document.getElementById("kpiClicks").textContent = "0";
    document.getElementById("kpiVisits").textContent = "0";
    return;
  }

  const totalTime = log.reduce((a, b) => a + (b.timeSpent || 0), 0);
  const avgScroll = Math.round(
    log.reduce((a, b) => a + (b.scrollDepth || 0), 0) / log.length
  );
  const totalClicks = log.reduce((a, b) => a + (b.clicks || 0), 0);
  const uniqueSites = new Set(log.map((e) => e.hostname)).size;

  document.getElementById("kpiTime").textContent   = Math.round(totalTime / 60000) + "m";
  document.getElementById("kpiScroll").textContent = avgScroll + "%";
  document.getElementById("kpiClicks").textContent = totalClicks;
  document.getElementById("kpiVisits").textContent = uniqueSites;
}

// ---------------- Chart Builders -----------------------

function buildCharts(log) {
  const labels     = log.map((e) => e.hostname);
  const timeData   = log.map((e) => Math.round((e.timeSpent || 0) / 1000));
  const clickData  = log.map((e) => e.clicks || 0);
  const scrollData = log.map((e) => e.scrollDepth || 0);

  const catCounts = {};
  log.forEach((e) => {
    const c = e.category || "other";
    catCounts[c] = (catCounts[c] || 0) + 1;
  });

  const categoryLabels = Object.keys(catCounts);
  const categoryValues = Object.values(catCounts);

  new Chart(document.getElementById("timeChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Seconds spent",
          data: timeData
        }
      ]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  new Chart(document.getElementById("clickChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Clicks",
          data: clickData,
          fill: false
        }
      ]
    },
    options: { responsive: true }
  });

  new Chart(document.getElementById("scrollChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "% scroll",
          data: scrollData
        }
      ]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: {
      labels: categoryLabels,
      datasets: [
        {
          data: categoryValues,
          backgroundColor: [
            "#5b6cff",
            "#7b3fe4",
            "#4ecdc4",
            "#ffb86b",
            "#f86b9b",
            "#50fa7b"
          ]
        }
      ]
    },
    options: { responsive: true }
  });
}
