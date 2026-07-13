/* ==========================================================
   Aura AI
   CHAT.JS
   PART 1
========================================================== */

"use strict";

/* ==========================================================
   CHAT MODULE
========================================================== */

const Chat = {

    messages: [],

    welcomeRemoved: false

};

/* ==========================================================
   REMOVE WELCOME SCREEN
========================================================== */

function removeWelcomeScreen() {

    const welcome = document.getElementById("welcomeScreen");

    if (welcome) {

        welcome.style.display = "none";

    }

    const suggestions = document.querySelector(".suggestion-grid");

    if (suggestions) {

        suggestions.style.display = "none";

    }

    Chat.welcomeRemoved = true;

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

/* ==========================================================
   CREATE MESSAGE
========================================================== */

function createMessage(

    role,

    content,

    time = new Date().toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

    })

) {

    removeWelcomeScreen();

    const wrapper = document.createElement("div");

    wrapper.className = `message ${role}-message fade`;

    const avatar = role === "user"

        ? "user.png"

        : "bot.png";

    const sender = role === "user"

        ? "You"

        : "Aura AI";

    wrapper.innerHTML = `

    <div class="avatar">

        <img src="/static/images/${avatar}" alt="${sender}">

    </div>

    <div class="message-content">

        <div class="message-header">

            <span class="sender">

                ${sender}

            </span>

            <span class="time">

                ${time}

            </span>

        </div>

        <div class="message-text">

            ${role === "ai"

            ? marked.parse(content)

            : escapeHTML(content)}

        </div>

        ${role === "user"

            ?

            `

            <div class="message-actions">

                <button class="message-btn edit-question" title="Edit">

                    <i class="ri-edit-line"></i>

                </button>

                <button class="message-btn copy-question" title="Copy">

                    <i class="ri-file-copy-line"></i>

                </button>

            </div>

            `

            :

            `

            <div class="message-actions">

                <button class="message-btn copy-response" title="Copy">
                    <i class="ri-file-copy-line"></i>
                </button>

                <button class="message-btn like-response" title="Like">
                    <i class="ri-thumb-up-line"></i>
                </button>

                <button class="message-btn dislike-response" title="Dislike">
                    <i class="ri-thumb-down-line"></i>
                </button>

                <button class="message-btn regenerate-response" title="Regenerate">
                    <i class="ri-refresh-line"></i>
                </button>

                <button class="message-btn speak-response" title="Read Aloud">
                    <i class="ri-volume-up-line"></i>
                </button>

            </div>

            `

        }

    </div>

    `;

    /* ==========================================
       USER BUTTONS
    ========================================== */

    if (role === "user") {

        const copyBtn = wrapper.querySelector(".copy-question");

        if (copyBtn) {

            copyBtn.addEventListener("click", () => {

                navigator.clipboard.writeText(content);

                showToast("Question copied");

            });

        }

        const editBtn = wrapper.querySelector(".edit-question");

        if (editBtn) {

            editBtn.addEventListener("click", () => {

                editQuestion(wrapper);

            });

        }

    }

    /* ==========================================
       AI BUTTONS
    ========================================== */

    if (role === "ai") {

        // Copy Response
        const copyBtn = wrapper.querySelector(".copy-response");

        if (copyBtn) {

            copyBtn.addEventListener("click", () => {

                navigator.clipboard.writeText(content);

                showToast("Response copied");

            });

        }


        const speakBtn = wrapper.querySelector(".speak-response");

        speakBtn.addEventListener("click", () => {

            speakResponse(content);

        });


        // Like
        const likeBtn = wrapper.querySelector(".like-response");

        const dislikeBtn = wrapper.querySelector(".dislike-response");

        if (likeBtn && dislikeBtn) {

            likeBtn.addEventListener("click", () => {

                likeBtn.classList.add("active");

                dislikeBtn.classList.remove("active");

                showToast("👍 Thanks for your feedback!");

            });

            dislikeBtn.addEventListener("click", () => {

                dislikeBtn.classList.add("active");

                likeBtn.classList.remove("active");

                showToast("👎 Feedback received!");

            });

        }

        // Regenerate
        const regenerateBtn = wrapper.querySelector(".regenerate-response");

        if (regenerateBtn) {

            regenerateBtn.addEventListener("click", () => {

                regenerateResponse();

            });

        }

    }

    DOM.chatMessages.appendChild(wrapper);

    scrollBottom();

    Chat.messages.push({

        role,

        content,

        time

    });

    return wrapper;

}

/* ==========================================================
   EDIT QUESTION
========================================================== */

function editQuestion(messageElement) {

    const textElement = messageElement.querySelector(".message-text");

    const oldText = textElement.innerText;

    const textarea = document.createElement("textarea");

    textarea.className = "edit-textarea";

    textarea.value = oldText;

    textElement.replaceWith(textarea);

    textarea.focus();

    textarea.select();

    const actions = messageElement.querySelector(".message-actions");

    actions.innerHTML = `

        <button class="message-btn save-edit">

            Save

        </button>

        <button class="message-btn cancel-edit">

            Cancel

        </button>

    `;

    actions.querySelector(".cancel-edit").onclick = () => {

        location.reload();

    };

    actions.querySelector(".save-edit").onclick = async () => {

        const newQuestion = textarea.value.trim();

        if (newQuestion === "") return;

        DOM.messageInput.value = newQuestion;

        sendMessage();

    };

}
/* ==========================================================
   USER MESSAGE
========================================================== */

function addUserMessage(message) {

    return createMessage(

        "user",

        message

    );

}

/* ==========================================================
   AI MESSAGE
========================================================== */

function addAssistantMessage(message) {

    return createMessage(

        "ai",

        message

    );

}

/* ==========================================================
   CLEAR CHAT
========================================================== */

function clearChatWindow() {

    DOM.chatMessages.innerHTML = `

        <div id="welcomeScreen" class="welcome-screen">

            <div class="welcome-icon">
                <i class="ri-robot-2-fill"></i>
            </div>

            <h1>Welcome to Aura AI</h1>

            <p>
                Your intelligent AI assistant for coding,
                document analysis,
                research,
                learning,
                debugging,
                and everyday productivity.
            </p>

        </div>

        <div class="suggestion-grid">

            <div class="suggestion-card"
                onclick="fillPrompt('Explain Artificial Intelligence in simple words.')">

                <i class="ri-brain-line"></i>

                <h4>Learn AI</h4>

                <p>Understand Artificial Intelligence with simple explanations.</p>

            </div>

            <div class="suggestion-card"
                onclick="fillPrompt('Write Python code to implement Binary Search.')">

                <i class="ri-code-box-line"></i>

                <h4>Generate Code</h4>

                <p>Create Python, Java, C++, JavaScript and more.</p>

            </div>

            <div class="suggestion-card"
                onclick="fillPrompt('Summarize this PDF document.')">

                <i class="ri-file-text-line"></i>

                <h4>Summarize Document</h4>

                <p>Upload PDFs, DOCX or TXT files for summaries.</p>

            </div>

            <div class="suggestion-card"
                onclick="fillPrompt('Help me prepare for my interview.')">

                <i class="ri-graduation-cap-line"></i>

                <h4>Interview Help</h4>

                <p>Practice interview questions and answers.</p>

            </div>

        </div>

    `;

    Chat.messages = [];

    Chat.welcomeRemoved = false;

}

/* ==========================================================
   UPDATE CHAT TITLE
========================================================== */

function setChatTitle(title) {

    if (DOM.chatTitle) {

        DOM.chatTitle.textContent = title;

    }

}

/* ==========================================================
   EXPORT
========================================================== */

window.ChatUI = {

    addUserMessage,

    addAssistantMessage,

    clearChatWindow,

    setChatTitle,

    createMessage,

    Chat

};

/* ==========================================================
   Aura AI
   CHAT.JS
   PART 2
========================================================== */

/* ==========================================================
   SEND MESSAGE
========================================================== */

async function sendMessage() {

    if (App.loading) {

        return;

    }

    const welcome = document.querySelector(".welcome-screen");

    if (welcome) {

        welcome.style.display = "none";

    }

    const suggestions = document.querySelector(".suggestion-grid");

    if (suggestions) {

        suggestions.style.display = "none";

    }

    const message = DOM.messageInput.value.trim();

    App.lastUserMessage = message;

    if (message === "") {

        return;

    }

    DOM.messageInput.value = "";

    DOM.messageInput.style.height = "auto";

    addUserMessage(message);

    setLoading(true);

    try {

        // Create new chat if needed
        if (!App.currentChatId) {

            const chat = await APIClient.newChat();

            App.currentChatId = chat.chat_id;

        }

        let response;

        /* =====================================================
           DOCUMENT MODE
        ====================================================== */

        if (

            window.Upload &&
            Upload.documents &&
            Object.keys(Upload.documents).length > 0

        ) {

            response = await APIClient.askDocument(

                message,

                Upload.documents

            );

        }

        /* =====================================================
           NORMAL CHAT
        ====================================================== */

        else {

            response = await APIClient.sendChatMessage(

                App.currentChatId,

                message

            );

        }

        addAssistantMessage(

            response.response

        );

        if (response.title) {

            setChatTitle(

                response.title

            );

            if (window.SidebarUI) {

                SidebarUI.loadHistory();

            }

        }

        if (response.chat_id) {

            App.currentChatId = response.chat_id;

        }

    }

    catch (error) {

        console.error(error);

        addAssistantMessage(

            "⚠️ Sorry, something went wrong while generating the response."

        );

    }

    finally {

        setLoading(false);

        scrollBottom();

    }

}

async function regenerateResponse() {

    if (!App.lastUserMessage) {

        return;

    }

    setLoading(true);

    try {

        const response = await APIClient.sendChatMessage(

            App.currentChatId,

            App.lastUserMessage

        );

        // Remove the last AI message
        const aiMessages = document.querySelectorAll(".ai-message");

        if (aiMessages.length) {

            aiMessages[aiMessages.length - 1].remove();

        }

        // Add the regenerated response
        addAssistantMessage(

            response.response

        );

    }

    catch (error) {

        console.error(error);

    }

    finally {

        setLoading(false);

        scrollBottom();

    }

}

/* ==========================================================
   LOAD CHAT
========================================================== */

async function loadConversation(chatId) {

    try {

        clearChatWindow();

        const data = await APIClient.loadChat(chatId);

        App.currentChatId = chatId;

        setChatTitle(

            data.chat.title

        );

        for (const message of data.messages) {

            if (message.role === "user") {

                addUserMessage(

                    message.message

                );

            }

            else {

                addAssistantMessage(

                    message.message

                );

            }

        }

        scrollBottom();

    }

    catch (error) {

        console.error(error);

        showToast(

            "Unable to load chat",

            "danger"

        );

    }

}

/* ==========================================================
   START NEW CHAT
========================================================== */

async function createNewChat() {

    console.log("New Chat Clicked");

    try {

        clearChatWindow();

        const chat = await APIClient.newChat();

        App.currentChatId = chat.chat_id;

        setChatTitle(

            chat.title

        );

        if (window.SidebarUI) {

            SidebarUI.loadHistory();

        }

    }

    catch (error) {

        console.error(error);

        showToast(

            "Unable to create chat",

            "danger"

        );

    }

}

/* ==========================================================
   REGENERATE LAST RESPONSE
========================================================== */

async function regenerateLastResponse() {

    if (Chat.messages.length < 2) {

        return;

    }

    const lastUser = [...Chat.messages]

        .reverse()

        .find(

            m => m.role === "user"

        );

    if (!lastUser) {

        return;

    }

    DOM.messageInput.value = lastUser.content;

    await sendMessage();

}

/* ==========================================================
   EXPORT
========================================================== */

Object.assign(

    window.ChatUI,

    {

        sendMessage,

        loadConversation,

        createNewChat,

        regenerateLastResponse

    }

);

/* ==========================================================
   CONNECT PLACEHOLDERS
========================================================== */

window.sendMessage = sendMessage;

window.createNewChat = createNewChat;

/* ==========================================================
   Aura AI
   CHAT.JS
   PART 3
========================================================== */

/* ==========================================================
   MARKDOWN
========================================================== */

function renderMarkdown(element) {

    if (!element) {

        return;

    }

    const raw = element.textContent;

    if (raw.trim() !== "") {

        element.innerHTML = marked.parse(raw);

    }

    element.querySelectorAll("pre code").forEach(block => {

        hljs.highlightElement(block);

    });

    addCodeCopyButtons(element);

}

/* ==========================================================
   COPY BUTTONS
========================================================== */

function addCodeCopyButtons(container) {

    const blocks = container.querySelectorAll("pre");

    blocks.forEach(pre => {

        if (pre.querySelector(".copy-code-btn")) {

            return;

        }

        const button = document.createElement("button");

        button.className = "copy-code-btn";

        button.innerHTML = `

            <i class="ri-file-copy-line"></i>

            Copy

        `;

        button.addEventListener(

            "click",

            () => {

                const code = pre.querySelector("code");

                if (code) {

                    copyToClipboard(

                        code.innerText

                    );

                }

            }

        );

        pre.style.position = "relative";

        pre.appendChild(button);

    });

}

/* ==========================================================
   COPY MESSAGE
========================================================== */

function copyMessage(button) {

    const message = button

        .closest(".message-content")

        .querySelector(".message-text")

        .innerText;

    copyToClipboard(message);

}

/* ==========================================================
   MESSAGE ACTIONS
========================================================== */

function attachMessageActions(message) {

    const content = message.querySelector(

        ".message-content"

    );

    const actions = document.createElement("div");

    actions.className = "message-actions";

    actions.innerHTML = `

    <button class="msg-btn bookmark-btn" title="Bookmark">

        <i class="ri-bookmark-line"></i>

    </button>

    <button class="msg-btn copy-btn" title="Copy">

        <i class="ri-file-copy-line"></i>

    </button>

    <button class="msg-btn regenerate-btn" title="Regenerate">

        <i class="ri-refresh-line"></i>

    </button>

    `;

    if (content.querySelector(".message-actions")) {

        return;

    }

    content.appendChild(actions);

    actions.querySelector(".copy-btn")

        .addEventListener(

            "click",

            () => copyMessage(

                actions.querySelector(".copy-btn")

            )

        );

    const bookmarkBtn = actions.querySelector(".bookmark-btn");

    bookmarkBtn.addEventListener("click", () => {

        saveBookmark(message);

    });

    actions.querySelector(".regenerate-btn")

        .addEventListener(

            "click",

            regenerateLastResponse

        );

}

/* ==========================================================
   ENHANCE MESSAGE
========================================================== */
function enhanceMessage(message) {

    const text = message.querySelector(".message-text");

    renderMarkdown(text);

    if (!message.querySelector(".message-actions")) {

        attachMessageActions(message);

    }

}

/* ==========================================================
   ENHANCE EXISTING
========================================================== */

function enhanceAllMessages() {

    document.querySelectorAll(".message")

        .forEach(enhanceMessage);

}

/* ==========================================================
   OVERRIDE AI MESSAGE
========================================================== */

const originalAssistantMessage = addAssistantMessage;

addAssistantMessage = function (message) {

    const element = originalAssistantMessage(

        message

    );

    enhanceMessage(element);

    return element;

};

/* ==========================================================
   EXPORT
========================================================== */

Object.assign(

    window.ChatUI,

    {

        renderMarkdown,

        enhanceMessage,

        enhanceAllMessages

    }

);

/* ==========================================================
   Aura AI
   CHAT.JS
   PART 4
========================================================== */

/* ==========================================================
   STREAM STATE
========================================================== */

let activeStream = null;

let streaming = false;


/* ==========================================================
   CREATE EMPTY AI MESSAGE
========================================================== */

function createStreamingMessage() {

    const element = addAssistantMessage("");

    const text = element.querySelector(".message-text");

    text.innerHTML = "";

    return {

        element,

        text

    };

}


/* ==========================================================
   STREAM RESPONSE
========================================================== */

async function streamResponse(message) {

    if (streaming) {

        return;

    }

    streaming = true;

    setLoading(true);

    const streamUI = createStreamingMessage();

    try {

        const response = await APIClient.streamChatMessage(

            message,

            Chat.messages

        );

        const reader = response.body.getReader();

        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {

            const {

                done,

                value

            } = await reader.read();

            if (done) {

                break;

            }

            buffer += decoder.decode(

                value,

                {

                    stream: true

                }

            );

            const lines = buffer.split("\n");

            buffer = lines.pop();

            for (const line of lines) {

                if (!line.startsWith("data:")) {

                    continue;

                }

                const text = line.replace(

                    "data:",

                    ""

                ).trim();

                if (text === "[DONE]") {

                    continue;

                }

                streamUI.text.textContent += text;

                renderMarkdown(streamUI.text);

                scrollBottom();

            }

        }

    }

    catch (error) {

        console.error(error);

        streamUI.text.innerHTML =

            "<b>Streaming failed.</b>";

    }

    finally {

        streaming = false;

        setLoading(false);

    }

}


/* ==========================================================
   STOP STREAM
========================================================== */

function stopStreaming() {

    if (activeStream) {

        activeStream.abort();

        activeStream = null;

    }

    streaming = false;

    hideTyping();

}


/* ==========================================================
   EDIT LAST USER MESSAGE
========================================================== */

function editLastUserMessage() {

    const last = [...Chat.messages]

        .reverse()

        .find(

            m => m.role === "user"

        );

    if (!last) {

        return;

    }

    DOM.messageInput.value = last.content;

    DOM.messageInput.focus();

}


/* ==========================================================
   RESEND MESSAGE
========================================================== */

async function resendEditedMessage() {

    const text = DOM.messageInput.value.trim();

    if (text === "") {

        return;

    }

    await sendMessage();

}


/* ==========================================================
   STREAM OR NORMAL
========================================================== */

async function generateResponse(message) {

    if (App.stream) {

        await streamResponse(message);

    }

    else {

        await sendMessage();

    }

}


/* ==========================================================
   SCROLL ANIMATION
========================================================== */

function smoothScroll() {

    DOM.chatMessages.scrollTo({

        top: DOM.chatMessages.scrollHeight,

        behavior: "smooth"

    });

}


/* ==========================================================
   EXPORT
========================================================== */

Object.assign(

    window.ChatUI,

    {

        streamResponse,

        stopStreaming,

        editLastUserMessage,

        resendEditedMessage,

        generateResponse,

        smoothScroll

    }

);

/* ==========================================================
   Aura AI
   CHAT.JS
   PART 5
========================================================== */

/* ==========================================================
   LOAD HISTORY
========================================================== */

async function loadHistory() {

    try {

        const chats = await APIClient.getHistory();

        if (typeof renderHistory === "function") {

            renderHistory(chats);

        }

    }

    catch (error) {

        console.error(error);

    }

}

/* ==========================================================
   CLEAR CONVERSATION
========================================================== */

function clearConversation() {

    Chat.messages = [];

    clearChatWindow();

    setChatTitle("New Chat");

    App.currentChatId = null;

}

/* ==========================================================
   SHARE CHAT
========================================================== */

async function shareCurrentChat() {

    if (!App.currentChatId) {

        showToast("No active chat", "warning");

        return;

    }

    const shareText = `${window.location.origin}?chat=${App.currentChatId}`;

    try {

        if (navigator.share) {

            await navigator.share({

                title: "Aura AI Chat",

                text: "Check out this conversation.",

                url: shareText

            });

        }

        else {

            copyToClipboard(shareText);

            showToast("Share link copied");

        }

    }

    catch (error) {

        console.error(error);

    }

}

/* ==========================================================
   EXPORT CHAT
========================================================== */

function exportTXT() {

    if (!App.currentChatId) {

        return;

    }

    APIClient.exportChatTXT(

        App.currentChatId

    );

}

function exportJSON() {

    if (!App.currentChatId) {

        return;

    }

    APIClient.exportChatJSON(

        App.currentChatId

    );

}

/* ==========================================================
   REMOVE MESSAGE (UI ONLY)
========================================================== */

function removeMessage(element) {

    if (element) {

        element.remove();

    }

}

/* ==========================================================
   MESSAGE COUNT
========================================================== */

function getMessageCount() {

    return Chat.messages.length;

}

/* ==========================================================
   FIND LAST MESSAGE
========================================================== */

function lastMessage() {

    if (Chat.messages.length === 0) {

        return null;

    }

    return Chat.messages[

        Chat.messages.length - 1

    ];

}

/* ==========================================================
   CHAT INITIALIZATION
========================================================== */

async function initializeChat() {

    await loadHistory();

    const exportButton = document.getElementById("exportChat");

    if (exportButton) {

        exportButton.addEventListener(

            "click",

            exportTXT

        );

    }

    const shareButton = document.getElementById("shareChat");

    if (shareButton) {

        shareButton.addEventListener(

            "click",

            shareCurrentChat

        );

    }

    const clearButton = document.getElementById("clearChat");

    if (clearButton) {

        clearButton.addEventListener(

            "click",

            clearConversation

        );

    }

}

/* ==========================================================
   START CHAT MODULE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initializeChat

);

/* ==========================================================
   EXPORT MODULE
========================================================== */

Object.assign(

    window.ChatUI,

    {

        loadHistory,

        clearConversation,

        shareCurrentChat

    }

);

const deleteBtn = document.getElementById("deleteChat");

if (deleteBtn) {

    deleteBtn.addEventListener("click", async () => {

        if (!App.currentChatId) {

            showToast("No chat selected.", "warning");

            return;

        }

        if (!confirm("Delete this chat?")) {

            return;

        }

        try {

            await APIClient.deleteChat(App.currentChatId);

            await SidebarUI.loadHistory();

            clearConversation();

            App.currentChatId = null;

        }

        catch (error) {

            console.error(error);

            showToast("Unable to delete chat.", "danger");

        }

    });

}

function fillPrompt(text) {

    DOM.messageInput.value = text;

    DOM.messageInput.focus();

    DOM.messageInput.dispatchEvent(

        new Event("input")

    );

}

function saveBookmark(message) {

    const title = message.querySelector(".message-header .sender")
        ? message.querySelector(".message-header .sender").innerText
        : "Aura AI";

    const content = message.querySelector(".message-text").innerText;

    const time = message.querySelector(".time")
        ? message.querySelector(".time").innerText
        : "";

    let bookmarks = JSON.parse(

        localStorage.getItem("auraBookmarks") || "[]"

    );

    bookmarks.push({

        id: Date.now(),

        title,

        content,

        time

    });

    localStorage.setItem(

        "auraBookmarks",

        JSON.stringify(bookmarks)

    );

    alert("⭐ Bookmark Saved");

}

function showToast(message) {

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 2500);

}

async function regenerateResponse() {

    if (!App.lastUserMessage) {

        showToast("Nothing to regenerate");

        return;

    }

    const aiMessages = document.querySelectorAll(".ai-message");

    if (aiMessages.length) {

        aiMessages[aiMessages.length - 1].remove();
    }

    setLoading(true);

    try {

        const response = await APIClient.sendChatMessage(

            App.currentChatId,

            App.lastUserMessage

        );

        addAssistantMessage(response.response);

    }

    catch (error) {

        console.error(error);

        showToast("Failed to regenerate");

    }

    finally {

        setLoading(false);

    }

}

/* ==========================================================
   TEXT TO SPEECH
========================================================== */

function speakResponse(text) {

    if (!("speechSynthesis" in window)) {

        showToast("Speech is not supported.", "danger");

        return;

    }

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 1;

    speech.pitch = 1;

    speech.volume = 1;

    speechSynthesis.speak(speech);

}

