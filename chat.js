// -------------------- CHAT & SOCIAL SYSTEM --------------------

// GLOBAL VARIABLES
let currentChatPartner = null;
let chatPollTimer = null;
const CHAT_POLL_RATE = 2000; // Check open chat every 2 seconds

// --- NEW NOTIFICATION VARIABLES ---
let globalScoutTimer = null;
let knownMessageCounts = {}; // Keeps track of how many messages we've seen so we don't spam old ones
const SCOUT_POLL_RATE = 5000; // Background check every 5 seconds

// --- NEW: SAFE USER HELPER (Matches social.js) ---
function getActiveUser() {
    let user = null;
    if (typeof window.currentUser !== 'undefined' && window.currentUser) user = window.currentUser;
    else if (typeof currentUser !== 'undefined' && currentUser) user = currentUser;

    if (user) {
        if (!user.friends) user.friends = [];
        if (!user.inbox) user.inbox = [];
    }
    return user;
}

// -------------------- 1. UI GENERATION (The "Market-Style" Box) --------------------
document.addEventListener("DOMContentLoaded", () => {
    createChatUI();
    attachChatListeners();
    startBackgroundScout(); // START THE BACKGROUND NOTIFICATION SCOUT
});

function createChatUI() {
    if (document.getElementById("chat-modal-container")) return;

    // RESPONSIVE UI: Fixed the height bug so it doesn't get chopped off your screen
    const modalHTML = `
    <div id="chat-modal-container" class="modal hidden" style="z-index: 20000;">
        <div class="modal-content" style="width: 90vw; max-width: 1000px; height: 85vh; max-height: 800px; display: flex; flex-direction: column; padding: 0;">
            
            <div class="modal-header" style="padding: 15px; border-bottom: 1px solid #ddd; display:flex; justify-content:space-between; align-items:center; background:#f8f9fa;">
                <h2 id="chat-header-title" style="margin:0; font-size: 18px;">💬 Roogle Chat</h2>
                <span id="close-chat-modal" class="close-btn" style="cursor:pointer; font-size:24px;">&times;</span>
            </div>

            <div id="chat-body" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                
                <div id="chat-finder-view" style="padding: 15px; display: flex; flex-direction: column; height: 100%;">
                    <div style="display:flex; gap:10px; margin-bottom:15px;">
                        <input type="text" id="chat-user-search" placeholder="Search user to chat..." style="flex:1; padding:10px; border:1px solid #ddd; border-radius:4px;">
                        <button id="btn-chat-search" class="action-btn" style="padding:0 15px;">Search</button>
                    </div>
                    
                    <div style="font-weight:bold; margin-bottom:5px; color:#5f6368;">MY FRIENDS</div>
                    <div id="chat-friend-list" style="flex:1; overflow-y:auto; border:1px solid #eee; border-radius:4px; padding:5px;">
                        <div style="padding:10px; color:#999; text-align:center;">Loading friends...</div>
                    </div>
                </div>

                <div id="chat-conversation-view" class="hidden" style="display: flex; flex-direction: column; height: 100%;">
                    <div style="padding: 10px; background: #e8f0fe; display:flex; justify-content:space-between; align-items:center;">
                        <button id="btn-back-to-finder" style="border:none; background:none; cursor:pointer; color:#1a73e8; font-weight:bold;">❮ Back</button>
                        <span id="chat-partner-name" style="font-weight:bold;">User</span>
                        <div style="width:40px;"></div> </div>
                    
                    <div id="chat-message-area" style="flex:1; background:#fff; padding:15px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
                        </div>

                    <div style="padding:10px; border-top:1px solid #ddd; display:flex; gap:10px; background:#f1f3f4;">
                        <input type="text" id="chat-input-msg" placeholder="Type a message..." style="flex:1; padding:10px; border:1px solid #ddd; border-radius:20px; outline:none;">
                        <button id="btn-send-msg" style="border:none; background:#1a73e8; color:white; width:40px; height:40px; border-radius:50%; cursor:pointer;">➤</button>
                    </div>
                </div>

            </div>
        </div>
    </div>
    `;

    const div = document.createElement("div");
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
}

// -------------------- 2. EVENT LISTENERS --------------------
function attachChatListeners() {
    const btnSidebar = document.getElementById("btn-chat-sidebar");
    const modal = document.getElementById("chat-modal-container");
    const closeBtn = document.getElementById("close-chat-modal");
    
    if (btnSidebar) {
        btnSidebar.addEventListener("click", () => {
            const me = getActiveUser(); 
            if(!me) return alert("Please sign in to use Chat.");
            openChatHub();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
            stopChatPolling();
        });
    }

    const btnSearch = document.getElementById("btn-chat-search");
    const inputSearch = document.getElementById("chat-user-search");
    
    if(btnSearch) {
        btnSearch.addEventListener("click", () => doUserSearch(inputSearch.value));
    }

    document.getElementById("btn-back-to-finder").addEventListener("click", () => {
        document.getElementById("chat-conversation-view").classList.add("hidden");
        document.getElementById("chat-conversation-view").style.display = "none";
        document.getElementById("chat-finder-view").classList.remove("hidden");
        document.getElementById("chat-finder-view").style.display = "flex";
        stopChatPolling();
        renderFriendList();
    });

    document.getElementById("btn-send-msg").addEventListener("click", sendMessage);
    document.getElementById("chat-input-msg").addEventListener("keypress", (e) => {
        if(e.key === "Enter") sendMessage();
    });
}

// -------------------- 3. HUB LOGIC (Friends & Search) --------------------
function openChatHub() {
    const modal = document.getElementById("chat-modal-container");
    modal.classList.remove("hidden");
    
    document.getElementById("chat-conversation-view").classList.add("hidden");
    document.getElementById("chat-conversation-view").style.display = "none";
    document.getElementById("chat-finder-view").classList.remove("hidden");
    document.getElementById("chat-finder-view").style.display = "flex";
    
    renderFriendList();
}

function renderFriendList() {
    const list = document.getElementById("chat-friend-list");
    list.innerHTML = "";
    const me = getActiveUser(); 

    if (!me || !me.friends || me.friends.length === 0) {
        list.innerHTML = `<div style="padding:15px; color:#777; text-align:center; font-style:italic;">
            You have no friends yet.<br>Use the search bar above to find people!
        </div>`;
        return;
    }

    me.friends.forEach(friendName => {
        const row = document.createElement("div");
        row.style.padding = "10px";
        row.style.borderBottom = "1px solid #eee";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.cursor = "pointer";
        row.onmouseover = () => row.style.backgroundColor = "#f1f3f4";
        row.onmouseout = () => row.style.backgroundColor = "transparent";
        
        row.onclick = () => window.openChat(friendName);

        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:30px; height:30px; background:#ddd; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#555;">
                    ${friendName[0].toUpperCase()}
                </div>
                <span style="font-weight:500; font-size:15px;">${friendName}</span>
            </div>
            <span style="font-size:18px; color:#ccc;">💬</span>
        `;
        list.appendChild(row);
    });
}

async function doUserSearch(username) {
    if(!username) return;
    const list = document.getElementById("chat-friend-list");
    list.innerHTML = `<div style="padding:10px; text-align:center;">Searching for "${username}"...</div>`;

    const api = window.apiCall || apiCall;
    const target = await api(`roogle_user_${username}`, "GET");
    const me = getActiveUser(); 

    list.innerHTML = ""; 

    if (!target) {
        list.innerHTML = `<div style="padding:10px; color:red; text-align:center;">User "${username}" not found.</div>`;
        return;
    }

    const card = document.createElement("div");
    card.style.border = "1px solid #ddd";
    card.style.borderRadius = "8px";
    card.style.padding = "15px";
    card.style.textAlign = "center";
    card.style.marginTop = "10px";
    card.style.background = "#fff";

    const isFriend = me && me.friends && me.friends.includes(target.username);

    card.innerHTML = `
        <div style="font-size:40px; margin-bottom:10px;">👤</div>
        <h3 style="margin:0;">${target.username}</h3>
        <p style="color:#666; font-size:12px; margin:5px 0 15px 0;">${target.bio || "No bio available."}</p>
        
        <div style="display:flex; gap:10px; justify-content:center;">
            <button id="search-btn-chat" class="action-btn">💬 Chat</button>
            <button id="search-btn-friend" class="action-btn" style="background:${isFriend ? '#d93025' : '#1a73e8'};">
                ${isFriend ? "Remove Friend" : "Add Friend"}
            </button>
        </div>
    `;

    list.appendChild(card);

    document.getElementById("search-btn-chat").onclick = () => window.openChat(target.username);
    
    document.getElementById("search-btn-friend").onclick = async (e) => {
        const btn = e.target;
        if (typeof toggleFriend === "function") {
            await toggleFriend(target.username, null);
        } else {
            alert("Use the profile to manage friends!");
        }
        
        if(btn.textContent.trim() === "Add Friend") {
            btn.textContent = "Remove Friend";
            btn.style.background = "#d93025";
        } else {
            btn.textContent = "Add Friend";
            btn.style.background = "#1a73e8";
        }
    };
}

// -------------------- 4. CHAT LOGIC --------------------

window.openChat = function(partnerName) {
    const me = getActiveUser(); 
    if(!me) return alert("Please sign in first.");
    if(partnerName === me.username) return alert("You can't chat with yourself!");

    currentChatPartner = partnerName;
    const modal = document.getElementById("chat-modal-container");
    
    modal.classList.remove("hidden");

    document.getElementById("chat-finder-view").classList.add("hidden");
    document.getElementById("chat-finder-view").style.display = "none";
    
    document.getElementById("chat-conversation-view").classList.remove("hidden");
    document.getElementById("chat-conversation-view").style.display = "flex";

    document.getElementById("chat-partner-name").textContent = partnerName;
    document.getElementById("chat-message-area").innerHTML = `<div style="text-align:center; color:#999; margin-top:20px;">Loading history...</div>`;

    stopChatPolling();
    fetchChatMessages(); 
    chatPollTimer = setInterval(fetchChatMessages, CHAT_POLL_RATE);
};

function stopChatPolling() {
    if(chatPollTimer) clearInterval(chatPollTimer);
    chatPollTimer = null;
}

// -------------------- 5. MESSAGE STORAGE --------------------
function getChatID(u1, u2) {
    const sorted = [u1, u2].sort();
    return `roogle_chat_${sorted[0]}_${sorted[1]}`;
}

async function fetchChatMessages() {
    const me = getActiveUser(); 
    if (!currentChatPartner || !me) return;

    const chatID = getChatID(me.username, currentChatPartner);
    const api = window.apiCall || apiCall;
    const area = document.getElementById("chat-message-area");
    
    try {
        const data = await api(chatID, "GET");

        if (!data || !data.messages) {
            area.innerHTML = `<div style="text-align:center; color:#ccc; margin-top:20px; font-style:italic;">No messages yet.<br>Say hello! 👋</div>`;
            return;
        }

        const currentCount = area.querySelectorAll('.msg-bubble').length;
        if (data.messages.length === currentCount) return;

        area.innerHTML = "";
        data.messages.forEach(msg => {
            const isMe = msg.sender === me.username;
            const div = document.createElement("div");
            div.className = "msg-bubble";
            
            div.style.maxWidth = "75%";
            div.style.padding = "8px 12px";
            div.style.borderRadius = "15px";
            div.style.marginBottom = "5px";
            div.style.fontSize = "14px";
            div.style.wordWrap = "break-word";

            if (isMe) {
                div.style.alignSelf = "flex-end";
                div.style.background = "#1a73e8";
                div.style.color = "white";
                div.style.borderBottomRightRadius = "2px";
            } else {
                div.style.alignSelf = "flex-start";
                div.style.background = "#f1f3f4";
                div.style.color = "black";
                div.style.borderBottomLeftRadius = "2px";
            }
            
            div.textContent = msg.text;
            area.appendChild(div);
        });

        area.scrollTop = area.scrollHeight;
        
    } catch (err) {
        console.error("GET FETCH CRASHED:", err);
        area.innerHTML = `
            <div style="text-align:center; color:#d93025; margin-top:20px; font-weight:bold; border: 1px solid red; padding: 10px; border-radius: 8px;">
                🚨 ERROR LOADING CHAT 🚨<br><br>
                ${err.message}<br><br>
                Check if your Node Server crashed!
            </div>`;
        stopChatPolling();
    }
}

async function sendMessage() {
    const me = getActiveUser(); 
    if(!me) return;

    const input = document.getElementById("chat-input-msg");
    const text = input.value.trim();
    if (!text || !currentChatPartner) return;

    input.value = ""; 
    
    const area = document.getElementById("chat-message-area");
    if(area.innerText.includes("No messages yet")) area.innerHTML = "";

    const tempDiv = document.createElement("div");
    tempDiv.className = "msg-bubble";
    tempDiv.style.maxWidth = "75%";
    tempDiv.style.padding = "8px 12px";
    tempDiv.style.borderRadius = "15px";
    tempDiv.style.marginBottom = "5px";
    tempDiv.style.fontSize = "14px";
    tempDiv.style.alignSelf = "flex-end";
    tempDiv.style.background = "#1a73e8"; 
    tempDiv.style.color = "white";
    tempDiv.style.opacity = "0.7"; 
    tempDiv.textContent = text;
    area.appendChild(tempDiv);
    area.scrollTop = area.scrollHeight;

    const chatID = getChatID(me.username, currentChatPartner);
    const api = window.apiCall || apiCall;
    
    let data;
    try {
        data = await api(chatID, "GET");
    } catch(e) {
        data = null;
    }
    
    if (!data) data = { messages: [] };
    
    const newMessage = {
        sender: me.username,
        text: text,
        timestamp: Date.now()
    };
    data.messages.push(newMessage);

    try {
        const serverReply = await api(chatID, "POST", data);
        console.log("CAVEMAN SERVER SAID:", serverReply);
    } catch (error) {
        console.error("CAVEMAN CRASH:", error);
        alert("CAVEMAN CRASH:\n" + error.message);
    }
    
    fetchChatMessages();
}

// -------------------- 6. BACKGROUND NOTIFICATIONS (THE SCOUT) --------------------

function startBackgroundScout() {
    if (globalScoutTimer) clearInterval(globalScoutTimer);
    // Ping the server every 5 seconds to check for new messages across all friends
    globalScoutTimer = setInterval(checkAllChatsForNotifications, SCOUT_POLL_RATE);
}

async function checkAllChatsForNotifications() {
    const me = getActiveUser();
    if (!me || !me.friends || me.friends.length === 0) return;

    const api = window.apiCall || apiCall;

    // Check the inbox of every friend on our friend list
    for (const friend of me.friends) {
        const chatID = getChatID(me.username, friend);
        try {
            const data = await api(chatID, "GET");
            if (data && data.messages) {
                const msgCount = data.messages.length;
                
                // If this is our first time checking, just record the baseline count and skip notifying
                if (typeof knownMessageCounts[chatID] === "undefined") {
                    knownMessageCounts[chatID] = msgCount;
                    continue;
                }

                // If the message count has gone up, we have a new message!
                if (msgCount > knownMessageCounts[chatID]) {
                    knownMessageCounts[chatID] = msgCount; // Update our tracker
                    
                    const lastMsg = data.messages[data.messages.length - 1];
                    
                    // Smart Check: Are we actively looking at this person right now?
                    const isChatModalOpen = !document.getElementById("chat-modal-container").classList.contains("hidden");
                    const isLookingAtThem = (currentChatPartner === friend) && isChatModalOpen && !document.getElementById("chat-conversation-view").classList.contains("hidden");
                    
                    // Only trigger the toast if we didn't send the message, AND we aren't already reading it
                    if (lastMsg.sender !== me.username && !isLookingAtThem) {
                        showChatNotification(lastMsg.sender, lastMsg.text);
                    }
                }
            }
        } catch (err) {
            // Silently ignore errors here so the console doesn't get spammed if the server hiccups
        }
    }
}

function showChatNotification(sender, text) {
    // Lazy-load the container so we don't have to edit the HTML file
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    // Create the toast HTML
    const toast = document.createElement("div");
    toast.className = "chat-toast";
    
    toast.innerHTML = `
        <div class="toast-avatar">${sender[0].toUpperCase()}</div>
        <div class="toast-text-content">
            <div class="toast-title">New message from ${sender}</div>
            <div class="toast-message">${text}</div>
        </div>
    `;

    // Make it clickable! Opens the chat directly to that user.
    toast.onclick = () => {
        window.openChat(sender);
        toast.remove(); // Get rid of the toast as soon as we click it
    };

    container.appendChild(toast);

    // Automatically delete the code element after 5 seconds to prevent lag
    // (Matches the 4.5s CSS fade-out animation)
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 5000);
}