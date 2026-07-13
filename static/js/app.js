/* ==========================================================
   Aura AI
   APP.JS
   PART 1
========================================================== */

"use strict";

/* ==========================================================
   GLOBAL APPLICATION
========================================================== */

const App = {

    currentChatId: null,

    currentModel: "llama-3.3-70b-versatile",

    temperature: 0.7,

    maxTokens: 2048,

    stream: false,

    darkMode: true,

    uploading: false,

    loading: false,

    initialized: false,

    lastUserMessage: ""

};


/* ==========================================================
   DOM CACHE
========================================================== */

const DOM = {

    app: document.querySelector(".app"),

    sidebar: document.querySelector(".sidebar"),

    rightPanel: document.querySelector(".right-panel"),

    chatMessages: document.getElementById("chatMessages"),

    chatTitle: document.getElementById("chatTitle"),

    messageInput: document.getElementById("messageInput"),

    sendBtn: document.getElementById("sendBtn"),

    typingIndicator: document.getElementById("typingIndicator"),

    history: document.getElementById("chatHistory"),

    newChat: document.getElementById("newChat"),

    searchChat: document.getElementById("searchChat"),

    attachBtn: document.getElementById("attachBtn"),

    fileInput: document.getElementById("fileInput"),

    uploadPreview: document.getElementById("uploadPreview"),

    modelSelect: document.getElementById("modelSelect"),

    temperature: document.getElementById("temperature"),

    tokens: document.getElementById("tokens"),

    streamToggle: document.getElementById("streamToggle"),

    darkMode: document.getElementById("darkMode"),

    settingsBtn: document.getElementById("settingsBtn"),


};


/* ==========================================================
   APPLICATION START
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initializeApplication

);


/* ==========================================================
   INITIALIZE
========================================================== */

async function initializeApplication(){

    if(App.initialized){

        return;

    }

    registerEvents();

    initializeSidebar();

    initializeSettingsModule();

    initializeTextarea();

    initializeVoiceInput();

    App.initialized=true;

    console.log("Aura AI Started");

}


/* ==========================================================
   REGISTER EVENTS
========================================================== */

function registerEvents(){

    DOM.sendBtn.addEventListener(

        "click",

        sendMessage

    );

    DOM.newChat.addEventListener(

        "click",

        createNewChat

    );

    DOM.attachBtn.addEventListener(

        "click",

        ()=>DOM.fileInput.click()

    );

    DOM.fileInput.addEventListener(

        "change",

        handleFileSelection

    );

    DOM.searchChat.addEventListener(

        "input",

        searchChats

    );

    DOM.messageInput.addEventListener(

        "keydown",

        handleKeyboard

    );

    DOM.modelSelect.addEventListener(

        "change",

        updateModel

    );

    DOM.temperature.addEventListener(

        "input",

        updateTemperature

    );

    DOM.tokens.addEventListener(

        "input",

        updateTokens

    );

    DOM.streamToggle.addEventListener(

        "change",

        updateStreaming

    );

    DOM.darkMode.addEventListener(

        "change",

        toggleTheme

    );

}


/* ==========================================================
   TEXTAREA
========================================================== */

function initializeTextarea(){

    DOM.messageInput.addEventListener(

        "input",

        autoResizeTextarea

    );

}


function autoResizeTextarea(){

    DOM.messageInput.style.height="auto";

    DOM.messageInput.style.height=

        DOM.messageInput.scrollHeight+"px";

}


/* ==========================================================
   KEYBOARD
========================================================== */

function handleKeyboard(event){

    if(

        event.key==="Enter"

        &&

        !event.shiftKey

    ){

        event.preventDefault();

        sendMessage();

    }

}

/* ==========================================================
   HELPERS
========================================================== */

function scrollBottom(){

    DOM.chatMessages.scrollTop=

        DOM.chatMessages.scrollHeight;

}


function showTyping(){

    DOM.typingIndicator.classList.remove(

        "hidden"

    );

}


function hideTyping(){

    DOM.typingIndicator.classList.add(

        "hidden"

    );

}

/* ==========================================================
   APP.JS
   PART 2
========================================================== */

/* ==========================================================
   LOCAL STORAGE
========================================================== */

const Storage = {

    save(key, value){

        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

    },

    load(key, defaultValue=null){

        const value = localStorage.getItem(key);

        if(!value){

            return defaultValue;

        }

        try{

            return JSON.parse(value);

        }

        catch{

            return defaultValue;

        }

    },

    remove(key){

        localStorage.removeItem(key);

    }

};


/* ==========================================================
   RESTORE SESSION
========================================================== */

function restoreSession(){

    const settings = Storage.load("Aura_settings");

    if(!settings){

        return;

    }

    App.currentModel = settings.model || App.currentModel;

    App.temperature = settings.temperature ?? App.temperature;

    App.maxTokens = settings.maxTokens ?? App.maxTokens;

    App.stream = settings.stream ?? App.stream;

    App.darkMode = settings.darkMode ?? App.darkMode;

    initializeSettingsModule();

}


/* ==========================================================
   SAVE SESSION
========================================================== */

function saveSession(){

    Storage.save(

        "Aura_settings",

        {

            model:App.currentModel,

            temperature:App.temperature,

            maxTokens:App.maxTokens,

            stream:App.stream,

            darkMode:App.darkMode

        }

    );

}


/* ==========================================================
   TOAST
========================================================== */

function showToast(

    message,

    type="success"

){

    const toast = document.createElement("div");

    toast.className = `toast toast-show ${type}`;

    toast.innerHTML = `

        <i class="ri-information-line"></i>

        <span>${message}</span>

    `;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.classList.remove("toast-show");

        toast.classList.add("toast-hide");

        setTimeout(()=>{

            toast.remove();

        },300);

    },2500);

}


/* ==========================================================
   LOADING OVERLAY
========================================================== */

function showLoading(){

    if(document.getElementById("loadingScreen")){

        return;

    }

    const overlay = document.createElement("div");

    overlay.id = "loadingScreen";

    overlay.className = "loading-screen";

    overlay.innerHTML = `

        <div class="spinner"></div>

        <p>Loading...</p>

    `;

    document.body.appendChild(overlay);

}


function hideLoading(){

    const overlay = document.getElementById("loadingScreen");

    if(overlay){

        overlay.remove();

    }

}


/* ==========================================================
   MOBILE SIDEBAR
========================================================== */

function openSidebar(){

    DOM.sidebar.classList.add("active");

}


function closeSidebar(){

    DOM.sidebar.classList.remove("active");

}


function toggleSidebar(){

    DOM.sidebar.classList.toggle("active");

}


/* ==========================================================
   SETTINGS PANEL
========================================================== */

function openSettings(){

    DOM.rightPanel.classList.add("active");

}

function closeSettings(){

    DOM.rightPanel.classList.remove("active");

}


function toggleSettings(){

    DOM.rightPanel.classList.toggle("active");

}

/* ==========================================================
   GLOBAL ERROR HANDLER
========================================================== */

window.addEventListener(

    "error",

    function(event){

        console.error(event.error);

        showToast(

            "Unexpected error occurred",

            "danger"

        );

    }

);


/* ==========================================================
   BEFORE UNLOAD
========================================================== */

window.addEventListener(

    "beforeunload",

    saveSession

);


/* ==========================================================
   UPDATE INITIALIZER
========================================================== */

const oldInitialize = initializeApplication;

initializeApplication = async function(){

    await oldInitialize();

    restoreSession();

    console.log("Application Ready");

};


/* ==========================================================
   PLACEHOLDER MODULES
========================================================== */

function initializeModules(){

    // chat.js

    // api.js

    // sidebar.js

    // upload.js

    // search.js

    // settings.js

}

/* ==========================================================
   APP.JS
   PART 3
========================================================== */

/* ==========================================================
   KEYBOARD SHORTCUTS
========================================================== */

document.addEventListener(

    "keydown",

    handleShortcuts

);

function handleShortcuts(event){

    /* Ctrl + N */

    if(event.ctrlKey && event.key==="n"){

        event.preventDefault();

        createNewChat();

    }

    /* Ctrl + K */

    if(event.ctrlKey && event.key==="k"){

        event.preventDefault();

        DOM.searchChat.focus();

    }

    /* Ctrl + / */

    if(event.ctrlKey && event.key==="/"){

        event.preventDefault();

        DOM.messageInput.focus();

    }

    /* Escape */

    if(event.key==="Escape"){

        closeSidebar();

        closeSettings();

    }

}


/* ==========================================================
   CLIPBOARD
========================================================== */

async function copyToClipboard(text){

    try{

        await navigator.clipboard.writeText(text);

        showToast("Copied to clipboard");

    }

    catch(error){

        console.error(error);

        showToast("Copy failed","danger");

    }

}


/* ==========================================================
   DOWNLOAD FILE
========================================================== */

function downloadText(filename,text){

    const blob=new Blob(

        [text],

        {

            type:"text/plain"

        }

    );

    const url=URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;

    a.download=filename;

    a.click();

    URL.revokeObjectURL(url);

}


/* ==========================================================
   NETWORK STATUS
========================================================== */

window.addEventListener(

    "online",

    ()=>{

        showToast("Back Online","success");

    }

);

window.addEventListener(

    "offline",

    ()=>{

        showToast("No Internet Connection","danger");

    }

);


/* ==========================================================
   FULLSCREEN
========================================================== */

function toggleFullscreen(){

    if(

        !document.fullscreenElement

    ){

        document.documentElement.requestFullscreen();

    }

    else{

        document.exitFullscreen();

    }

}


/* ==========================================================
   PERFORMANCE
========================================================== */

function startTimer(){

    return performance.now();

}

function stopTimer(start){

    return (

        performance.now()-start

    ).toFixed(2);

}


/* ==========================================================
   RANDOM ID
========================================================== */

function randomId(){

    return Math.random()

        .toString(36)

        .substring(2,10);

}


/* ==========================================================
   DATE FORMAT
========================================================== */

function currentTime(){

    return new Date()

        .toLocaleTimeString(

            [],

            {

                hour:"2-digit",

                minute:"2-digit"

            }

        );

}


/* ==========================================================
   LOADING STATE
========================================================== */

function setLoading(state){

    App.loading=state;

    DOM.sendBtn.disabled=state;

    if(state){

        showTyping();

    }

    else{

        hideTyping();

    }

}


/* ==========================================================
   BUTTON STATE
========================================================== */

function enableButton(button){

    button.disabled=false;

}

function disableButton(button){

    button.disabled=true;

}


/* ==========================================================
   APPLICATION INFO
========================================================== */

function appInfo(){

    console.table({

        Application:"Aura AI",

        Version:"1.0.0",

        Framework:"Flask",

        Frontend:"HTML/CSS/JS",

        Database:"SQLite"

    });

}


/* ==========================================================
   INITIAL STARTUP
========================================================== */

window.addEventListener(

    "load",

    ()=>{

        appInfo();

        console.log(

            "Application Loaded Successfully"

        );

    }

);

function initializeSidebar(){

    const bookmarkBtn = document.getElementById("bookmarkBtn");

    if(bookmarkBtn){

        bookmarkBtn.addEventListener("click", ()=>{

            showToast("Bookmarks feature coming soon.");

        });

    }

    const documentsBtn = document.getElementById("documentsBtn");

    if(documentsBtn){

        documentsBtn.addEventListener("click", ()=>{

            UploadUI.refreshUploadedFiles();

        });

    }

    document.querySelectorAll(".menu-item").forEach(item=>{

        item.addEventListener("click",function(){

            document.querySelectorAll(".menu-item").forEach(x=>{

                x.classList.remove("active");

            });

            this.classList.add("active");

            if(this.id==="settingsBtn"){

                openSettings();

            }

            else{

                closeSettings();

            }

        });

    });

}

/* ==========================================================
   GLOBAL HELPERS
========================================================== */

window.Aura={

    App,

    DOM,

    showToast,

    showLoading,

    hideLoading,

    scrollBottom,

    copyToClipboard,

    randomId,

    currentTime,

    toggleFullscreen,

    setLoading

};

window.DOM = DOM;
window.App = App;
window.showToast = showToast;
window.scrollBottom = scrollBottom;
window.copyToClipboard = copyToClipboard;
window.currentTime = currentTime;
window.setLoading = setLoading;

/* ==========================================================
   VOICE INPUT
========================================================== */

function initializeVoiceInput(){

    const voiceBtn = document.getElementById("voiceBtn");

    const messageInput = document.getElementById("messageInput");

    if(!voiceBtn || !messageInput){

        return;

    }

    const SpeechRecognition =

        window.SpeechRecognition ||

        window.webkitSpeechRecognition;

    if(!SpeechRecognition){

        voiceBtn.style.display = "none";

        console.warn("Speech Recognition not supported.");

        return;

    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.continuous = false;

    voiceBtn.addEventListener("click", () => {

        recognition.start();

        voiceBtn.classList.add("listening");

        showToast("🎤 Listening...");

    });

    recognition.onresult = async (event) => {

        const transcript = event.results[0][0].transcript;

        messageInput.value = transcript;

        messageInput.focus();

        console.log("Voice finished");
        console.log(transcript);
        console.log("Calling sendMessage...");

        await sendMessage();

    };

    recognition.onerror = () => {

        voiceBtn.classList.remove("listening");

        showToast("Voice recognition failed","danger");

    };

    recognition.onend = () => {

        voiceBtn.classList.remove("listening");

    };

}
