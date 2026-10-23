

if (!document.getElementById("rg-modal")) {
    const _rgWrap = document.createElement("div");
    _rgWrap.innerHTML = `
    <style>
        /* ---- ROOGLE GAMES SHELL ---- */
        #rg-modal {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: #101018;
            flex-direction: column;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        #rg-modal.rg-open { display: flex; }

        /* top bar */
        #rg-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #1a1a24;
            padding: 0 18px;
            height: 50px;
            flex-shrink: 0;
            border-bottom: 1px solid #282830;
        }
        #rg-topbar .rg-logo {
            font-size: 18px;
            font-weight: 700;
            color: #6200ea;
            user-select: none;
        }
        #rg-topbar .rg-logo span { color: #a78bfa; }
        #rg-topbar .rg-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #rg-open-external-btn {
            background: rgba(98,0,234,0.15);
            border: 1px solid #6200ea;
            color: #a78bfa;
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
        #rg-open-external-btn:hover { background: rgba(98,0,234,0.3); }
        #rg-close-btn {
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
        #rg-close-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }

        /* main iframe — fills all remaining space */
        #rg-main-iframe {
            flex: 1;
            border: none;
            width: 100%;
            background: #000;
            display: block;
        }
    </style>

    <!-- GAMES MODAL -->
    <div id="rg-modal">
        <div id="rg-topbar">
            <div class="rg-logo">Roogle <span>Games</span></div>
            <div class="rg-actions">
                <a id="rg-open-external-btn"
                   href="https://extraordinary-tarsier-f62cf1.netlify.app/"
                   target="_blank"
                   title="Open in new tab">⬡ Open full site</a>
                <button id="rg-close-btn" title="Close">&times;</button>
            </div>
        </div>
        <iframe
            id="rg-main-iframe"
            src="about:blank"
            sandbox="allow-scripts allow-forms allow-popups allow-same-origin allow-pointer-lock allow-presentation allow-storage-access-by-user-activation"
            allow="fullscreen; autoplay; encrypted-media"
            allowfullscreen
        ></iframe>
    </div>
    `;
    document.body.appendChild(_rgWrap);
}

// -------------------- OPEN / CLOSE --------------------

function openRoogleGames() {
    const modal  = document.getElementById("rg-modal");
    const iframe = document.getElementById("rg-main-iframe");
    if (!modal || !iframe) return;

    // Show performance warning
    const proceed = confirm(
        "⚠️ Performance Warning\n\n" +
        "Games may use a lot of CPU, GPU, and RAM power.\n" +
        "If you are on a Chromebook, prepare to experience lag.\n\n" +
        "Press OK to continue."
    );
    if (!proceed) return;

    // Load the games site
    if (iframe.src === "about:blank" || !iframe.src) {
        iframe.src = "https://extraordinary-tarsier-f62cf1.netlify.app/";
    }
    modal.classList.add("rg-open");

    // Close Roogle sidebar on mobile
    const sb = document.getElementById("sidebar");
    if (window.innerWidth < 800 && sb) sb.classList.remove("open");
}


function closeRoogleGames() {
    const modal  = document.getElementById("rg-modal");
    const iframe = document.getElementById("rg-main-iframe");
    if (modal)  modal.classList.remove("rg-open");
    if (iframe) iframe.src = "about:blank"; // free memory
}

// -------------------- EVENT LISTENERS --------------------

const _rgCloseBtn = document.getElementById("rg-close-btn");
if (_rgCloseBtn) _rgCloseBtn.addEventListener("click", closeRoogleGames);

// Sidebar button on Roogle main page
const _btnGamesSidebar = document.getElementById("btn-games-sidebar");
if (_btnGamesSidebar) _btnGamesSidebar.addEventListener("click", openRoogleGames);