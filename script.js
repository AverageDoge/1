// -------------------- UI ELEMENTS --------------------
let iframe = document.getElementById("innerFrame"); 
const iframeContainer = document.getElementById("iframe-container");
const searchBox = document.getElementById("url");
const form = document.getElementById("gatewayForm");
const routerEngine = document.getElementById("routerEngine"); // The Hybrid Dropdown
const fullscreenBtn = document.getElementById("fullscreen-btn");
const sidebar = document.getElementById("sidebar");
const hamburgerBtn = document.getElementById("hamburger");
const closeSidebarBtn = document.getElementById("closeSidebar");

// Shortcuts
const btnGoogle = document.getElementById("btn-google");
const btnHaha = document.getElementById("btn-hahagames");
const btnLeaderboard = document.getElementById("btn-leaderboard");

// Shop
const btnShopSidebar = document.getElementById("btn-shop-sidebar");
const btnShopMenu = document.getElementById("menu-shop-btn");

// Inventory
const btnChangeRank = document.getElementById("change-rank-btn");
const rankModal = document.getElementById("rank-modal");
const closeRankModal = document.getElementById("close-rank-modal");
const rankList = document.getElementById("rank-list");

const btnChangeFont = document.getElementById("change-font-btn");
const fontModal = document.getElementById("font-modal");
const closeFontModal = document.getElementById("close-font-modal");
const fontList = document.getElementById("font-list");

// Newspaper
const btnNewspaper = document.getElementById("btn-newspaper");
const newspaperModal = document.getElementById("newspaper-modal");
const closeNewspaper = document.getElementById("close-newspaper");

const enableDebugCheckbox = document.getElementById("enableDebug");
const debugLogs = document.getElementById("sidebarLogs"); 

// -------------------- TAB SYSTEM LOGIC --------------------
let tabs = [];
let activeTabId = null;
let tabCounter = 0;

// Force the iframe container to be a column so tabs sit horizontally on top
iframeContainer.style.display = "flex";
iframeContainer.style.flexDirection = "column";

// Create the horizontal Tab Bar directly inside the top of the iframe container
const tabBar = document.createElement("div");
tabBar.id = "router-tab-bar";
tabBar.style.cssText = "display: flex; flex-direction: row; padding: 8px 8px 0 8px; gap: 4px; overflow-x: auto; border-bottom: 1px solid #ccc; background: rgba(0,0,0,0.05); width: 100%; box-sizing: border-box; flex-shrink: 0;";
iframeContainer.insertBefore(tabBar, iframeContainer.firstChild);

// Remove the hardcoded initial iframe, we'll spawn them dynamically
if (iframe) iframe.remove();

function createNewTab(url = "about:blank", title = "New Tab") {
    tabCounter++;
    const tabId = `tab-${tabCounter}`;

    // 1. Create the Chrome-like Tab Button
    const tabBtn = document.createElement("div");
    tabBtn.className = "router-tab";
    tabBtn.style.cssText = "padding: 8px 12px; background: #e8eaed; border-radius: 8px 8px 0 0; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; font-family: sans-serif; min-width: 120px; max-width: 200px; border: 1px solid #ccc; border-bottom: none; flex-shrink: 0;";
    
    tabBtn.innerHTML = `
        <span class="tab-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${title}</span>
        <span class="close-tab-btn" style="cursor: pointer; font-size: 16px; color: #555; padding: 0 4px; border-radius: 50%; line-height: 1;">&times;</span>
    `;

    // 2. Create the unique Iframe for this tab
const newEngineFrame = document.createElement("iframe");
newEngineFrame.id = `iframe-${tabId}`;
// Flex-grow makes it fill the remaining space under the horizontal tab bar
newEngineFrame.style.cssText = "width: 100%; flex-grow: 1; border: none; display: none; background: #fff;";
newEngineFrame.setAttribute("sandbox", "allow-scripts allow-forms allow-popups allow-same-origin allow-pointer-lock allow-presentation");
newEngineFrame.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; gamepad");
newEngineFrame.allowFullscreen = true;
    
    // Add to DOM
    tabBar.appendChild(tabBtn);
    iframeContainer.appendChild(newEngineFrame);

    // Save to our array
    tabs.push({ id: tabId, btn: tabBtn, frame: newEngineFrame });

    // Events
    tabBtn.addEventListener("click", (e) => {
        if (e.target.classList.contains("close-tab-btn")) closeTab(tabId);
        else switchTab(tabId);
    });

    switchTab(tabId);
    if (url !== "about:blank") loadClientRouter(url);
}

function switchTab(tabId) {
    activeTabId = tabId;

    tabs.forEach(tab => {
        if (tab.id === tabId) {
            // Active styling
            tab.btn.style.background = "#fff";
            tab.btn.style.borderBottom = "1px solid #fff";
            tab.btn.style.marginBottom = "-1px";
            tab.btn.style.fontWeight = "bold";
            tab.frame.style.display = "block";
            
            // Re-assign the global 'iframe' variable so your existing code keeps working normally
            iframe = tab.frame; 

            // Update search box
            try {
                let currentSrc = tab.frame.src;
                if (!currentSrc || currentSrc.includes("about:blank")) {
                    searchBox.value = "";
                } else {
                    searchBox.value = new URL(currentSrc).hostname;
                }
            } catch(e) {}
        } else {
            // Inactive styling
            tab.btn.style.background = "#e8eaed";
            tab.btn.style.borderBottom = "none";
            tab.btn.style.marginBottom = "0";
            tab.btn.style.fontWeight = "normal";
            tab.frame.style.display = "none";
        }
    });
}

function closeTab(tabId) {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const tab = tabs[tabIndex];
    tab.btn.remove();
    tab.frame.src = "about:blank"; // Stop audio/video
    tab.frame.remove();
    tabs.splice(tabIndex, 1);

    if (activeTabId === tabId) {
        if (tabs.length > 0) switchTab(tabs[tabs.length - 1].id);
        else {
            activeTabId = null;
            searchBox.value = "";
            createNewTab(); 
        }
    }
}

// Add the + Button inside the gateway form (next to URL bar)
const newTabBtn = document.createElement("button");
newTabBtn.innerHTML = "&#43;"; // Clean + icon
newTabBtn.type = "button";
newTabBtn.style.cssText = "margin-left: 8px; padding: 0 12px; font-size: 20px; cursor: pointer; border-radius: 50%; border: none; background: #e8eaed; color: #555; display: flex; align-items: center; justify-content: center;";
newTabBtn.onclick = () => createNewTab();
form.appendChild(newTabBtn);

// Boot up the first tab
createNewTab();


// -------------------- GATEWAY LOGIC (HYBRID ENGINE UPGRADE) --------------------
function loadClientRouter(url) {
  let safeUrl = url.trim();
  if (!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")) safeUrl = "https://" + safeUrl;

  searchBox.value = new URL(safeUrl).hostname;
  
  // Update Tab Title
  const activeTab = tabs.find(t => t.id === activeTabId);
  if (activeTab) activeTab.btn.querySelector(".tab-title").innerText = new URL(safeUrl).hostname;
  
  // Get the selected Routing Engine (Defaults to UV)
  const engine = routerEngine ? routerEngine.value : 'uv';
  
  if (engine === 'cf' && window.loadViaBackend) {
    // ☁️ CLOUDFLARE ROUTE: Use your original stable load function
    window.loadViaBackend(safeUrl); 
  } else {
    // 🟣 ULTRAVIOLET ROUTE: Push the URL to the engine room
    if(iframe) {
        iframe.src = "client.html?engine=" + engine + "&url=" + encodeURIComponent(safeUrl); 
    }
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadClientRouter(searchBox.value);
});

fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) iframeContainer.requestFullscreen().catch(e => console.log(e));
  else document.exitFullscreen();
});

hamburgerBtn.addEventListener("click", () => sidebar.classList.add("open"));
closeSidebarBtn.addEventListener("click", () => sidebar.classList.remove("open"));

// Shortcuts (Directly modifies active iframe, exactly like original code)
btnGoogle.addEventListener("click", () => { 
    if(iframe) iframe.src = "https://www.google.com/webhp?igu=1"; 
    searchBox.value = "google.com"; 
    const activeTab = tabs.find(t => t.id === activeTabId);
    if(activeTab) activeTab.btn.querySelector(".tab-title").innerText = "Google";
});

btnHaha.addEventListener("click", () => { 
    if(iframe) iframe.src = "https://www.hahagames.com"; 
    searchBox.value = "hahagames.com"; 
    const activeTab = tabs.find(t => t.id === activeTabId);
    if(activeTab) activeTab.btn.querySelector(".tab-title").innerText = "Haha Games";
});

// -------------------- NEWSPAPER --------------------
function openNewspaper() {
    newspaperModal.classList.remove("hidden");
    sidebar.classList.remove("open");
}

if(btnNewspaper) btnNewspaper.addEventListener("click", openNewspaper);
if(closeNewspaper) closeNewspaper.addEventListener("click", () => newspaperModal.classList.add("hidden"));

// Auto-show
const lastSeenNews = localStorage.getItem("roogle_newspaper_version");
if (lastSeenNews !== NEWSPAPER_VERSION) {
    setTimeout(() => {
        openNewspaper();
        localStorage.setItem("roogle_newspaper_version", NEWSPAPER_VERSION);
    }, 1000);
}

// -------------------- RANK INVENTORY --------------------
if(btnChangeRank) {
    btnChangeRank.addEventListener("click", () => {
        if (!currentUser) return;
        rankModal.classList.remove("hidden");
        renderRankInventory();
    });
}
if(closeRankModal) {
    closeRankModal.addEventListener("click", () => rankModal.classList.add("hidden"));
}

function renderRankInventory() {
  rankList.innerHTML = "";
  
  const defaultRank = getRank(currentUser.logins);
  const defBtn = document.createElement("div");
  defBtn.style.cssText = "padding:10px; border:1px solid #ddd; border-radius:5px; cursor:pointer; background:#f9f9f9; margin-bottom:5px;";
  defBtn.innerHTML = `<strong>${defaultRank.name} (Default)</strong>`;
  defBtn.onclick = () => equipRank(null);
  rankList.appendChild(defBtn);

  if (currentUser.rankInventory && Array.isArray(currentUser.rankInventory)) {
    currentUser.rankInventory.forEach((r) => {
      const item = document.createElement("div");
      item.style.cssText = `padding:10px; border:1px solid #ddd; border-radius:5px; cursor:pointer; background:${r.color}; color:white; margin-top:5px; text-shadow:0 1px 2px black;`;
      if(r.font) item.style.fontFamily = r.font;
      if(r.border) item.style.border = r.border;

      item.innerHTML = `<strong>${r.name}</strong>`;
      item.onclick = () => equipRank(r);
      rankList.appendChild(item);
    });
  }
}

async function equipRank(rankObj) {
  currentUser.customRank = rankObj;
  await apiCall(`roogle_user_${currentUser.username}`, "POST", currentUser);
  loginUser(currentUser); 
  rankModal.classList.add("hidden");
}

// -------------------- FONT INVENTORY (UPDATED) --------------------
if(btnChangeFont) {
    btnChangeFont.addEventListener("click", () => {
        if (!currentUser) return;
        fontModal.classList.remove("hidden");
        renderFontInventory();
    });
}
if(closeFontModal) {
    closeFontModal.addEventListener("click", () => fontModal.classList.add("hidden"));
}

function renderFontInventory() {
    fontList.innerHTML = "";
    
    // 1. Default Option (Reset)
    const def = document.createElement("div");
    def.style.cssText = "padding:10px; border:1px solid #ddd; cursor:pointer; background:#f9f9f9; margin-bottom:10px; text-align:center; border-radius:5px;";
    def.innerHTML = "<strong>Default Sans (Reset)</strong>";
    def.onclick = () => equipFont(null, null);
    fontList.appendChild(def);

    // 2. Filter Owned Fonts
    const fontItems = currentUser.rankInventory.filter(i => i.font);
    
    if(fontItems.length === 0) {
        fontList.innerHTML += "<p style='text-align:center; color:#666; font-size:12px;'>No fonts owned.<br>Buy 'Matrix Mode' or bundles in Shop.</p>";
        return;
    }

    // 3. Render Each Font with Color Options
    fontItems.forEach(i => {
        const wrapper = document.createElement("div");
        wrapper.style.cssText = "border:1px solid #ddd; margin-top:8px; padding:10px; border-radius:6px; background:white; box-shadow:0 1px 3px rgba(0,0,0,0.05);";
        
        // Title
        const title = document.createElement("div");
        title.innerHTML = `<strong>${i.name}</strong>`;
        title.style.marginBottom = "8px";
        title.style.fontSize = "13px";
        title.style.borderBottom = "1px solid #eee";
        title.style.paddingBottom = "4px";
        wrapper.appendChild(title);

        // Option A: Font Only (Standard Color - Black)
        const btnDef = document.createElement("button");
        btnDef.textContent = `Equip Font (Standard Black)`;
        btnDef.style.cssText = `display:block; width:100%; padding:6px; margin-bottom:6px; cursor:pointer; font-family:${i.font}; background:#f1f1f1; border:1px solid #ccc; border-radius:4px; font-size:12px;`;
        btnDef.onclick = () => equipFont(i.font, null); 
        wrapper.appendChild(btnDef);

        // Option B: Font + Special Color (if exists)
        if (i.color) {
            const btnCol = document.createElement("button");
            btnCol.textContent = `Equip Font + ${i.color} Color`;
            btnCol.style.cssText = `display:block; width:100%; padding:6px; cursor:pointer; font-family:${i.font}; color:${i.color}; font-weight:bold; background:#fff; border:1px solid ${i.color}; border-radius:4px; font-size:12px;`;
            btnCol.onclick = () => equipFont(i.font, i.color);
            wrapper.appendChild(btnCol);
        }

        fontList.appendChild(wrapper);
    });
}

async function equipFont(fontName, colorCode) {
    if (!currentUser.customRank) {
       let currentVisuals = getRank(currentUser.logins);
       currentUser.customRank = { name: currentVisuals.name }; 
    }
    
    // Set Font
    if (fontName) currentUser.customRank.font = fontName;
    else delete currentUser.customRank.font;

    // Set Color (Null means Standard Black)
    if (colorCode) currentUser.customRank.color = colorCode;
    else delete currentUser.customRank.color; 

    await apiCall(`roogle_user_${currentUser.username}`, "POST", currentUser);
    loginUser(currentUser);
    fontModal.classList.add("hidden");
}

// -------------------- LEADERBOARD --------------------
const leaderboardModal = document.getElementById("leaderboard-modal");
const leaderboardList = document.getElementById("leaderboard-list");
const closeLeaderboard = document.getElementById("close-leaderboard");

btnLeaderboard.addEventListener("click", async () => {
  leaderboardModal.classList.remove("hidden");
  sidebar.classList.remove("open");
  leaderboardList.innerHTML = "<p>Loading...</p>";
  
  const res = await apiCall("leaderboard-data", "GET");
  if (!res || res.length === 0) {
    leaderboardList.innerHTML = "<p style='text-align:center;'>No users yet.</p>";
    return;
  }

  // Deduplicate
  const uniqueMap = {};
  res.forEach(u => {
      if (!uniqueMap[u.username] || (u.logins > uniqueMap[u.username].logins)) {
          uniqueMap[u.username] = u;
      }
  });
  const users = Object.values(uniqueMap).sort((a, b) => (b.logins || 0) - (a.logins || 0));

  leaderboardList.innerHTML = "<ol style='padding-left:20px;'></ol>"; 
  const list = leaderboardList.querySelector("ol");
  
  users.forEach((user, index) => {
     let r = getRank(user.logins || 0);
     let custom = user.customRank;
     
     let pfpHtml = `<div style="display:inline-block; width:24px; height:24px; border-radius:50%; background:#ccc; vertical-align:middle; margin-right:8px; overflow:hidden;"></div>`;
     if (user.pfp) {
         pfpHtml = `<div style="display:inline-block; width:24px; height:24px; border-radius:50%; background-image:url(${user.pfp}); background-size:cover; vertical-align:middle; margin-right:8px;"></div>`;
     }
     
     // --- NAME STYLE LOGIC ---
     let nameStyle = "font-weight:bold;";
     if (custom) {
         if (custom.color) nameStyle += `color:${custom.color};`;
         if (custom.font) nameStyle += `font-family:${custom.font};`;
     }

     // --- BADGE STYLE LOGIC ---
     let badgeName = custom ? custom.name : r.name;
     let badgeColor = (custom && custom.color) ? custom.color : r.color;
     let badgeFont = (custom && custom.font) ? custom.font : 'inherit';

     let rankDisplay = `#${index + 1}`;
     let rowStyle = "margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:5px;";
     if (index === 0) { rankDisplay = "🥇"; rowStyle += " background:#fff9c4; border-radius:4px; padding:5px;"; }
     else if (index === 1) { rankDisplay = "🥈"; }
     else if (index === 2) { rankDisplay = "🥉"; }

     list.innerHTML += `<li style="${rowStyle} list-style:none;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
           <div style="display:flex; align-items:center;">
             <span style="width:30px; font-weight:bold; text-align:center;">${rankDisplay}</span>
             ${pfpHtml} 
             <strong style="${nameStyle}">${user.username}</strong>
           </div>
           <div style="text-align:right;">
             <span style="font-size:12px; font-weight:bold; color:#1a73e8;">Logins: ${user.logins || 0}</span><br>
             <span style="font-size:10px; padding:2px 4px; border-radius:3px; background:${badgeColor}; color:white; font-family:${badgeFont};">${badgeName}</span>
           </div>
        </div>
     </li>`;
  });
});
closeLeaderboard.addEventListener("click", () => leaderboardModal.classList.add("hidden"));

// -------------------- SHOP SYSTEM --------------------
const shopModal = document.getElementById("shop-modal");
const closeShop = document.getElementById("close-shop");

function getCurrentWeekIndex() {
    const now = Date.now();
    const timePassed = now - SEASON_START_DATE;
    const weeksPassed = Math.floor(timePassed / MS_PER_WEEK);
    return (weeksPassed + SEASON_WEEK_OFFSET) % SHOP_POOLS.length;
}

function updateShopTimer() {
    const timerElem = document.getElementById("shop-timer");
    if(!timerElem) return;

    const now = Date.now();
    const timePassed = now - SEASON_START_DATE;
    const nextRotation = (Math.floor(timePassed / MS_PER_WEEK) + 1) * MS_PER_WEEK + SEASON_START_DATE;
    const timeLeft = nextRotation - now;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    timerElem.textContent = `${days}d ${hours}h ${minutes}m`;
}

function renderShop() {
    const container = document.getElementById("shop-items-container");
    if (!container) return;

    container.innerHTML = "";
    const weekIndex = getCurrentWeekIndex();
    const currentItems = SHOP_POOLS[weekIndex];

    currentItems.forEach(item => {
        const div = document.createElement("div");
        div.className = "shop-item";
        div.style.cssText = "border:1px solid #eee; padding:10px; border-radius:8px; text-align:center; display:flex; flex-direction:column; justify-content:space-between;";

        div.innerHTML = `
            <div>
                <div style="font-size:30px; ${item.border ? 'border:'+item.border+'; display:inline-block; padding:2px;' : ''} ${item.color ? 'color:'+item.color : ''}">
                    ${item.icon || '📦'}
                </div>
                <strong style="display:block; margin-top:5px; ${item.font ? 'font-family:'+item.font : ''}">${item.name}</strong>
                <p style="font-size:10px; color:#555; margin-bottom:5px;">${item.desc || ''}</p>
            </div>
            <div>
                <p style="color:#1a73e8; font-weight:bold;">${item.cost} Pts</p>
                <button class="btn-buy" style="width:100%; background:#1a73e8; color:white; border:none; padding:6px; border-radius:4px; cursor:pointer; margin-top:5px;">Buy</button>
            </div>
        `;

        div.querySelector(".btn-buy").onclick = () => buyRankGeneric(item);
        container.appendChild(div);
    });
}

// --- FIXED BUY FUNCTION FOR SPECIAL NAMES ---
async function buyRankGeneric(item) {
    if (!currentUser) return alert("Please sign in.");
    if ((currentUser.points || 0) < item.cost) return alert("Not enough points!");

    let inventory = currentUser.rankInventory || [];
    
    // FIX: Check for special rank name (e.g. V3 Pioneer) OR default to item name
    const finalName = item.rankName || item.name;

    // Check if they already own it
    if (inventory.some(i => i.name === finalName)) return alert("You already own this!");

    if (!confirm(`Buy "${item.name}" for ${item.cost} points?`)) return;

    currentUser.points -= item.cost;
    
    let newItem = { 
        name: finalName, // Use the correct name here
        color: item.color,
        font: item.font,    
        border: item.border 
    };

    currentUser.rankInventory.push(newItem);
    currentUser.customRank = newItem; // Auto-equip

    const res = await apiCall(`roogle_user_${currentUser.username}`, "POST", currentUser);
    
    if (res && res.success) {
        alert("Purchased!");
        loginUser(currentUser);
        openShop(); 
    } else {
        alert("Error saving.");
    }
}

function openShop() {
    shopModal.classList.remove("hidden");
    sidebar.classList.remove("open");
    if(currentUser) document.getElementById("shop-points-display").textContent = currentUser.points || 0;
}

if(btnShopSidebar) btnShopSidebar.addEventListener("click", openShop);
if(btnShopMenu) btnShopMenu.addEventListener("click", openShop);
closeShop.addEventListener("click", () => shopModal.classList.add("hidden"));

renderShop(); 
setInterval(updateShopTimer, 1000); 
updateShopTimer();