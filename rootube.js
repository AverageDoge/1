// -------------------- ROOTUBE --------------------

// -------------------- 1. INJECT MODAL & CSS --------------------
if (!document.getElementById("rootube-modal")) {
    const rootobeDiv = document.createElement("div");
    rootobeDiv.innerHTML = `
    <div id="rootube-modal" class="modal hidden">
        <style>
            /* --- ROOTUBE MODAL WRAPPER --- */
            #rootube-modal .rootube-shell {
                display: flex;
                flex-direction: column;
                width: 920px;
                max-width: 96vw;
                height: 620px;
                max-height: 90vh;
                background: #f1f3f4;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 6px 28px rgba(0,0,0,0.28);
                font-family: 'Segoe UI', Roboto, Arial, sans-serif;
                position: relative;
            }

            /* --- TOP BAR (Google News style) --- */
            #rootube-modal .rt-topbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #202124;
                padding: 0 16px;
                height: 52px;
                flex-shrink: 0;
            }
            #rootube-modal .rt-logo {
                display: flex;
                align-items: center;
                gap: 9px;
                color: #fff;
                font-size: 20px;
                font-weight: 700;
                letter-spacing: -0.3px;
                user-select: none;
            }
            #rootube-modal .rt-logo span.rt-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: #ff0000;
                border-radius: 6px;
                width: 30px;
                height: 22px;
                font-size: 13px;
            }
            #rootube-modal .rt-logo span.rt-root {
                color: #fff;
            }
            #rootube-modal .rt-logo span.rt-tube {
                color: #ff4444;
            }

            /* --- IFRAME AREA --- */
            #rootube-modal .rt-content {
                flex: 1;
                position: relative;
                background: #000;
                overflow: hidden;
            }
            #rootube-modal .rt-content iframe {
                width: 100%;
                height: 100%;
                border: none;
                display: block;
            }

            /* --- LOADING OVERLAY --- */
            #rootube-modal .rt-loading {
                position: absolute;
                inset: 0;
                background: #0f0f0f;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 14px;
                color: #aaa;
                font-size: 14px;
                z-index: 2;
                transition: opacity 0.4s;
            }
            #rootube-modal .rt-loading.hidden { opacity: 0; pointer-events: none; }
            #rootube-modal .rt-spinner {
                width: 36px;
                height: 36px;
                border: 3px solid #333;
                border-top-color: #ff4444;
                border-radius: 50%;
                animation: rt-spin 0.8s linear infinite;
            }
            @keyframes rt-spin { to { transform: rotate(360deg); } }

            /* --- CLOSE BUTTON --- */
            #rootube-modal .rt-close {
                background: none;
                border: none;
                color: #bdc1c6;
                font-size: 22px;
                cursor: pointer;
                line-height: 1;
                padding: 4px 6px;
                border-radius: 4px;
                transition: color 0.15s, background 0.15s;
            }
            #rootube-modal .rt-close:hover {
                color: #fff;
                background: rgba(255,255,255,0.1);
            }
        </style>

        <div class="rootube-shell">

            <!-- Top bar -->
            <div class="rt-topbar">
                <div class="rt-logo">
                    <span class="rt-icon">▶</span>
                    <span><span class="rt-root">Roo</span><span class="rt-tube">tube</span></span>
                </div>
                <button class="rt-close" id="rootube-close-btn" title="Close">&times;</button>
            </div>

            <!-- Content: iframe -->
            <div class="rt-content">
                <div class="rt-loading" id="rootube-loading">
                    <div class="rt-spinner"></div>
                    <span>Loading Rootube...</span>
                </div>
                <iframe
                    id="rootube-iframe"
                    src="about:blank"
                    sandbox="allow-scripts allow-forms allow-popups allow-same-origin allow-pointer-lock allow-presentation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    title="Rootube"
                ></iframe>
            </div>

        </div>
    </div>
    `;
    document.body.appendChild(rootobeDiv);
}

// -------------------- 2. OPEN / CLOSE LOGIC --------------------
const ROOTUBE_URL = "https://youtube-zeta-murex.vercel.app/";

function openRootube() {
    const modal    = document.getElementById("rootube-modal");
    const iframe   = document.getElementById("rootube-iframe");
    const loading  = document.getElementById("rootube-loading");

    if (!modal) return;

    // Lazy-load the iframe only when opened
    if (iframe.src === "about:blank" || iframe.src === "") {
        loading.classList.remove("hidden");
        iframe.src = ROOTUBE_URL;
        iframe.onload = () => loading.classList.add("hidden");
    }

    modal.classList.remove("hidden");

    // Close sidebar on mobile
    const sidebar = document.getElementById("sidebar");
    if (window.innerWidth < 800 && sidebar) sidebar.classList.remove("open");
}

function closeRootube() {
    const modal = document.getElementById("rootube-modal");
    if (modal) modal.classList.add("hidden");
}

// Close button
const rootobeCloseBtn = document.getElementById("rootube-close-btn");
if (rootobeCloseBtn) rootobeCloseBtn.addEventListener("click", closeRootube);

// Click backdrop to close
const rootobeModal = document.getElementById("rootube-modal");
if (rootobeModal) {
    rootobeModal.addEventListener("click", (e) => {
        if (e.target === rootobeModal) closeRootube();
    });
}

// -------------------- 3. WIRE SIDEBAR BUTTON --------------------
const btnRootubeSidebar = document.getElementById("btn-rootube-sidebar");
if (btnRootubeSidebar) btnRootubeSidebar.addEventListener("click", openRootube);