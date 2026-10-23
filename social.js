// -------------------- SOCIAL ELEMENTS --------------------
const profileModal = document.getElementById("profile-modal");
const closeProfileBtn = document.getElementById("close-profile-modal");
const bioInput = document.getElementById("profile-bio-input");
const btnEditProfile = document.getElementById("btn-edit-profile");
const btnAddFriend = document.getElementById("btn-add-friend");
const friendsListContainer = document.getElementById("profile-friends-list");

// Helper to get the logged-in user safely
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

// --- NEW: THE IDENTITY RESTORER ---
// Fixes the glitch where your local browser thinks you are the person you just saved
async function restoreMyIdentity(myUsername) {
    const api = window.apiCall || apiCall;
    const realMe = await api(`roogle_user_${myUsername}`, "GET");
    if (realMe) {
        if (typeof window.currentUser !== 'undefined') window.currentUser = realMe;
        if (typeof currentUser !== 'undefined') currentUser = realMe;
    }
}

// Helper: Checks if request was sent within the last hour
function checkIfRequestPending(targetInbox, myUsername) {
    if (!targetInbox) return false;
    for (let i = 0; i < targetInbox.length; i++) {
        let req = targetInbox[i];
        let senderName = typeof req === 'string' ? req : req.sender;
        if (senderName === myUsername) {
            let reqTime = typeof req === 'string' ? 0 : req.timestamp;
            if (Date.now() - reqTime < 3600000) return true; // 1 Hour lock
        }
    }
    return false;
}

// -------------------- 1. OPEN PROFILE --------------------
window.openProfileModal = function(targetUser) {
    if (!targetUser || !profileModal) return;
    
    const me = getActiveUser();

    profileModal.classList.remove("hidden");
    profileModal.style.display = "flex";
    profileModal.style.justifyContent = "center";
    profileModal.style.alignItems = "center";
    
    document.getElementById("profile-username").textContent = targetUser.username;
    document.getElementById("profile-points").textContent = targetUser.points || 0;
    document.getElementById("profile-join-date").textContent = targetUser.joinDate || "2026";

    let r = { name: "Bronze" };
    if(typeof getRank === 'function') r = getRank(targetUser.logins || 0);
    else if(typeof window.getRank === 'function') r = window.getRank(targetUser.logins || 0);
    document.getElementById("profile-best-rank").textContent = r.name;
    
    const pfpDisplay = document.getElementById("profile-pfp-display");
    if (targetUser.pfp) {
        pfpDisplay.innerHTML = `<img src="${targetUser.pfp}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    } else {
        pfpDisplay.innerHTML = targetUser.username.charAt(0).toUpperCase();
    }
    
    const badge = document.getElementById("profile-rank-badge");
    badge.textContent = r.name;
    if(targetUser.customRank) {
        badge.style.color = targetUser.customRank.color;
        if(targetUser.customRank.font) badge.style.fontFamily = targetUser.customRank.font;
    } else {
        badge.style.color = "";
        badge.style.fontFamily = "";
    }

    if(bioInput) bioInput.value = targetUser.bio || "";
    
    const oldMsg = document.getElementById("btn-message-user");
    if(oldMsg) oldMsg.remove();
    const oldFinder = document.getElementById("friend-finder-container");
    if(oldFinder) oldFinder.remove();
    const oldInbox = document.getElementById("friend-inbox-container");
    if(oldInbox) oldInbox.remove();

    if(friendsListContainer) friendsListContainer.innerHTML = "";

    const isMe = (me && me.username === targetUser.username);

    if (isMe) {
        if(btnEditProfile) {
            btnEditProfile.classList.remove("hidden");
            btnEditProfile.textContent = "Edit Profile";
            btnEditProfile.onclick = toggleEditMode;
            btnEditProfile.style.background = ""; 
            btnEditProfile.style.color = "";
        }
        if(btnAddFriend) btnAddFriend.classList.add("hidden");
        if(bioInput) bioInput.disabled = true; 

        renderMyFriendList();
        injectInbox(friendsListContainer);
        injectFriendFinder(friendsListContainer);

    } else {
        if(btnEditProfile) btnEditProfile.classList.add("hidden");
        
        if(btnAddFriend) {
            btnAddFriend.classList.remove("hidden");
            
            const friendsList = me.friends || [];
            const isFriend = friendsList.includes(targetUser.username);
            const isPending = checkIfRequestPending(targetUser.inbox, me.username);
            
            updateFriendButton(isFriend, isPending);
            
            if(isFriend) {
                const msgBtn = document.createElement("button");
                msgBtn.id = "btn-message-user";
                msgBtn.textContent = "Message";
                msgBtn.className = "action-btn";
                msgBtn.style.cssText = "background:#fff; color:#1a73e8; border:1px solid #dadce0; margin-left:8px;";
                msgBtn.onclick = () => {
                     profileModal.classList.add("hidden");
                     profileModal.style.display = "none";
                     if(window.openChat) window.openChat(targetUser.username);
                };
                if(btnAddFriend.parentNode) btnAddFriend.parentNode.insertBefore(msgBtn, btnAddFriend.nextSibling);
            }
            
            if (!isPending || isFriend) {
                 btnAddFriend.onclick = () => handleFriendAction(targetUser.username, isFriend);
            }
        }
        if(bioInput) bioInput.disabled = true;
        
        if(friendsListContainer) friendsListContainer.innerHTML = '<div style="color:#999; font-size:12px; font-style:italic; padding:5px;">Friends list hidden.</div>';
    }
};

// -------------------- 2. RENDER LISTS --------------------
function renderMyFriendList() {
    const me = getActiveUser();
    if (!me || !me.friends || me.friends.length === 0) {
        friendsListContainer.innerHTML = '<div style="color:#777; font-style:italic; padding:10px;">No friends yet. Add them below!</div>';
    } else {
        friendsListContainer.innerHTML = "";
        me.friends.forEach(fName => {
            const row = document.createElement("div");
            row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #eee;";
            row.innerHTML = `<span style="font-weight:500; color:#333;">${fName}</span>`;

            const actionsDiv = document.createElement("div");
            
            const chatBtn = document.createElement("button");
            chatBtn.innerHTML = "💬";
            chatBtn.title = "Message";
            chatBtn.style.cssText = "border:none; background:none; cursor:pointer; font-size:16px; margin-right:10px;";
            chatBtn.onclick = () => {
               profileModal.classList.add("hidden");
               profileModal.style.display = "none";
               if(window.openChat) window.openChat(fName); 
            };

            const removeBtn = document.createElement("button");
            removeBtn.innerHTML = "&times;";
            removeBtn.title = "Remove";
            removeBtn.style.cssText = "border:none; background:none; color:#999; cursor:pointer; font-size:18px;";
            removeBtn.onclick = async () => {
                if(confirm(`Remove ${fName}?`)) {
                    await removeFriend(fName);
                    renderMyFriendList(); 
                }
            };

            actionsDiv.appendChild(chatBtn);
            actionsDiv.appendChild(removeBtn);
            row.appendChild(actionsDiv);
            friendsListContainer.appendChild(row);
        });
    }
}

// -------------------- 3. INBOX UI --------------------
function injectInbox(container) {
    const me = getActiveUser();
    const inboxDiv = document.createElement("div");
    inboxDiv.id = "friend-inbox-container";
    inboxDiv.style.cssText = "margin-top:20px; padding-top:15px; border-top:2px dashed #eee;";
    
    const inboxList = me.inbox || [];
    const count = inboxList.length;

    inboxDiv.innerHTML = `<h4 style="margin:0 0 10px 0; font-size:14px; color:#5f6368;">📥 Friend Requests (${count})</h4>`;
    
    if (count === 0) {
        inboxDiv.innerHTML += `<div style="font-size:12px; color:#999; font-style:italic;">No pending requests.</div>`;
    } else {
        inboxList.forEach(reqItem => {
            const reqName = typeof reqItem === 'string' ? reqItem : reqItem.sender;

            const row = document.createElement("div");
            row.style.cssText = "background:#f9f9f9; padding:8px; margin-bottom:5px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;";
            row.innerHTML = `<span><strong>${reqName}</strong> wants to be friends.</span>`;
            
            const btnGroup = document.createElement("div");
            
            const acceptBtn = document.createElement("button");
            acceptBtn.textContent = "✔";
            acceptBtn.style.cssText = "background:#34a853; color:white; border:none; border-radius:4px; padding:4px 8px; margin-right:5px; cursor:pointer;";
            acceptBtn.onclick = async () => {
                await acceptRequest(reqName);
                window.openProfileModal(getActiveUser()); 
            };

            const declineBtn = document.createElement("button");
            declineBtn.textContent = "✖";
            declineBtn.style.cssText = "background:#d93025; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer;";
            declineBtn.onclick = async () => {
                await declineRequest(reqName);
                window.openProfileModal(getActiveUser()); 
            };

            btnGroup.appendChild(acceptBtn);
            btnGroup.appendChild(declineBtn);
            row.appendChild(btnGroup);
            inboxDiv.appendChild(row);
        });
    }
    
    container.parentNode.appendChild(inboxDiv);
}

// -------------------- 4. FINDER UI --------------------
function injectFriendFinder(container) {
    const finderDiv = document.createElement("div");
    finderDiv.id = "friend-finder-container";
    finderDiv.style.cssText = "margin-top:20px; padding-top:15px; border-top:2px dashed #eee;";
    
    finderDiv.innerHTML = `
        <h4 style="margin:0 0 10px 0; font-size:14px; color:#5f6368;">🔍 Find Users</h4>
        <div style="display:flex; gap:5px;">
            <input type="text" id="finder-search-input" placeholder="Enter username..." style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;">
            <button id="finder-search-btn" style="background:#1a73e8; color:white; border:none; padding:0 12px; border-radius:4px; cursor:pointer;">Search</button>
        </div>
        <div id="finder-result-area" style="margin-top:10px;"></div>
    `;
    
    container.parentNode.appendChild(finderDiv);

    const btn = finderDiv.querySelector("#finder-search-btn");
    const inp = finderDiv.querySelector("#finder-search-input");
    const res = finderDiv.querySelector("#finder-result-area");

    btn.onclick = async () => {
        const query = inp.value.trim();
        if(!query) return;
        res.innerHTML = "Searching...";
        
        const api = window.apiCall || apiCall;
        const foundUser = await api(`roogle_user_${query}`, "GET");
        
        if(foundUser) {
            const me = getActiveUser();
            const myFriends = me.friends || []; 
            
            const isFriend = myFriends.includes(foundUser.username);
            const isMe = me && foundUser.username === me.username;
            const isPending = checkIfRequestPending(foundUser.inbox, me.username);
            
            let btnHtml = "";
            if(isMe) btnHtml = `<span style="color:#888; font-size:12px;">(That's you)</span>`;
            else if(isFriend) btnHtml = `<button disabled style="background:#ccc; color:#fff; border:none; padding:4px 8px; border-radius:4px;">Already Friend</button>`;
            else if(isPending) btnHtml = `<button disabled style="background:#ccc; color:#fff; border:none; padding:4px 8px; border-radius:4px;">Request Sent</button>`;
            else btnHtml = `<button id="finder-add-btn" style="background:#1a73e8; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Add Friend</button>`;

            res.innerHTML = `
                <div style="background:#f9f9f9; padding:10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div><strong>${foundUser.username}</strong><br><span style="font-size:11px; color:#666;">${foundUser.points || 0} pts</span></div>
                    ${btnHtml}
                </div>
            `;
            
            const addBtn = document.getElementById("finder-add-btn");
            if(addBtn) {
                addBtn.onclick = async () => {
                    addBtn.textContent = "Sending...";
                    await sendFriendRequest(foundUser.username);
                    addBtn.textContent = "Request Sent";
                    addBtn.disabled = true;
                    addBtn.style.background = "#ccc";
                };
            }
        } else {
            res.innerHTML = `<span style="color:red;">User not found.</span>`;
        }
    };
}

// -------------------- 5. FRIEND LOGIC HANDLERS --------------------

function updateFriendButton(isFriend, isPending) {
    if(isFriend) {
        btnAddFriend.textContent = "Remove Friend";
        btnAddFriend.style.background = "#d93025"; 
        btnAddFriend.disabled = false;
    } else if(isPending) {
        btnAddFriend.textContent = "Request Sent";
        btnAddFriend.style.background = "#ccc"; 
        btnAddFriend.disabled = true;
    } else {
        btnAddFriend.textContent = "Add Friend";
        btnAddFriend.style.background = "#1a73e8"; 
        btnAddFriend.disabled = false;
    }
}

async function handleFriendAction(targetName, isFriend) {
    const me = getActiveUser();
    if(isFriend) {
        if(confirm(`Remove ${targetName}?`)) {
            await removeFriend(targetName);
            alert("Friend removed.");
            window.openProfileModal(getActiveUser()); 
        }
    } else {
        await sendFriendRequest(targetName);
        alert(`Friend request sent to ${targetName}!`);
        updateFriendButton(false, true); 
    }
}

async function sendFriendRequest(targetName) {
    try {
        const me = getActiveUser();
        const api = window.apiCall || apiCall;

        // 1. Fetch Target
        const targetUser = await api(`roogle_user_${targetName}`, "GET");
        if (!targetUser) return;

        // 2. Initialize Arrays (Safety net)
        if (!targetUser.inbox) targetUser.inbox = [];
        if (!targetUser.friends) targetUser.friends = [];

        // 3. Remove old requests to avoid duplicates/glitches
        targetUser.inbox = targetUser.inbox.filter(item => {
            const sName = typeof item === 'string' ? item : item.sender;
            return sName !== me.username;
        });

        // 4. Push the new request
        targetUser.inbox.push({ sender: me.username, timestamp: Date.now() });

        // 5. Save back to database
        await api(`roogle_user_${targetName}`, "POST", targetUser);

        // 6. Restore Identity (Prevents the "Identity Theft" glitch)
        await restoreMyIdentity(me.username);

    } catch (error) {
        // Fails silently if something goes wrong, but logs for DevTools
        console.error("Friend request error:", error.message);
    }
}

async function acceptRequest(senderName) {
    const me = getActiveUser();
    const api = window.apiCall || apiCall;

    if(!me.friends) me.friends = [];
    if(!me.friends.includes(senderName)) me.friends.push(senderName);
    
    if(!me.inbox) me.inbox = [];
    me.inbox = me.inbox.filter(item => {
        const sName = typeof item === 'string' ? item : item.sender;
        return sName !== senderName;
    });
    
    // Save Me
    await api(`roogle_user_${me.username}`, "POST", me);

    // Save Them
    const sender = await api(`roogle_user_${senderName}`, "GET");
    if(sender) {
        if(!sender.friends) sender.friends = [];
        if(!sender.friends.includes(me.username)) sender.friends.push(me.username);
        
        await api(`roogle_user_${senderName}`, "POST", sender);
        
        // --- FIX: RESTORE YOUR IDENTITY ---
        await restoreMyIdentity(me.username);
    }
}

async function declineRequest(senderName) {
    const me = getActiveUser();
    const api = window.apiCall || apiCall;
    
    if(me.inbox) {
        me.inbox = me.inbox.filter(item => {
            const sName = typeof item === 'string' ? item : item.sender;
            return sName !== senderName;
        });
        await api(`roogle_user_${me.username}`, "POST", me);
    }
}

async function removeFriend(targetName) {
    const me = getActiveUser();
    const api = window.apiCall || apiCall;

    // Remove from ME
    if(me.friends) {
        me.friends = me.friends.filter(u => u !== targetName);
        await api(`roogle_user_${me.username}`, "POST", me);
    }

    // Remove from THEM
    const target = await api(`roogle_user_${targetName}`, "GET");
    if(target && target.friends) {
        target.friends = target.friends.filter(u => u !== me.username);
        await api(`roogle_user_${targetName}`, "POST", target);
        
        // --- FIX: RESTORE YOUR IDENTITY ---
        await restoreMyIdentity(me.username);
    }
}

// -------------------- 6. EDIT PROFILE --------------------
async function toggleEditMode() {
    const me = getActiveUser();
    const api = window.apiCall || apiCall;

    if (bioInput.disabled) {
        bioInput.disabled = false;
        bioInput.focus();
        btnEditProfile.textContent = "Save Changes";
        btnEditProfile.style.background = "#34a853"; 
        btnEditProfile.style.color = "white";
    } else {
        const newBio = bioInput.value;
        me.bio = newBio;
        btnEditProfile.textContent = "Saving...";
        await api(`roogle_user_${me.username}`, "POST", me);
        bioInput.disabled = true;
        btnEditProfile.textContent = "Edit Profile";
        btnEditProfile.style.background = "#e8f0fe";
        btnEditProfile.style.color = "#1a73e8";
    }
}

if(closeProfileBtn) {
    closeProfileBtn.addEventListener("click", () => {
        profileModal.classList.add("hidden");
        profileModal.style.display = "none";
    });
}

// -------------------- 7. INJECT VIEW PROFILE BUTTON --------------------
document.addEventListener("DOMContentLoaded", () => {
    const changePfpBtn = document.getElementById("change-pfp-btn");
    
    if (changePfpBtn && !document.getElementById("btn-view-my-profile-social")) {
        const btn = document.createElement("button");
        btn.id = "btn-view-my-profile-social";
        btn.innerHTML = "👤 View Profile";
        btn.style.cssText = "width:100%; text-align:left; background:none; border:none; padding:8px; cursor:pointer; color:#1a73e8; font-weight:500; font-family:inherit;";
        
        btn.onclick = () => {
            const user = getActiveUser();
            if (user) {
                window.openProfileModal(user);
                const dd = document.getElementById("user-dropdown");
                if(dd) dd.classList.add("hidden");
            } else {
                alert("Please sign in first.");
            }
        };

        changePfpBtn.parentNode.insertBefore(btn, changePfpBtn);
    }
});
// -------------------- INBOX POLLER --------------------
async function pollInbox() {
    const me = getActiveUser();
    if (!me) return;

    const api = window.apiCall || apiCall;
    const freshMe = await api(`roogle_user_${me.username}`, "GET");
    if (!freshMe) return;

    // Update the in-memory user with fresh inbox + friends
    freshMe.inbox = freshMe.inbox || [];
    freshMe.friends = freshMe.friends || [];
    if (typeof window.currentUser !== 'undefined') window.currentUser = freshMe;
    if (typeof currentUser !== 'undefined') currentUser = freshMe;

    // If the profile panel is open and showing OUR profile, refresh the inbox live
    const inboxContainer = document.getElementById("friend-inbox-container");
    if (inboxContainer) {
        const parent = inboxContainer.parentNode;
        if (parent) {
            inboxContainer.remove();
            injectInbox(parent);
        }
    }
}

setInterval(pollInbox, 15000); // Check for new friend requests every 15 seconds