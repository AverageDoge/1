// -------------------- ROOGLE FEEDBACK --------------------

if (!document.getElementById("feedback-modal")) {
    const feedbackDiv = document.createElement("div");
    feedbackDiv.innerHTML = `
    <div id="feedback-modal" class="modal hidden">
        <div class="modal-content" style="width: 420px; max-width: 95vw;">
            <style>
                .feedback-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 4px 0;
                    font-family: 'Segoe UI', Roboto, sans-serif;
                }

                .feedback-header-text {
                    font-size: 13px;
                    color: #5f6368;
                    text-align: center;
                    margin: 0 0 4px 0;
                    line-height: 1.5;
                }

                .feedback-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: #f8f9fa;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 16px 18px;
                    text-decoration: none;
                    color: inherit;
                    cursor: pointer;
                    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
                }
                .feedback-card:hover {
                    background: #fff;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    transform: translateY(-1px);
                }
                .feedback-card:active {
                    transform: translateY(0);
                }

                .feedback-card-icon {
                    font-size: 32px;
                    flex-shrink: 0;
                    width: 44px;
                    text-align: center;
                }

                .feedback-card-body { flex: 1; }
                .feedback-card-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #202124;
                    margin: 0 0 3px 0;
                }
                .feedback-card-desc {
                    font-size: 12px;
                    color: #5f6368;
                    margin: 0;
                    line-height: 1.4;
                }

                .feedback-card-arrow {
                    font-size: 18px;
                    color: #bbb;
                    flex-shrink: 0;
                }

                .feedback-card.bug   { border-left: 4px solid #d93025; }
                .feedback-card.ideas { border-left: 4px solid #1a73e8; }

                .feedback-footer {
                    font-size: 11px;
                    color: #aaa;
                    text-align: center;
                    margin: 0;
                }
            </style>

            <span id="close-feedback" class="close" style="color: #202124; font-weight: bold;">&times;</span>
            <h2 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 500; color: #202124;">📋 Roogle Feedback</h2>

            <div class="feedback-layout">
                <p class="feedback-header-text">
                    Found something broken? Got a cool idea?<br>
                    Let us know — we read everything.
                </p>

                <a class="feedback-card bug" href="https://forms.gle/QY9vdV5LgdnbDYQFA" target="_blank" rel="noopener">
                    <div class="feedback-card-icon">🐛</div>
                    <div class="feedback-card-body">
                        <p class="feedback-card-title">Bug Report</p>
                        <p class="feedback-card-desc">Something's broken or not working right? Tell us what happened and we'll fix it.</p>
                    </div>
                    <div class="feedback-card-arrow">›</div>
                </a>

                <a class="feedback-card ideas" href="https://forms.gle/eqxT4HQcRee6Es6cA" target="_blank" rel="noopener">
                    <div class="feedback-card-icon">💡</div>
                    <div class="feedback-card-body">
                        <p class="feedback-card-title">Idea / Feature Request</p>
                        <p class="feedback-card-desc">Have a suggestion for Roogle? Drop your idea and it might make it in!</p>
                    </div>
                    <div class="feedback-card-arrow">›</div>
                </a>

                <p class="feedback-footer">Forms open in a new tab &nbsp;·&nbsp; Responses are anonymous</p>
            </div>
        </div>
    </div>
    `;
    document.body.appendChild(feedbackDiv);
}

// -------------------- FEEDBACK OPEN/CLOSE LOGIC --------------------
const feedbackModal      = document.getElementById("feedback-modal");
const closeFeedback      = document.getElementById("close-feedback");
const btnFeedbackSidebar = document.getElementById("btn-feedback-sidebar");

function openFeedback() {
    feedbackModal.classList.remove("hidden");
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
}

if (btnFeedbackSidebar) btnFeedbackSidebar.addEventListener("click", openFeedback);
if (closeFeedback) closeFeedback.addEventListener("click", () => feedbackModal.classList.add("hidden"));