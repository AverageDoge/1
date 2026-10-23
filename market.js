// -------------------- ROOGLE MARKET v5.3 (TRUE BATCHING FIXED) --------------------

// Inject Modal if missing
if (!document.getElementById("market-modal")) {
    const div = document.createElement("div");
    div.innerHTML = `
    <div id="market-modal" class="modal hidden">
        <style>
            /* --- LAYOUT & ANIMATIONS --- */
            .market-layout {
                display: grid;
                grid-template-columns: 1fr 260px; /* Main Content | Sidebar */
                gap: 15px;
                height: 500px;
            }
            
            /* --- LEFT SIDE: WHEEL & FORMS --- */
            .market-main { overflow-y: auto; padding-right: 5px; }

            .jackpot-box {
                background: linear-gradient(135deg, #fce38a 0%, #f38181 100%);
                border: 1px solid #e0c980; border-radius: 8px; padding: 10px;
                text-align: center; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }

            .wheel-container {
                display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px;
                background: #f1f3f4; padding: 10px; border-radius: 8px; border: 1px solid #ddd;
            }
            .wheel-item {
                background: white; border: 2px solid #eee; border-radius: 6px; padding: 8px 4px;
                text-align: center; font-size: 11px; font-weight: bold; color: #555;
                transition: all 0.2s; display:flex; flex-direction:column; justify-content:center; align-items:center;
                height: 55px;
            }
            .wheel-item.active {
                background: #fff3cd; border-color: #ffc107; transform: scale(1.05); box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                z-index: 10;
            }
            .wheel-item.win-anim { animation: winPulse 0.5s ease infinite alternate; }
            @keyframes winPulse { from { border-color: gold; } to { border-color: red; } }

            /* --- RIGHT SIDE: LIVE FEED (CHAT STYLE) --- */
            .market-sidebar {
                background: #f8f9fa;
                border-left: 1px solid #eee;
                display: flex; flex-direction: column;
                border-radius: 8px;
                overflow: hidden;
            }
            .feed-header {
                background: #202124; color: white; padding: 10px; font-size: 12px; font-weight: bold;
                text-align: center; display: flex; align-items: center; justify-content: center; gap: 5px;
            }
            .live-dot { height: 8px; width: 8px; background-color: #00e676; border-radius: 50%; display: inline-block; }
            
            .feed-content {
                flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px;
                background-color: #fff;
            }
            
            .feed-item {
                background: white; border: 1px solid #eee; border-radius: 6px; padding: 8px;
                font-size: 11px; color: #333; position: relative;
                animation: slideIn 0.3s ease-out forwards;
                box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            }
            .feed-item.mine { border-left: 3px solid #1a73e8; background: #f1f8ff; }
            .feed-item.win { border-left: 3px solid #34a853; background: #e6f4ea; }
            .feed-item.loss { border-left: 3px solid #d93025; }
            .feed-item.spin { border-left: 3px solid #fbbc04; }
            .feed-item.ticket { border-left: 3px solid #ea4335; }
            .feed-item strong { font-weight: 700; color: #000; }
            .feed-time { font-size: 9px; color: #999; float: right; margin-top: 2px; }

            @keyframes slideIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* HIDE SCROLLBARS */
            .feed-content::-webkit-scrollbar { width: 4px; }
            .feed-content::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        </style>

        <div class="modal-content" style="width: 750px; max-width: 95%;">
            <span id="close-market" class="close">&times;</span>
            <h2 style="text-align: center; margin-bottom: 15px;">🏪 Roogle Market</h2>
            
            <div class="market-layout">
                
                <div class="market-main">
                    
                    <div style="border-bottom: 1px solid #eee; margin-bottom: 15px; padding-bottom: 10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                            <h3 style="margin:0; font-size:14px;">🎡 Spin & Win</h3>
                            <span style="font-size:10px; color:#555;">Cost: 100 Pts</span>
                        </div>
                        
                        <div class="wheel-container" id="wheel-grid">
                            <div class="wheel-item" id="w-0">25 pts<br><span style="font-size:9px; color:#999;">(Loss)</span></div>
                            <div class="wheel-item" id="w-1">100 pts<br><span style="font-size:9px; color:#888;">(Refund)</span></div>
                            <div class="wheel-item" id="w-2" style="border-color:#ff5722; color:#ff5722;">WHEELER<br><span style="font-size:9px;">(Rank)</span></div>
                            <div class="wheel-item" id="w-3" style="border-color:#ffd700; color:#b8860b;">GAMBLER<br><span style="font-size:9px;">(Rank)</span></div>
                            <div class="wheel-item" id="w-4">200 pts<br><span style="font-size:9px; color:green;">(Win)</span></div>
                            <div class="wheel-item" id="w-5" style="background:#e8f0fe; color:#1a73e8;">500 pts<br><span style="font-size:9px;">(Jackpot)</span></div>
                        </div>
                        <button id="btn-spin-wheel" style="width:100%; padding:8px; background:#ff9800; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; font-size:13px;">
                            SPIN WHEEL (100 Pts)
                        </button>
                    </div>

                    <div class="jackpot-box">
                        <h3 style="margin:0; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">🎰 Roogle Jackpot</h3>
                        <div style="font-size: 24px; font-weight: bold; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.3); margin: 5px 0;">
                            <span id="lottery-pot">Loading...</span> </div>
                        <div id="lottery-timer" style="color: #fff; font-size: 12px; margin-bottom: 5px; font-weight:bold; text-shadow: 0 1px 1px rgba(0,0,0,0.2);">
                            Next Draw: --:--:--
                        </div>
                        <button id="btn-buy-ticket" style="background:white; color:#d93025; border:none; padding:6px 14px; border-radius:20px; font-weight:bold; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.2); font-size:12px;">
                            Buy Ticket (3 Pts)
                        </button>
                        <div id="lottery-msg" style="font-size:11px; color:#fff; font-weight:bold; margin-top:5px; min-height:15px;"></div>
                    </div>

                    <div style="background:#f8f9fa; padding:15px; border-radius:8px; border:1px solid #eee;">
                        <h3 style="margin-top:0; font-size:14px;">📈 Place Prediction</h3>
                        
                        <div class="autocomplete-container">
                            <input type="text" id="market-target" placeholder="Target User (e.g. AverageGael)" autocomplete="off" style="width:100%; margin-bottom:10px; padding:6px;">
                            <div id="market-suggestions" class="autocomplete-list"></div>
                        </div>

                        <select id="market-type" style="width:100%; margin-bottom:10px; padding:6px; background:white; border:1px solid #ccc; border-radius:4px;">
                            <optgroup label="Rank Predictions">
                                <option value="RANK_1">👑 The Champion (#1 Only) - 5x Payout</option>
                                <option value="TOP_3">🥉 The Podium (Top 3) - 3x Payout</option>
                                <option value="TOP_5" selected>🔥 The Standard (Top 5) - 2x Payout</option>
                                <option value="TOP_10">🛡️ Safety Net (Top 10) - 1.2x Payout</option>
                            </optgroup>
                            <optgroup label="Activity & Rivals">
                                <option value="LOGIN_GAIN">💪 The Grinder (Gain +50 Logins) - Win +50 Pts</option>
                                <option value="RIVAL_BET">⚔️ Head-to-Head (I beat Target) - Win +50 Pts</option>
                            </optgroup>
                        </select>
                        <p id="bet-helper-text" style="font-size:11px; color:#1a73e8; margin-top:-5px; margin-bottom:10px;">Bet that target will be in the Top 5.</p>

                        <div style="display:flex; gap:5px;">
                            <input type="number" id="market-wager" placeholder="Wager (Min 50)" style="flex:1; padding:6px;">
                            <button id="btn-place-bet" style="flex:1; background:#1a73e8; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Place Bet</button>
                        </div>
                        <p id="market-status" style="text-align:center; font-size:12px; margin-top:5px; height:18px;"></p>
                    </div>

                    <h4 style="margin:15px 0 5px 0; font-size:13px;">My Active Bets</h4>
                    <div id="market-bets-list" style="max-height:100px; overflow-y:auto; background:#fff; border:1px solid #eee; padding:5px; border-radius:4px;">
                        <p style="text-align:center; color:#999; font-size:12px;">No active bets.</p>
                    </div>
                </div>

                <div class="market-sidebar">
                    <div class="feed-header">
                        <span class="live-dot"></span> LIVE ACTIVITY
                    </div>
                    <div id="activity-feed" class="feed-content">
                        <div style="text-align:center; color:#999; font-size:11px; padding-top:20px;">
                            Listening for new bets...
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>`;
    document.body.appendChild(div.firstElementChild);
}

const btnMarketSidebar = document.getElementById("btn-market-sidebar");
const btnMarketMenu = document.getElementById("menu-market-btn");
const marketModal = document.getElementById("market-modal");
const closeMarket = document.getElementById("close-market");
const btnPlaceBet = document.getElementById("btn-place-bet");
const marketStatus = document.getElementById("market-status");
const marketBetsList = document.getElementById("market-bets-list");
const inputTarget = document.getElementById("market-target");
const suggestionsBox = document.getElementById("market-suggestions");
const selectType = document.getElementById("market-type");
const helperText = document.getElementById("bet-helper-text");

// New Elements
const lotteryPot = document.getElementById("lottery-pot");
const btnBuyTicket = document.getElementById("btn-buy-ticket");
const lotteryMsg = document.getElementById("lottery-msg");
const lotteryTimer = document.getElementById("lottery-timer");
const feedContainer = document.getElementById("activity-feed");

// NEW: Wheel Elements
const btnSpin = document.getElementById("btn-spin-wheel");
const wheelItems = document.querySelectorAll(".wheel-item");

let nextDrawTimestamp = 0; 
let seenActivityIds = new Set(); 

// Variables for Ticket Batching
let ticketBatchCount = 0;
let ticketBatchTimer = null;

// --- ACTIVITY FEED LOGIC ---
function addFeedItem(html, type = "normal", timeStr = null) {
    if(feedContainer.children.length > 0 && feedContainer.children[0].innerText.includes("Listening")) {
        feedContainer.innerHTML = "";
    }

    const div = document.createElement("div");
    div.className = `feed-item ${type}`;
    
    const displayTime = timeStr || new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    div.innerHTML = `${html} <div class="feed-time">${displayTime}</div>`;
    
    feedContainer.prepend(div);

    if (feedContainer.children.length > 30) {
        feedContainer.lastElementChild.remove();
    }
}

async function fetchActivityFeed() {
    if(!feedContainer) return;
    const res = await apiCall("market/activity", "GET");
    
    if(res && Array.isArray(res) && res.length > 0) {
        const batch = res.reverse(); 
        
        batch.forEach(item => {
            const uniqueId = item.id || `${item.bettor_username}-${item.target_username}-${item.wager_amount}-${item.bet_type}`;

            if (!seenActivityIds.has(uniqueId)) {
                seenActivityIds.add(uniqueId);
                
                // IGNORE MY OWN SERVER MESSAGES (We display local versions for instant feedback/detail)
                if(item.bettor_username === currentUser.username) {
                    return; 
                }
                
                let msg = "";
                let type = "normal";

                // Highlight high value bets/wins
                if (item.wager_amount >= 500) type = "win"; 
                
                if (item.bet_type === "SPIN") {
                      type = "spin";
                      
                      // SERVER STORES WIN AMOUNT IN WAGER_AMOUNT FOR SPINS
                      const winAmt = item.wager_amount;
                      
                      if (winAmt === 0) {
                          msg = `<strong>${item.bettor_username}</strong> won a <strong>RANK</strong> on the Wheel!`;
                          type = "win"; 
                      } else if (winAmt >= 500) {
                          msg = `<strong>${item.bettor_username}</strong> hit the <strong>JACKPOT (${winAmt}pts)</strong>!`;
                          type = "win";
                      } else {
                          msg = `<strong>${item.bettor_username}</strong> won ${winAmt}pts on the Wheel`;
                      }

                } else if (item.bet_type === "TICKET") {
                      type = "ticket";
                      // If 'start_value' is used to store Quantity (depends on server implementation), we could use it.
                      // For now, we assume server logs 1 entry per batch with total cost.
                      // Or if server logged total cost in wager_amount, we can derive tickets (Cost / 3)
                      const cost = item.wager_amount || 3;
                      const tickets = Math.floor(cost / 3);
                      msg = `<strong>${item.bettor_username}</strong> bought ${tickets} ticket${tickets > 1 ? 's' : ''}`;
                
                } else {
                      msg = `<strong>${item.bettor_username}</strong> bet ${item.wager_amount}pts on ${item.target_username}`;
                }

                let serverTime = null;
                if(item.created_at) {
                    serverTime = new Date(item.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
                }

                addFeedItem(msg, type, serverTime);
            }
        });
    }
}

// --- SPIN WHEEL LOGIC ---
if (btnSpin) {
    btnSpin.addEventListener("click", async () => {
        if (!currentUser) return alert("Sign in first.");
        if ((currentUser.points || 0) < 100) return alert("You need 100 points!");

        btnSpin.disabled = true;
        btnSpin.textContent = "Spinning...";

        let speed = 100;
        let activeIdx = 0;
        const spinInterval = setInterval(() => {
            wheelItems.forEach(i => i.classList.remove("active"));
            wheelItems[activeIdx].classList.add("active");
            activeIdx = (activeIdx + 1) % 6;
        }, speed);

        const res = await apiCall("market/spin", "POST", { username: currentUser.username });

        if (res && res.success) {
            currentUser.points = res.newPoints;
            if(document.getElementById("shop-points-display")) document.getElementById("shop-points-display").textContent = res.newPoints;
            if(document.getElementById("menu-points")) document.getElementById("menu-points").textContent = res.newPoints;

            let winIdx = 0; 
            if (res.prize.amount === 100) winIdx = 1;
            else if (res.prize.name === "Wheeler") winIdx = 2;
            else if (res.prize.name === "Gambler") winIdx = 3;
            else if (res.prize.amount === 200) winIdx = 4;
            else if (res.prize.amount === 500) winIdx = 5;

            setTimeout(async () => {
                clearInterval(spinInterval);
                wheelItems.forEach(i => i.classList.remove("active"));
                
                const winnerBox = document.getElementById(`w-${winIdx}`);
                winnerBox.classList.add("active");
                winnerBox.classList.add("win-anim");
                
                // Add to Feed (Detailed Local Version)
                let feedType = "normal";
                let prizeText = "";
                if(res.prize.type === 'RANK') {
                    feedType = "win"; 
                    prizeText = `Won <strong>${res.prize.name} Rank</strong>!`;
                } else if (res.prize.amount >= 200) {
                    feedType = "win";
                    prizeText = `Won <strong>${res.prize.amount} Pts</strong>!`;
                } else if (res.prize.amount === 100) {
                    feedType = "mine";
                    prizeText = "Refunded 100 Pts.";
                } else {
                    feedType = "loss";
                    prizeText = "Lost (25 pts).";
                }
                
                addFeedItem(`You spun the wheel... ${prizeText}`, "spin");

                // Sync Rank
                try {
                    const freshUser = await apiCall(`roogle_user_${currentUser.username}`, "GET");
                    if(freshUser) loginUser(freshUser);
                } catch(e) {}

                setTimeout(() => {
                    winnerBox.classList.remove("win-anim");
                    btnSpin.disabled = false;
                    btnSpin.textContent = "SPIN WHEEL (100 Pts)";
                }, 1000);
            }, 2000);
        } else {
            clearInterval(spinInterval);
            alert(res.error || "Spin failed.");
            btnSpin.disabled = false;
            btnSpin.textContent = "SPIN WHEEL (100 Pts)";
        }
    });
}

// --- PLACE BET LOGIC ---
if(btnPlaceBet) {
    btnPlaceBet.addEventListener("click", async () => {
        const target = inputTarget.value.trim();
        const wager = parseInt(document.getElementById("market-wager").value);
        const type = selectType.value; 

        if(!target || !wager) return showMarketMsg("Fill all fields.", "red");
        if(wager < 50) return showMarketMsg("Min bet is 50 pts.", "red");
        if(wager > (currentUser.points || 0)) return showMarketMsg("Not enough points.", "red");

        btnPlaceBet.textContent = "Placing...";
        btnPlaceBet.disabled = true;

        const res = await apiCall("market/place-bet", "POST", {
            bettor: currentUser.username, target, type, wager, durationHours: 24
        });

        if(res && res.success) {
            showMarketMsg("Bet Placed!", "green");
            currentUser.points -= wager; 
            document.getElementById("menu-points").textContent = currentUser.points;
            
            // Add to Local Feed Instantly
            addFeedItem(`You bet <strong>${wager}pts</strong> on <strong>${target}</strong>`, "mine");
            
            fetchMyBets();
        } else {
            showMarketMsg(res.error || "Error.", "red");
        }
        
        btnPlaceBet.textContent = "Place Bet";
        btnPlaceBet.disabled = false;
    });
}

// --- TICKET LOGIC (FIXED BATCHING) ---
if(btnBuyTicket) {
    btnBuyTicket.addEventListener("click", async () => {
        // 1. Check Points Locally
        if((currentUser.points || 0) < 3) return alert("You need 3 points!");
        
        // 2. Optimistic UI: Deduct points immediately
        currentUser.points -= 3;
        document.getElementById("menu-points").textContent = currentUser.points;
        
        // 3. Update Batch Counters
        ticketBatchCount++;
        btnBuyTicket.textContent = `Buying (${ticketBatchCount})...`;
        
        // 4. Clear existing timer
        if (ticketBatchTimer) clearTimeout(ticketBatchTimer);
        
        // 5. Wait for 5 seconds of silence before calling Server
        ticketBatchTimer = setTimeout(async () => {
            
            // --- THE FIX: SEND ONE REQUEST FOR ALL TICKETS ---
            const res = await apiCall("market/lottery/buy", "POST", { 
                username: currentUser.username, 
                quantity: ticketBatchCount 
            });
            
            if(res && res.success) {
                lotteryMsg.textContent = "Tickets Purchased!";
                addFeedItem(`You bought <strong>${ticketBatchCount} Lottery Tickets</strong>`, "ticket");
                fetchLotteryStatus();
            } else {
                // Refund if server error
                const refund = ticketBatchCount * 3;
                currentUser.points += refund;
                document.getElementById("menu-points").textContent = currentUser.points;
                alert(res.error || "Error buying tickets. Points refunded.");
            }

            // Reset
            ticketBatchCount = 0;
            btnBuyTicket.textContent = "Buy Ticket (3 Pts)"; 
            setTimeout(() => lotteryMsg.textContent = "", 3000);

        }, 5000); 
    });
}

// --- HELPER TEXT ---
if (selectType) {
    selectType.addEventListener("change", () => {
        const val = selectType.value;
        let txt = "";
        if (val === "RANK_1") txt = "Extreme Risk! Target MUST be Rank #1.";
        else if (val === "TOP_3") txt = "High Risk. Target must finish in Top 3.";
        else if (val === "TOP_5") txt = "Standard bet. Target must finish in Top 5.";
        else if (val === "TOP_10") txt = "Safe bet. Low payout, but easy to win.";
        else if (val === "LOGIN_GAIN") txt = "Activity Bet. If they gain +50 logins, you win +50 pts.";
        else if (val === "RIVAL_BET") txt = "PvP. If YOU rank higher than TARGET, you win +50 pts.";
        helperText.textContent = txt;
    });
}

// --- AUTOCOMPLETE ---
if (inputTarget) {
    inputTarget.addEventListener("input", async (e) => {
        const val = e.target.value.trim();
        if (val.length < 1) { suggestionsBox.style.display = "none"; return; }
        const res = await apiCall(`users/search?q=${val}`, "GET");
        if (res && res.length > 0) {
            suggestionsBox.innerHTML = "";
            res.forEach(u => {
                const div = document.createElement("div");
                div.className = "autocomplete-item";
                div.textContent = u.username;
                div.onclick = () => { inputTarget.value = u.username; suggestionsBox.style.display = "none"; };
                suggestionsBox.appendChild(div);
            });
            suggestionsBox.style.display = "block";
        } else { suggestionsBox.style.display = "none"; }
    });
    document.addEventListener("click", (e) => { if (e.target !== inputTarget) suggestionsBox.style.display = "none"; });
}

function openMarket() {
    if (!currentUser) return alert("Sign in first.");
    marketModal.classList.remove("hidden");
    if(document.getElementById("sidebar")) document.getElementById("sidebar").classList.remove("open");
    if(document.getElementById("user-dropdown")) document.getElementById("user-dropdown").classList.add("hidden");
    
    // Initial fetch
    fetchMyBets();
    fetchLotteryStatus();
    fetchActivityFeed(); 
    
    apiCall("market/resolve-bets", "GET"); 
}

if(btnMarketSidebar) btnMarketSidebar.addEventListener("click", openMarket);
if(btnMarketMenu) btnMarketMenu.addEventListener("click", openMarket);
if(closeMarket) closeMarket.addEventListener("click", () => marketModal.classList.add("hidden"));

function showMarketMsg(msg, color) {
    if(marketStatus) {
        marketStatus.textContent = msg; marketStatus.style.color = color;
        setTimeout(() => marketStatus.textContent = "", 3000);
    } else alert(msg);
}

// --- LOTTERY ---
async function fetchLotteryStatus() {
    if(!lotteryPot) return;
    const res = await apiCall("market/lottery", "GET");
    if(res && res.pot !== undefined) {
        lotteryPot.textContent = res.pot.toLocaleString();
        if(res.nextDraw) nextDrawTimestamp = res.nextDraw;
    }
}

function updateLotteryTimer() {
    if(!lotteryTimer || !nextDrawTimestamp) return;
    const diff = nextDrawTimestamp - Date.now();
    if(diff <= 0) lotteryTimer.textContent = "Draw In Progress...";
    else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        lotteryTimer.textContent = `Next Draw: ${h}h ${m}m`;
    }
}
setInterval(updateLotteryTimer, 1000);

// --- FORMATTER ---
function formatTimeLeft(ms) {
    if (ms <= 0) return "Ended";
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
}

async function fetchMyBets() {
    if(!currentUser) return;
    marketBetsList.innerHTML = "Loading...";
    const bets = await apiCall(`market/my-bets/${currentUser.username}`, "GET");
    if(!bets || bets.length === 0) { marketBetsList.innerHTML = "<p style='text-align:center; color:#999; font-size:12px;'>No active bets.</p>"; return; }
    marketBetsList.innerHTML = "";
    bets.forEach(b => {
        const div = document.createElement("div");
        div.style.cssText = "display:flex; justify-content:space-between; align-items:center; font-size:12px; padding:8px; border-bottom:1px solid #eee;";
        const msLeft = new Date(b.check_time).getTime() - Date.now();
        const timeStr = formatTimeLeft(msLeft);
        const typeDisplay = b.bet_type.replace("TOP_", "Top ").replace("RANK_1", "#1 Champ");
        div.innerHTML = `<div><strong>${b.wager_amount}pts</strong> on ${b.target_username}<br><span style="color:#555; font-size:10px;">${typeDisplay}</span></div><div style="text-align:right;"><span style="color:#1a73e8; font-weight:bold;">${timeStr}</span></div>`;
        marketBetsList.appendChild(div);
    });
}

// Refresh Loops
setInterval(() => { if(!marketModal.classList.contains("hidden")) fetchMyBets(); }, 30000); 
setInterval(() => { if(!marketModal.classList.contains("hidden")) { fetchLotteryStatus(); fetchActivityFeed(); } }, 5000); // 5s Refresh