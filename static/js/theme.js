/* ==========================================================
   AURA AI
   THEME.JS
========================================================== */

"use strict";

/* ==========================================================
   THEME MODULE
========================================================== */

const Theme = {

    current: "dark"

};

/* ==========================================================
   INITIALIZE
========================================================== */

function initializeTheme(){

    loadTheme();

    bindThemeEvents();

}

/* ==========================================================
   EVENTS
========================================================== */

function bindThemeEvents(){

    if(!DOM.darkMode){

        return;

    }

    DOM.darkMode.removeEventListener(

        "change",

        toggleTheme

    );

    DOM.darkMode.addEventListener(

        "change",

        toggleTheme

    );

}

/* ==========================================================
   TOGGLE
========================================================== */

function toggleTheme(){

    Theme.current =
        Theme.current==="dark"
        ? "light"
        : "dark";

    applyTheme();

    saveTheme();

    showToast(

        Theme.current === "dark"

            ? "Dark mode enabled"

            : "Light mode enabled"

    );

}

/* ==========================================================
   APPLY
========================================================== */

function applyTheme(){

    document.body.classList.toggle(

        "light-theme",

        Theme.current==="light"

    );

    document.documentElement.setAttribute(

        "data-theme",

        Theme.current

    );

    if(DOM.darkMode){

        DOM.darkMode.checked =

            Theme.current==="dark";

    }

}

/* ==========================================================
   SAVE
========================================================== */

function saveTheme(){

    localStorage.setItem(

        "Aura_theme",

        Theme.current

    );

}

/* ==========================================================
   LOAD
========================================================== */

function loadTheme(){

    const saved = localStorage.getItem(

        "Aura_theme"

    );

    if(saved){

        Theme.current = saved;

    }

    else{

        Theme.current =

            window.matchMedia(

                "(prefers-color-scheme: dark)"

            ).matches

            ? "dark"

            : "light";

    }

    applyTheme();

}

/* ==========================================================
   SYSTEM THEME
========================================================== */

window.matchMedia(

    "(prefers-color-scheme: dark)"

).addEventListener(

    "change",

    event=>{

        if(

            !localStorage.getItem(

                "Aura_theme"

            )

        ){

            Theme.current =

                event.matches

                ? "dark"

                : "light";

            applyTheme();

        }

    }

);

/* ==========================================================
   EXPORT
========================================================== */

window.ThemeUI = {

    toggleTheme,

    applyTheme,

    loadTheme,

    saveTheme,

    getTheme(){

        return Theme.current;

    }

};

/* ==========================================================
   START
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initializeTheme

);