// ==================== ROOGLE ENCRYPTION LANGUAGE ====================

if (!document.getElementById("enc-modal")) {
    const _encWrap = document.createElement("div");
    _encWrap.innerHTML = `
    <style>
        #enc-modal {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: #101018;
            flex-direction: column;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        #enc-modal.enc-open { display: flex; }

        #enc-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #1a1a24;
            padding: 0 18px;
            height: 50px;
            flex-shrink: 0;
            border-bottom: 1px solid #282830;
        }
        #enc-topbar .enc-logo {
            font-size: 18px;
            font-weight: 700;
            color: #00b894;
            user-select: none;
        }
        #enc-topbar .enc-logo span { color: #55efc4; }
        #enc-topbar .enc-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #enc-open-external-btn {
            background: rgba(0,184,148,0.15);
            border: 1px solid #00b894;
            color: #55efc4;
            font-size: 12px;
            cursor: pointer;
            padding: 5px 12px;
            border-radius: 6px;
            line-height: 1;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: background 0.15s;
        }
        #enc-open-external-btn:hover { background: rgba(0,184,148,0.3); }
        #enc-close-btn {
            background: none;
            border: none;
            color: #a0a0b0;
            font-size: 24px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            line-height: 1;
            transition: color 0.15s, background 0.15s;
        }
        #enc-close-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }

        #enc-main-iframe {
            flex: 1;
            border: none;
            width: 100%;
            background: #000;
            display: block;
        }
    </style>

    <!-- ENCRYPTION MODAL -->
    <div id="enc-modal">
        <div id="enc-topbar">
            <div class="enc-logo">Roogle <span>Encryption Language</span></div>
            <div class="enc-actions">
                <a id="enc-open-external-btn"
                   href="https://project-r-rho.vercel.app/"
                   target="_blank"
                   title="Open in new tab">🔐 Open full site</a>
                <button id="enc-close-btn" title="Close">&times;</button>
            </div>
        </div>
        <iframe
            id="enc-main-iframe"
            src="about:blank"
            sandbox="allow-scripts allow-forms allow-popups allow-same-origin allow-pointer-lock allow-presentation allow-storage-access-by-user-activation"
            allow="fullscreen; autoplay; encrypted-media"
            allowfullscreen
        ></iframe>
    </div>
    `;
    document.body.appendChild(_encWrap);
}

// -------------------- OPEN / CLOSE --------------------

function openEncryption() {
    const modal  = document.getElementById("enc-modal");
    const iframe = document.getElementById("enc-main-iframe");
    if (!modal || !iframe) return;

    if (iframe.src === "about:blank" || !iframe.src) {
        iframe.src = "https://project-r-rho.vercel.app/";
    }
    modal.classList.add("enc-open");

    const sb = document.getElementById("sidebar");
    if (window.innerWidth < 800 && sb) sb.classList.remove("open");
}

function closeEncryption() {
    const modal  = document.getElementById("enc-modal");
    const iframe = document.getElementById("enc-main-iframe");
    if (modal)  modal.classList.remove("enc-open");
    if (iframe) iframe.src = "about:blank";
}

// -------------------- EVENT LISTENERS --------------------

const _encCloseBtn = document.getElementById("enc-close-btn");
if (_encCloseBtn) _encCloseBtn.addEventListener("click", closeEncryption);

const _btnEncSidebar = document.getElementById("btn-encryption-sidebar");
if (_btnEncSidebar) _btnEncSidebar.addEventListener("click", openEncryption);