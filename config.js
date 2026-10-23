// -------------------- CONFIG --------------------
// REPLACE WITH YOUR RENDER URL
const STORAGE_API = "https://roogle-db.onrender.com"; 

// --- NEWSPAPER CONFIG ---
const NEWSPAPER_VERSION = "v1.3"; 

// --- GLOBAL VARIABLES ---
let currentUser = null; 
let isSignupMode = false;
const CLAIM_COOLDOWN = 6 * 60 * 60 * 1000; // 6 Hours

const SEASON_START_DATE = new Date("2026-01-10T00:00:00").getTime();
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const SEASON_WEEK_OFFSET = 4; // Shop starts at Week 5 (index 4)

// DEFINE YOUR WEEKLY POOLS HERE
const SHOP_POOLS = [
    // WEEK 1 (OG)
    [
        { name: "Fabian Destroyer", cost: 50, color: "#d32f2f", icon: "⚔️", desc: "Includes: Red 'Destroyer' Rank" },
        { name: "AverageGael Lover", cost: 50, color: "#e91e63", icon: "❤️", desc: "Includes: Pink 'Lover' Rank" }
    ],
    // WEEK 2 (OG)
    [
        { name: "Matrix Mode", cost: 55, color: "#00FF00", font: "Courier New", border: "1px solid #00FF00", icon: "💻", desc: "Includes: Matrix Font + Green Rank" },
        { name: "Golden", cost: 35, color: "#FFD700", border: "2px dashed gold", icon: "🖼️", desc: "Includes: Gold Rank" }
    ],
    // WEEK 3 (OG)
    [
        { name: "Red Grinder Bundle", cost: 400, color: "red", font: "Impact", border: "3px double red", icon: "🔥", desc: "Includes: Red Rank + Impact Font" },
        { name: "Blue Neon", cost: 40, color: "#00E5FF", border: "2px solid #00E5FF", icon: "🔵", desc: "Includes: Neon Rank" }
    ],
    // WEEK 4 (ROOGLE V3 CELEBRATION)
    [
        { 
            name: "Roogle V3 Bundle", 
            rankName: "V3 Pioneer", 
            cost: 10, 
            color: "#00E676", 
            font: "Garamond", 
            border: "2px dashed #00E676",
            icon: "🚀", 
            desc: "CELEBRATION: Includes 'V3 Pioneer' Rank + Garamond Font!" 
        }
    ],
    // WEEK 5: The Wealthy (NEW)
    [
        { name: "Midas Touch", cost: 2000, color: "#ffd700", border: "2px solid #daa520", icon: "👑", desc: "Solid Gold Status" },
        { name: "The Void", cost: 1500, color: "#000000", border: "1px solid #333", icon: "⚫", desc: "Pure Black Darkness" }
    ],
    // WEEK 6: Hacker Vibes (NEW)
    [
        { name: "Terminal Mode", cost: 600, color: "#00ff00", font: "Courier New", icon: "📟", desc: "Hacker Console Style" },
        { name: "Blueprint", cost: 450, color: "#2962ff", font: "Monospace", border: "1px dashed #2962ff", icon: "📐", desc: "Architect Style" }
    ],
    // WEEK 7: Fire & Ice (NEW)
    [
        { name: "Magma Lord", cost: 500, color: "#ff4500", border: "2px solid #8b0000", icon: "🌋", desc: "Hot Lava Borders" },
        { name: "Frozen Heart", cost: 500, color: "#00bfff", border: "2px dotted #e0f7fa", icon: "❄️", desc: "Ice Cold Style" }
    ],
    // WEEK 8: Aesthetic (NEW)
    [
        { name: "Vaporwave", cost: 420, color: "#ff80ab", border: "2px solid #00e5ff", icon: "🌴", desc: "Retro 80s Vibe" },
        { name: "Cotton Candy", cost: 350, color: "#f8bbd0", border: "2px solid #b3e5fc", icon: "🍬", desc: "Sweet & Soft" }
    ],
    // WEEK 9: Industrial Warning (NEW)
    [
        { name: "Biohazard", cost: 700, color: "#76ff03", border: "2px dashed #000", icon: "☣️", desc: "Toxic Warning" },
        { name: "System Failure", cost: 550, color: "#ff6f00", font: "Impact", icon: "⚠️", desc: "CRITICAL ERROR Style" }
    ],
    // WEEK 10: Dark Fantasy (NEW)
    [
        { name: "Vampire", cost: 666, color: "#880e4f", border: "1px solid #b71c1c", icon: "🧛", desc: "Blood Red Gothic" },
        { name: "Night Sky", cost: 400, color: "#1a237e", icon: "✨", desc: "Deep Blue Space" }
    ],
    // WEEK 11: Ultimate Flex (NEW)
    [
        { name: "Diamond Hands", cost: 1800, color: "#00e5ff", border: "3px double #0091ea", icon: "💎", desc: "Ultimate Flex" },
        { name: "Royalty", cost: 1200, color: "#7b1fa2", border: "2px dotted #4a148c", icon: "👑", desc: "King/Queen Status" }
    ],
    // WEEK 12: Nature (NEW)
    [
        { name: "Forest Guardian", cost: 300, color: "#2e7d32", border: "2px solid #1b5e20", icon: "🌲", desc: "Natural Green" },
        { name: "Deep Sea", cost: 300, color: "#0d47a1", border: "2px wavy #00b0ff", icon: "🌊", desc: "Ocean Waves" }
    ]
];

// -------------------- HELPER FUNCTIONS --------------------
async function apiCall(key, method, body = null) {
  try {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${STORAGE_API}/${key}`, options);
    if (!res.ok) {
        console.warn(`[API] ${method} ${key} failed: ${res.status}`);
        return null;
    } 
    return await res.json();
  } catch (e) {
    console.error("API Error", e);
    return null;
  }
}

function getRank(logins) {
  if (logins >= 10000) return { name: "Eternal", class: "rank-diamond", color: "#000000", border: "2px solid gold" };
  if (logins >= 7500)  return { name: "Divine", class: "rank-diamond", color: "#e040fb" };
  if (logins >= 5000)  return { name: "Celestial", class: "rank-diamond", color: "#d500f9" };
  if (logins >= 2500)  return { name: "Mythic", class: "rank-diamond", color: "#aa00ff" };
  if (logins >= 1000)  return { name: "Legend", class: "rank-diamond", color: "#6200ea" };
  if (logins >= 500)   return { name: "Grandmaster", class: "rank-diamond", color: "#304ffe" };
  if (logins >= 200)   return { name: "Master", class: "rank-diamond", color: "#2962ff" };
  if (logins >= 100)   return { name: "Diamond", class: "rank-diamond", color: "#00b0ff" };
  if (logins >= 50)    return { name: "Platinum", class: "rank-platinum", color: "#546e7a" };
  if (logins >= 25)    return { name: "Gold", class: "rank-gold", color: "#fbc02d" };
  if (logins >= 10)    return { name: "Silver", class: "rank-silver", color: "#757575" };
  return { name: "Bronze", class: "rank-bronze", color: "#8d6e63" };
}

// -------------------- ANTI-SLEEP --------------------
setInterval(() => {
  fetch(`${STORAGE_API}/ping`)
    .then(r => r.text())
    .then(txt => console.log("[System] Server Ping:", txt))
    .catch(e => console.error("[System] Ping Failed", e));
}, 780000);