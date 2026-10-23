// -------------------- ROOGLE AI (Gemini Style) --------------------

// REPLACE THIS WITH YOUR ACTUAL CLOUDFLARE WORKER URL
const AI_ENDPOINT = "https://ai2.uraverageopdoge.workers.dev"; 

// State
let chatHistory = []; 

// -------------------- 1. INJECT MODAL & CSS --------------------
if (!document.getElementById("ai-modal")) {
    const aiModalDiv = document.createElement("div");
    aiModalDiv.innerHTML = `
    <div id="ai-modal" class="modal hidden">
        <style>
            /* --- AI MODAL LAYOUT --- */
            .ai-layout {
                display: flex;
                height: 500px;
                background: #fff;
                border-radius: 8px;
                overflow: hidden;
                font-family: 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            }

            /* --- SIDEBAR (History) --- */
            .ai-sidebar {
                width: 200px;
                background: #f0f4f9;
                padding: 15px;
                border-right: 1px solid #e0e0e0;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .new-chat-btn {
                background: #dde3ea;
                color: #444746;
                border: none;
                padding: 10px;
                border-radius: 20px;
                cursor: pointer;
                text-align: left;
                font-size: 13px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: background 0.2s;
            }
            .new-chat-btn:hover { background: #cdd6e0; }

            /* --- MAIN CHAT AREA --- */
            .ai-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                position: relative;
            }

            .chat-container {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 20px;
                background: white;
            }

            /* --- BUBBLES --- */
            .msg-row { display: flex; width: 100%; }
            .msg-row.user { justify-content: flex-end; }
            .msg-row.ai { justify-content: flex-start; }

            .msg-bubble {
                max-width: 80%;
                padding: 10px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.5;
                word-wrap: break-word;
            }
            
            .msg-bubble.user {
                background: #007bff; /* Roogle Blue */
                color: white;
                border-bottom-right-radius: 4px;
            }

            .msg-bubble.ai {
                background: #f0f4f9; /* Google Grey */
                color: #1f1f1f;
                border-bottom-left-radius: 4px;
            }
            
            /* --- INPUT AREA --- */
            .input-area {
                padding: 15px;
                background: #fff;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .ai-input {
                flex: 1;
                padding: 12px;
                border: 1px solid #ccc;
                border-radius: 24px;
                outline: none;
                font-size: 14px;
                resize: none;
                height: 46px; 
                overflow: hidden;
            }
            .ai-input:focus { border-color: #007bff; background: #fbfbfb; }

            .send-btn {
                background: #007bff;
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            .send-btn:hover { background: #0056b3; }
            .send-btn:disabled { background: #ccc; cursor: not-allowed; }

            /* Markdown Styling */
            .msg-bubble.ai strong { font-weight: 700; color: #000; }
            .msg-bubble.ai code { background: #e0e0e0; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
        </style>

        <div class="modal-content" style="width: 800px; padding: 0; border: none; overflow: hidden;">
            <div style="padding: 10px 15px; border-bottom: 1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                <h2 style="margin:0; font-size: 18px; color: #5f6368;">✨ Roogle AI</h2>
                <span id="close-ai" class="close" style="font-size:24px;">&times;</span>
            </div>

            <div class="ai-layout">
                <div class="ai-sidebar">
                    <button id="ai-new-chat" class="new-chat-btn"><span>+</span> New Chat</button>
                    <div style="flex:1;"></div>
                    <div style="font-size:10px; color:#888; text-align:center;">
                        Powered by Llama 3.2 <br> & Tavily Search
                    </div>
                </div>

                <div class="ai-main">
                    <div id="ai-chat-container" class="chat-container">
                        <div class="msg-row ai">
                            <div class="msg-bubble ai">Hello! I'm Roogle's AI helper. How can I help?</div>
                        </div>
                    </div>

                    <div class="input-area">
                        <input type="text" id="ai-user-input" class="ai-input" placeholder="Ask anything (e.g., 'News today')..." autocomplete="off" />
                        <button id="ai-send-btn" class="send-btn">➤</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.appendChild(aiModalDiv);
}

// -------------------- 2. LOGIC & STREAMING --------------------
const aiModal = document.getElementById("ai-modal");
const closeAiBtn = document.getElementById("close-ai");
const chatContainer = document.getElementById("ai-chat-container");
const aiInput = document.getElementById("ai-user-input");
const aiSendBtn = document.getElementById("ai-send-btn");
const aiNewChatBtn = document.getElementById("ai-new-chat");

function openRoogleAI() {
    aiModal.classList.remove("hidden");
    aiInput.focus();
}

closeAiBtn.addEventListener("click", () => {
    aiModal.classList.add("hidden");
});

aiNewChatBtn.addEventListener("click", () => {
    chatHistory = [];
    chatContainer.innerHTML = `
        <div class="msg-row ai">
            <div class="msg-bubble ai">Chat cleared. What's on your mind?</div>
        </div>
    `;
});

function appendMessage(role, text) {
    const row = document.createElement("div");
    row.className = `msg-row ${role}`;
    const bubble = document.createElement("div");
    bubble.className = `msg-bubble ${role}`;
    
    if (role === 'ai') {
        bubble.innerHTML = text; // Content set dynamically
    } else {
        bubble.textContent = text;
    }

    row.appendChild(bubble);
    chatContainer.appendChild(row);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return bubble; 
}

// --- LOGIC UPDATED TO INJECT DATE & PARSE STREAMS ---
async function handleSend() {
    const text = aiInput.value.trim();
    if (!text) return;

    appendMessage("user", text);
    aiInput.value = "";
    aiInput.disabled = true;
    aiSendBtn.disabled = true;

    // 1. Force the AI to know the current date and that it HAS search tools
    // This prevents the "I don't know future events" error.
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const systemPrompt = {
        role: "system",
        content: `Current Date: ${today}. You are Roogle AI. You have access to real-time information via Tavily Search. When asked about current events, news, or weather, you MUST use your search tool. Do not claim you cannot search.`
    };

    // Prepare message payload: Always put System Prompt first
    const messagesToSend = [systemPrompt, ...chatHistory, { role: "user", content: text }];
    
    // Update local history
    chatHistory.push({ role: "user", content: text });

    const aiBubble = appendMessage("ai", "...");
    let fullResponse = "";
    let buffer = ""; 

    try {
        const response = await fetch(AI_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                messages: messagesToSend 
            })
        });

        if (!response.ok) throw new Error("AI Server Error");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        aiBubble.innerHTML = ""; // Clear dots

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Split by newlines for SSE format "data: {...}"
            const lines = buffer.split("\n");
            
            // Keep the last incomplete line in the buffer
            buffer = lines.pop();

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === "data: [DONE]") continue;

                if (trimmed.startsWith("data: ")) {
                    try {
                        const jsonStr = trimmed.substring(6); // Remove "data: "
                        const data = JSON.parse(jsonStr);
                        
                        if (data.response) {
                            fullResponse += data.response;
                            
                            // Live Render with Basic Formatting
                            aiBubble.innerHTML = fullResponse
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                                .replace(/\n/g, '<br>'); // Newlines
                                
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                        }
                    } catch (e) {
                        console.error("Error parsing stream line:", trimmed);
                    }
                }
            }
        }

        chatHistory.push({ role: "assistant", content: fullResponse });

    } catch (err) {
        aiBubble.textContent = "Error: Could not connect to Roogle AI.";
        console.error(err);
    } finally {
        aiInput.disabled = false;
        aiSendBtn.disabled = false;
        aiInput.focus();
    }
}

aiSendBtn.addEventListener("click", handleSend);
aiInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
});

const btnAiSidebar = document.getElementById("btn-ai-sidebar");
if (btnAiSidebar) btnAiSidebar.addEventListener("click", openRoogleAI);