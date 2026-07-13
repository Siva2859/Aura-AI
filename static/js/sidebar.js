/* ==========================================================
   Aura AI
   SIDEBAR.JS
========================================================== */

"use strict";

/* ==========================================================
   SIDEBAR MODULE
========================================================== */

const Sidebar = {

    chats: [],

    activeChat: null

};

/* ==========================================================
   LOAD HISTORY
========================================================== */

async function loadHistory(){

    try{

        const chats = await APIClient.getHistory();

        Sidebar.chats = chats;

        renderHistory(chats);

    }

    catch(error){

        console.error(error);

        showToast("Unable to load chats","danger");

    }

}

/* ==========================================================
   RENDER HISTORY
========================================================== */

function renderHistory(chats){

    DOM.history.innerHTML = "";

    if(!chats || chats.length === 0){

        DOM.history.innerHTML = `

            <div class="empty-history">

                No chats yet

            </div>

        `;

        return;

    }

    chats.forEach(chat=>{

        const item = createHistoryItem(chat);

        DOM.history.appendChild(item);

        if(chat.id === App.currentChatId){

            item.classList.add("active");

        }

    });

}

/* ==========================================================
   CREATE HISTORY ITEM
========================================================== */

function createHistoryItem(chat){

    const div = document.createElement("div");

    div.className = "history-item";

    div.dataset.id = chat.id;

    // Chat icon
    const icon = document.createElement("i");
    icon.className = "ri-message-2-line";

    // Chat title
    const title = document.createElement("span");

    title.className = "history-name";

    title.textContent = chat.title;

    // Rename button
    const rename = document.createElement("button");
    rename.className = "history-action-btn";
    rename.innerHTML = '<i class="ri-edit-line"></i>';

    rename.onclick = async (e) => {

        e.stopPropagation();

        const newTitle = prompt("Rename chat:", chat.title);

        if (!newTitle) return;

        try{

            await APIClient.renameChat(chat.id, newTitle);

            await loadHistory();

            showToast("Chat renamed");

        }
        catch(error){

            console.error(error);

            showToast("Rename failed", "danger");

        }

    };

    // Delete button
    const del = document.createElement("button");
    del.className = "history-action-btn";
    del.innerHTML = '<i class="ri-delete-bin-line"></i>';

    del.onclick = async (e) => {

        e.stopPropagation();

        if(!confirm("Delete this chat?")) return;

        try{

            await APIClient.deleteChat(chat.id);

            if(App.currentChatId === chat.id){

                ChatUI.clearConversation();

                App.currentChatId = null;

            }

            await loadHistory();

            showToast("Chat deleted");

        }
        catch(error){

            console.error(error);

            showToast("Delete failed", "danger");

        }

    };

    // Right-side buttons container
    const actions = document.createElement("div");
    actions.className = "history-actions";

    actions.appendChild(rename);
    actions.appendChild(del);

    // Build item
    div.appendChild(icon);
    div.appendChild(title);
    div.appendChild(actions);

    // Open chat when clicked
    div.addEventListener("click", () => {

        selectChat(chat.id);

    });

    return div;

}

/* ==========================================================
   SELECT CHAT
========================================================== */

async function selectChat(chatId){

    try{

        setActiveChat(chatId);

        if(window.ChatUI){

            await ChatUI.loadConversation(chatId);

        }

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
   ACTIVE CHAT
========================================================== */

function setActiveChat(chatId){

    Sidebar.activeChat = chatId;

    document

        .querySelectorAll(".history-item")

        .forEach(item=>{

            item.classList.remove("active");

        });

    const active = document.querySelector(

        `.history-item[data-id="${chatId}"]`

    );

    if(active){

        active.classList.add("active");

    }

}

/* ==========================================================
   SEARCH
========================================================== */

async function searchChats(){

    const keyword = DOM.searchChat.value.trim();

    if(keyword === ""){

        renderHistory(Sidebar.chats);

        return;

    }

    try{

        const result = await APIClient.searchChat(keyword);

        renderHistory(result);

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
   RENAME CHAT
========================================================== */

async function renameCurrentChat(){

    if(!Sidebar.activeChat){

        return;

    }

    const title = prompt("New chat title:");

    if(!title){

        return;

    }

    try{

        await APIClient.renameChat(

            Sidebar.activeChat,

            title

        );

        await loadHistory();

        ChatUI.setChatTitle(title);

        showToast("Chat renamed");

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
   DELETE CHAT
========================================================== */

async function deleteCurrentChat(){

    if(!Sidebar.activeChat){

        return;

    }

    if(

        !confirm("Delete this chat?")

    ){

        return;

    }

    try{

        await APIClient.deleteChat(

            Sidebar.activeChat

        );

        Sidebar.activeChat = null;

        ChatUI.clearConversation();

        await loadHistory();

        showToast("Chat deleted");

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
   NEW CHAT
========================================================== */

async function createSidebarChat(){

    if(window.ChatUI){

        await ChatUI.createNewChat();

    }

    await loadHistory();

}

/* ==========================================================
   SIDEBAR TOGGLE
========================================================== */

function toggleSidebar(){

    DOM.sidebar.classList.toggle("active");

}

/* ==========================================================
   START
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initializeSidebar

);

document

.getElementById("bookmarkBtn")

.addEventListener(

    "click",

    showBookmarks

);


/* ==========================================================
   EXPORT
========================================================== */

window.SidebarUI = {

    loadHistory,

    renderHistory,

    selectChat,

    renameCurrentChat,

    deleteCurrentChat,

    createSidebarChat,

    toggleSidebar

};

function showBookmarks(){

    const bookmarks = JSON.parse(
        localStorage.getItem("auraBookmarks") || "[]"
    );

    if(bookmarks.length === 0){
        alert("No bookmarks found.");
        return;
    }

    let text = "";

    bookmarks.forEach((bookmark,index)=>{

        const title =
            bookmark.title ||
            bookmark.text?.title ||
            "Untitled";

        const content =
            bookmark.content ||
            bookmark.text?.content ||
            "";

        text +=
            `${index+1}. ${title}\n` +
            `${content.substring(0,100)}...\n\n`;

    });

    alert(text);

}

const chatsBtn = document.getElementById("chatsBtn");

if(chatsBtn){

    chatsBtn.addEventListener("click",()=>{

        showWelcomeScreen();

    });

}

document.getElementById("chatsBtn").addEventListener("click", () => {

    ChatUI.clearChatWindow();

    document.getElementById("welcomeScreen").style.display = "block";

    document.querySelector(".suggestion-grid").style.display = "grid";

    document.getElementById("chatTitle").textContent = "Aura AI Assistant";

    App.currentChatId = null;

});

const chatBtn = document.querySelector(".menu-item");

chatBtn.addEventListener("click", () => {

    showHomePage();

});

function showHomePage(){

    const chatMessages = document.getElementById("chatMessages");

    if(!chatMessages) return;

    chatMessages.innerHTML = document.getElementById("welcomeScreen").outerHTML;

}

