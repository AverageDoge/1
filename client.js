// ------------------ GLOBALS ------------------/
const inner = document.getElementById("innerFrame");
const overlay = document.getElementById("loadingOverlay");
let target = null;

// ------------------ HELPERS ------------------
function getURL() {
  // Check the new Hybrid Engine query params (?url=...)
  const p = new URLSearchParams(window.location.search);
  let url = p.get("url");
  
  // Fallback for older hash links (#url=...) just in case
  if (!url && location.hash) {
     const hp = new URLSearchParams(location.hash.slice(1));
     url = hp.get("url");
  }
  return url;
}

function getEngine() {
  const p = new URLSearchParams(window.location.search);
  return p.get("engine") || "uv";
}

function sendParent(msg) { 
  try { parent.postMessage(msg, "*"); } catch {} 
}

function log(msg, level="info") {
  sendParent({
    type: "clientRouter:log",
    payload: { ts: new Date().toLocaleTimeString(), level, message: msg }
  });
  console.log("[client-router]", msg);
}

function showOverlay() {
  if (overlay) overlay.classList.remove("hidden");
  sendParent({ type: "clientRouter:showLoading" });
}

function hideOverlay() {
  if (overlay) overlay.classList.add("hidden");
  sendParent({ type: "clientRouter:hideLoading" });
}

// ------------------ BACKEND ROTATION (Cloudflare Engine) ------------------
async function loadViaBackend(url) {
  target = url;
  showOverlay();
  log("Starting Cloudflare engine for: " + url);

  const backends = [
    "https://cloud1.uraverageopdoge.workers.dev",
    "https://cloud2.rageinhaler.workers.dev",
    "https://cloud3.kevinthejordan.workers.dev",
    "https://cloud1.rageinhaler.workers.dev",
    "https://cloud2.uraverageopdoge.workers.dev",
    "https://cloud3.kevinthejordan.workers.dev",
    "https://cloud2.kevinthejordan.workers.dev"
  ];

  for (const backend of backends) {
    sendParent({ type: "clientRouter:backendTest", backend, target: url });
    
    // Construct the gateway URL (backend + ?url=...)
    const routerUrl = `${backend}?url=${encodeURIComponent(url)}`;
    
    // Attempt to load
    const success = await tryLoad(routerUrl, backend);
    
    if (success) {
      log(`Success with backend: ${backend}`, "success");
      sendParent({ type: "clientRouter:backendSuccess", backend });
      return; // Stop after first success
    } else {
      sendParent({ type: "clientRouter:backendFail", backend });
    }
  }

  // If loop finishes, all failed
  log("All backends failed.", "error");
  sendParent({ type: "clientRouter:backendError", info: "All gateways failed." });
  alert("Could not connect to any gateway server. Please try again later.");
  hideOverlay();
}

function tryLoad(fullUrl, backendLabel) {
  return new Promise((resolve) => {
    let settled = false;
    
    // Set a timeout for each backend (6 seconds)
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        log("Timeout on " + backendLabel, "warn");
        resolve(false); 
      }
    }, 6000);

    // Set the source
    inner.src = fullUrl;

    // Listen for success
    inner.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        hideOverlay();
        resolve(true);
      }
    };

    // Listen for immediate errors
    inner.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    };
  });
}

// ------------------ INIT ------------------
window.addEventListener("load", () => {
  const url = getURL();
  const engine = getEngine();

  // ONLY fire the Cloudflare rotation if the user selected 'cf' in the dropdown
  if (engine === "cf") {
    if (url) {
      loadViaBackend(url);
    } else {
      log("No URL specified for Cloudflare engine.");
      hideOverlay();
    }
  } else if (engine === "uv" || engine === "uv-bare") {
    log("Ultraviolet engine selected (" + engine + "). Deferring to UV Service Worker.");
    
    if (url && typeof __uv$config !== 'undefined') {
        // Register and WAIT for the Service Worker to be ready!
        navigator.serviceWorker.register('/sw.js', {
            scope: __uv$config.prefix
        }).then(() => {
            return navigator.serviceWorker.ready;
        }).then(() => {
            // The interceptor is awake! Now it is safe to load the URL.
            inner.src = __uv$config.prefix + __uv$config.encodeUrl(url);
            
            // Hide the loading spinner once the game actually loads
            inner.onload = () => {
                hideOverlay();
            };
        }).catch((err) => {
            console.error("Service worker registration failed:", err);
            hideOverlay();
        });
    } else {
        hideOverlay();
    }
  }
});

// ------------------ MESSAGE LISTENER ------------------
window.addEventListener("message", (ev) => {
  const d = ev.data || {};
  
  if (d.type === "navigate" && d.url) {
    const engine = getEngine();
    // Only restart Cloudflare rotation if we are actively using it
    if (engine === "cf") {
        loadViaBackend(d.url);
    } else if (engine === "uv" || engine === "uv-bare") {
        // UV handles navigation natively, just update the iframe SRC
        inner.src = __uv$config.prefix + __uv$config.encodeUrl(d.url);
    }
  }
});