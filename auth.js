// -------------------- AUTH ELEMENTS --------------------
const authBtn = document.getElementById("auth-btn");
const userProfile = document.getElementById("user-profile");
const userAvatar = document.getElementById("user-avatar");
const userDropdown = document.getElementById("user-dropdown");
const pfpInput = document.getElementById("pfp-input");

const authModal = document.getElementById("auth-modal");
const closeModal = document.getElementById("close-modal");
const authForm = document.getElementById("auth-form");
const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");
const modalSubmitBtn = document.getElementById("modal-submit-btn");
const modalTitle = document.getElementById("modal-title");
const switchMode = document.getElementById("switch-mode");
const switchMsg = document.getElementById("switch-msg");
const authError = document.getElementById("auth-error");

const btnClaimPoints = document.getElementById("btn-claim-points");
const claimTimerTxt = document.getElementById("claim-timer");
const btnChangePfp = document.getElementById("change-pfp-btn");

// -------------------- BANNED WORDS (ENHANCED + API) --------------------
async function isUsernameBanned(username) {
    const lower = username.toLowerCase();
    
    // 1. LOCAL CHECKS (Fast & Free)
    // A. Advanced Regex
    const patterns = [
        /n+[i1l|]+g+[e3a4]+r+/i, 
        /f+[a4@]+g+[o0]+t+/i,      
        /r+[e3]+t+[a4@]+r+[d]+/i, 
        /k+[y]+s+/i,              
        /n+[a4@]+z+[i1l]+/i,
        /h+[i1l]+t+l+[e3]+r+/i,
        /p+[e3]+d+[o0]+/i
    ];
    for (let pattern of patterns) { if (pattern.test(lower)) return true; }

    // B. Asian Languages (Chinese, Japanese, Korean)
    const asianChars = [
        "傻逼", "肏", "妈的", "混蛋", "滚", "垃圾", "笨蛋", "去死", 
        "死ね", "殺す", "馬鹿", "畜生", "くたばれ", "雑魚", "痴漢",
        "시발", "개새끼", "병신", "지랄"
    ];
    for (let char of asianChars) { if (username.includes(char)) return true; }

    // C. Global Blocklist
    const bannedTerms = [
        "hitler", "stalin", "fabdaman", "admin", "mod", "system",
        "whore", "slut", "bitch", "cunt", "dick", "cock", "pussy", "rape", "incest",
        "cao ni ma", "nmsl", "shabi", "cnm", "sb",
        "shine", "kuso", "baka", "hentai",
        "shibal", "saekki",
        "puta", "puto", "mierda", "carajo", "pendejo", "verga", "buceta", "fodase",
        "blyat", "cyka", "suka", "kurwa", "pizda", "chuj",
        "tangina", "gago", "bobo", "putang"
    ];
    for (let term of bannedTerms) { if (lower.includes(term)) return true; }

    // 2. PURGOMALUM API (The "Double Check")
    try {
        const res = await fetch(`https://www.purgomalum.com/service/containsprofanity?text=${encodeURIComponent(username)}`);
        const isProfane = await res.text();
        if (isProfane === 'true') return true;
    } catch (e) {
        console.warn("Profanity API failed, allowing user (fallback).");
    }
    
    return false;
}

// -------------------- AUTH LOGIC --------------------
userProfile.addEventListener("click", (e) => {
  e.stopPropagation();
  userDropdown.classList.toggle("hidden");
  if(!userDropdown.classList.contains("hidden")) updateClaimUI();
});
document.addEventListener("click", () => {
  if (!userDropdown.classList.contains("hidden")) userDropdown.classList.add("hidden");
});

authBtn.addEventListener("click", () => {
  authModal.classList.remove("hidden");
  isSignupMode = false;
  updateModalUI();
});
closeModal.addEventListener("click", () => { authModal.classList.add("hidden"); authError.textContent = ""; });
switchMode.addEventListener("click", (e) => { e.preventDefault(); isSignupMode = !isSignupMode; updateModalUI(); });

function updateModalUI() {
  authError.textContent = "";
  if (isSignupMode) {
    modalTitle.textContent = "Create Account";
    modalSubmitBtn.textContent = "Sign Up";
    switchMsg.textContent = "Already have an account?";
    switchMode.textContent = "Sign In";
  } else {
    modalTitle.textContent = "Sign In";
    modalSubmitBtn.textContent = "Sign In";
    switchMsg.textContent = "New to Roogle?";
    switchMode.textContent = "Create Account";
  }
}

// LOGIN / SIGNUP SUBMIT
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const u = authUsername.value.trim();
  const p = authPassword.value.trim();
  
  if (!u || !p) return;
  modalSubmitBtn.textContent = "Processing...";
  const endpoint = `roogle_user_${u}`;
  
  if (isSignupMode) {
    if (await isUsernameBanned(u)) {
        await new Promise(r => setTimeout(r, 800)); 
        authError.textContent = "Error: 500 (Internal Code Error). Contact Support.";
        modalSubmitBtn.textContent = "Sign Up";
        return; 
    }
    const check = await apiCall(endpoint, "GET");
    if (check) {
      authError.textContent = "Username taken.";
      modalSubmitBtn.textContent = "Sign Up";
      return;
    }
    const newUser = {
      password: btoa(p),
      logins: 1,
      points: 0,
      pfp: null,
      links: [],
      rank: "Bronze",
      customRank: null,
      lastClaimTime: 0,
      rankInventory: [] 
    };
    const res = await apiCall(endpoint, "POST", newUser);
    if (res && res.success) {
      loginUser({ username: u, ...newUser });
      authModal.classList.add("hidden");
    } else {
      authError.textContent = "Sign up failed.";
    }
  } else {
    const data = await apiCall(endpoint, "GET");
    if (!data) {
      authError.textContent = "User not found.";
    } else {
      const encodedPass = btoa(p);
      if (data.password === p || data.password === encodedPass) {
          data.logins = (data.logins || 0) + 1;
          await apiCall(endpoint, "POST", data);
          loginUser({ username: u, ...data });
          authModal.classList.add("hidden");
      } else {
          authError.textContent = "Incorrect password.";
      }
    }
  }
  modalSubmitBtn.textContent = isSignupMode ? "Sign Up" : "Sign In";
});

// MAIN LOGIN FUNCTION
function loginUser(user) {
  currentUser = user;

  // Fix JSON string issue
  if (typeof currentUser.rankInventory === 'string') {
      try { currentUser.rankInventory = JSON.parse(currentUser.rankInventory); } 
      catch (e) { currentUser.rankInventory = []; }
  }
  if (!Array.isArray(currentUser.rankInventory)) currentUser.rankInventory = [];

  // --- NEW: SAFE LANDING PATCH FOR FRIENDS/INBOX ---
  if (!currentUser.friends) currentUser.friends = [];
  if (!currentUser.inbox) currentUser.inbox = [];

  authBtn.classList.add("hidden");
  userProfile.classList.remove("hidden");
  
  document.getElementById("dropdown-username").textContent = user.username;
  document.getElementById("menu-logins").textContent = user.logins || 0;
  document.getElementById("menu-points").textContent = user.points || 0;
  document.getElementById("shop-points-display").textContent = user.points || 0;

  // --- RANK LOGIC UPDATE ---
  let baseRank = getRank(user.logins);
  let custom = user.customRank; 

  // 1. Badge
  const rankBadge = document.getElementById("dropdown-rank");
  rankBadge.textContent = custom ? custom.name : baseRank.name;
  rankBadge.style.backgroundColor = (custom && custom.color) ? custom.color : baseRank.color;
  rankBadge.style.border = (custom && custom.border) ? custom.border : (baseRank.border || "none");
  
  // 2. Global Font
  if (custom && custom.font) {
      document.body.style.fontFamily = custom.font;
      rankBadge.style.fontFamily = custom.font;
      document.getElementById("dropdown-username").style.fontFamily = custom.font;
  } else {
      document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      rankBadge.style.fontFamily = "inherit";
      document.getElementById("dropdown-username").style.fontFamily = "inherit";
  }

  // 3. Username Color
  if (custom && custom.color) {
      document.getElementById("dropdown-username").style.color = custom.color;
  } else {
      document.getElementById("dropdown-username").style.color = "inherit";
  }

  if (user.pfp) {
    userAvatar.textContent = "";
    userAvatar.style.backgroundImage = `url(${user.pfp})`;
    userAvatar.style.backgroundSize = "cover";
  } else {
    userAvatar.textContent = user.username[0].toUpperCase();
    userAvatar.style.backgroundImage = "none";
  }
  
  renderQuickLinks();
  updateClaimUI(); 
  
  if(typeof apiCall === 'function') apiCall("market/resolve-bets", "GET");
}

// -------------------- CLAIM SYSTEM --------------------
function calculateClaimAmount(user) {
    if (user.customRank) return 25; 
    if (user.logins >= 1000) return 20; 
    if (user.logins >= 200) return 15;  
    if (user.logins >= 25) return 10;   
    return 5; 
}

function updateClaimUI() {
    if (!currentUser) return;
    const now = Date.now();
    const lastClaim = currentUser.lastClaimTime || 0;
    const diff = now - lastClaim;
    const amount = calculateClaimAmount(currentUser);

    if (diff >= CLAIM_COOLDOWN) {
        btnClaimPoints.style.background = "#34a853";
        btnClaimPoints.style.cursor = "pointer";
        btnClaimPoints.disabled = false;
        btnClaimPoints.textContent = `Claim (+${amount})`;
        claimTimerTxt.style.display = "none";
    } else {
        btnClaimPoints.style.background = "#ccc";
        btnClaimPoints.style.cursor = "not-allowed";
        btnClaimPoints.disabled = true;
        btnClaimPoints.textContent = "Claimed";
        
        const remaining = CLAIM_COOLDOWN - diff;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        claimTimerTxt.textContent = `Wait ${hours}h ${minutes}m`;
        claimTimerTxt.style.display = "block";
    }
}

btnClaimPoints.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    const now = Date.now();
    if ((now - (currentUser.lastClaimTime || 0)) < CLAIM_COOLDOWN) return;

    const amount = calculateClaimAmount(currentUser);
    currentUser.points = (currentUser.points || 0) + amount;
    currentUser.lastClaimTime = now; 

    btnClaimPoints.textContent = "Claiming...";
    
    const res = await apiCall(`roogle_user_${currentUser.username}`, "POST", currentUser);
    if (res && res.success) {
        document.getElementById("menu-points").textContent = currentUser.points;
        updateClaimUI();
    } else {
        alert("Claim failed. Server error.");
        currentUser.points -= amount; 
        updateClaimUI();
    }
});

setInterval(() => {
    if (currentUser && !userDropdown.classList.contains("hidden")) updateClaimUI();
}, 60000);

document.getElementById("signout-btn").addEventListener("click", () => location.reload());

// -------------------- QUICK LINKS --------------------
const quickLinksList = document.getElementById("quick-links-list");
const addLinkBtn = document.getElementById("add-link-btn");
const newLinkTitle = document.getElementById("new-link-title");
const newLinkUrl = document.getElementById("new-link-url");

function normalizeUrl(url) {
  url = url.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
  return url;
}

function renderQuickLinks() {
  quickLinksList.innerHTML = "";
  if (!currentUser || !currentUser.links) return;
  currentUser.links.forEach((link, index) => {
    const div = document.createElement("div");
    div.className = "quick-link-item";
    const displayTitle = link.title || link.name || "Untitled";
    const span = document.createElement("span");
    span.textContent = displayTitle;
    span.onclick = () => {
        const safeUrl = normalizeUrl(link.url);
        const ifr = document.getElementById("innerProxyFrame");
        const sbox = document.getElementById("url");
        if(ifr) ifr.src = safeUrl; 
        if(sbox) sbox.value = new URL(safeUrl).hostname;
        const sb = document.getElementById("sidebar");
        if(window.innerWidth < 800 && sb) sb.classList.remove("open");
    };
    const del = document.createElement("button");
    del.innerHTML = "&times;";
    del.onclick = async (e) => {
      e.stopPropagation();
      currentUser.links.splice(index, 1);
      renderQuickLinks();
      await apiCall(`roogle_user_${currentUser.username}`, "POST", currentUser);
    };
    div.appendChild(span);
    div.appendChild(del);
    quickLinksList.appendChild(div);
  });
}
addLinkBtn.addEventListener("click", async () => {
  if (!currentUser) return alert("Please sign in to save links.");
  const title = newLinkTitle.value.trim();
  let url = newLinkUrl.value.trim();
  if (!title || !url) return;
  url = normalizeUrl(url);
  if (!currentUser.links) currentUser.links = [];
  currentUser.links.push({ title, url });
  newLinkTitle.value = "";
  newLinkUrl.value = "";
  renderQuickLinks();
  await apiCall(`roogle_user_${currentUser.username}`, "POST", currentUser);
});

// PFP
if (btnChangePfp) {
    btnChangePfp.addEventListener("click", (e) => {
        if (currentUser) pfpInput.click();
    });
}
pfpInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(evt) {
    const base64 = evt.target.result;
    currentUser.pfp = base64;
    userAvatar.style.backgroundImage = `url(${base64})`;
    await apiCall(`roogle_user_${currentUser.username}`, "POST", currentUser);
  };
  reader.readAsDataURL(file);
});