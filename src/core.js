window.ClippyGame = window.ClippyGame || {};

(() => {
  const ClippyGame = window.ClippyGame;

  const ensureErrorPanel = () => {
    if (typeof document === "undefined" || !document.body) {
      return null;
    }

    let panel = document.getElementById("v7-startup-error");
    if (panel) {
      return panel;
    }

    panel = document.createElement("div");
    panel.id = "v7-startup-error";
    panel.style.position = "fixed";
    panel.style.left = "16px";
    panel.style.right = "16px";
    panel.style.bottom = "16px";
    panel.style.zIndex = "99999";
    panel.style.padding = "14px 16px";
    panel.style.borderRadius = "14px";
    panel.style.background = "rgba(125, 33, 42, 0.95)";
    panel.style.color = "#fff";
    panel.style.font = "600 14px/1.45 Trebuchet MS, Segoe UI, sans-serif";
    panel.style.boxShadow = "0 10px 28px rgba(0,0,0,0.28)";
    panel.style.whiteSpace = "pre-wrap";
    panel.style.display = "none";
    document.body.appendChild(panel);
    return panel;
  };

  const showStartupError = (label, detail) => {
    const panel = ensureErrorPanel();
    if (!panel) {
      return;
    }
    const message = String(detail || "Unknown error");
    panel.textContent = `${label}\n${message}`;
    panel.style.display = "block";
  };

  window.addEventListener("error", (event) => {
    const detail = event?.error?.stack || event?.message || "Unknown script error";
    showStartupError("V7 startup error", detail);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const detail = event?.reason?.stack || event?.reason?.message || String(event?.reason || "Unknown promise rejection");
    showStartupError("V7 startup rejection", detail);
  });

  ClippyGame.showStartupError = showStartupError;
})();
