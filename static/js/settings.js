/* ==========================================================
   Aura AI
   SETTINGS.JS
========================================================== */

"use strict";

/* ==========================================================
   DEFAULT SETTINGS
========================================================== */

const DefaultSettings = {

    model: "llama-3.3-70b-versatile",

    temperature: 0.7,

    maxTokens: 2048,

    stream: true

};

/* ==========================================================
   SETTINGS MODULE
========================================================== */

const Settings = {

    ...DefaultSettings

};

/* ==========================================================
   INITIALIZE
========================================================== */

function initializeSettingsModule(){

    loadSettings();

    bindSettingEvents();

        if(DOM.darkMode){

            DOM.darkMode.addEventListener(

                "change",

                updateDarkMode

            );

        }

    updateUI();

}

/* ==========================================================
   EVENTS
========================================================== */

function bindSettingEvents(){

    if(DOM.modelSelect){

        DOM.modelSelect.addEventListener(

            "change",

            updateModel

        );

    }

    if(DOM.temperature){

        DOM.temperature.addEventListener(

            "input",

            updateTemperature

        );

    }

    if(DOM.tokens){

        DOM.tokens.addEventListener(

            "input",

            updateTokens

        );

    }

    if(DOM.streamToggle){

        DOM.streamToggle.addEventListener(

            "change",

            updateStreaming

        );

    }

}

/* ==========================================================
   MODEL
========================================================== */

function updateModel(){

    Settings.model = DOM.modelSelect.value;

    App.currentModel = Settings.model;

    showToast("Model changed");

    saveSettings();

}

/* ==========================================================
   TEMPERATURE
========================================================== */

function updateTemperature(){

    Settings.temperature = Number(DOM.temperature.value);

    document.getElementById("tempValue").textContent =
        Settings.temperature.toFixed(1);

    App.temperature = Settings.temperature;

    saveSettings();

}

/* ==========================================================
   TOKENS
========================================================== */

function updateTokens(){

    Settings.maxTokens = Number(DOM.tokens.value);

    document.getElementById("tokenValue").textContent =
        Settings.maxTokens;

    App.maxTokens = Settings.maxTokens;

    saveSettings();

}

/* ==========================================================
   STREAM
========================================================== */

function updateStreaming(){

    Settings.stream = DOM.streamToggle.checked;

    App.stream = Settings.stream;

    saveSettings();

}

/* ==========================================================
   DARK MODE
========================================================== */

function updateDarkMode(){

    document.body.classList.toggle(

        "light-theme",

        !DOM.darkMode.checked

    );

    saveSettings();

}

/* ==========================================================
   SAVE
========================================================== */

function saveSettings(){

    localStorage.setItem(

        "Aura_settings",

        JSON.stringify(Settings)

    );

}

/* ==========================================================
   LOAD
========================================================== */

function loadSettings(){

    const saved = localStorage.getItem(

        "Aura_settings"

    );

    if(!saved){

        return;

    }

    try{

        Object.assign(

            Settings,

            JSON.parse(saved)

        );

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
   RESET
========================================================== */

function resetSettings(){

    Object.assign(

        Settings,

        DefaultSettings

    );

    updateUI();
    
    if(DOM.darkMode){

        DOM.darkMode.checked = true;

    }

    App.currentModel = Settings.model;

    App.temperature = Settings.temperature;

    App.maxTokens = Settings.maxTokens;

    App.stream = Settings.stream;

    saveSettings();

    showToast(

        "Settings reset"

    );

}

/* ==========================================================
   UPDATE UI
========================================================== */

function updateUI(){

    if(DOM.modelSelect){

        DOM.modelSelect.value = Settings.model;

    }

    if(DOM.temperature){

        DOM.temperature.value =

            Settings.temperature;

    }

    const tempValue = document.getElementById("tempValue");

    if(tempValue){

        tempValue.textContent = Settings.temperature.toFixed(1);

    }

    if(DOM.tokens){

        DOM.tokens.value =

            Settings.maxTokens;

    }

    const tokenValue = document.getElementById("tokenValue");

    if(tokenValue){

        tokenValue.textContent = Settings.maxTokens;

    }

    if(DOM.streamToggle){

        DOM.streamToggle.checked =

            Settings.stream;

    }

    App.currentModel = Settings.model;

    App.temperature = Settings.temperature;

    App.maxTokens = Settings.maxTokens;

    App.stream = Settings.stream;

}

/* ==========================================================
   EXPORT
========================================================== */

window.SettingsUI = {

    resetSettings,

    saveSettings,

    loadSettings,

    updateUI,

    getSettings(){

        return {

            ...Settings

        };

    }

};

/* ==========================================================
   START
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initializeSettingsModule

);

const clearBtn = document.getElementById("clearHistory");

if (clearBtn) {

    clearBtn.addEventListener("click", async () => {

        if (!confirm("Delete all chats?")) {

            return;

        }

        try {

            await APIClient.deleteAllChats();

            showToast("All chats deleted");

            location.reload();

        }
        catch (error) {

            console.error(error);

            showToast("Unable to delete chats", "danger");

        }

    });

}