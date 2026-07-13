/* ==========================================================
   Aura AI
   SEARCH.JS
========================================================== */

"use strict";

/* ==========================================================
   SEARCH MODULE
========================================================== */

const Search = {

    keyword: "",

    delay: null,

    history: []

};

/* ==========================================================
   INITIALIZE
========================================================== */

function initializeSearch(){

    if(!DOM.searchChat){

        return;

    }

    DOM.searchChat.addEventListener(

        "input",

        debounceSearch

    );

    DOM.searchChat.addEventListener(

        "keydown",

        handleSearchKeys

    );

}

/* ==========================================================
   DEBOUNCE
========================================================== */

function debounceSearch(){

    clearTimeout(

        Search.delay

    );

    Search.delay = setTimeout(

        performSearch,

        500

    );

}

/* ==========================================================
   SEARCH
========================================================== */

async function performSearch(){

    const keyword = DOM.searchChat.value.trim();

    Search.keyword = keyword;

    if(keyword === ""){

        SidebarUI.loadHistory();

        return;

    }

    try{

        const results = await APIClient.searchChat(

            keyword

        );

        if(window.SidebarUI){

            SidebarUI.renderHistory(results);

        }

        if(keyword.length >= 2){

            Search.history.unshift(keyword);

            Search.history = [

                ...new Set(Search.history)

            ].slice(0,10);

        }

    }

    catch(error){

        console.error(error);

        showToast(

            "Search failed",

            "danger"

        );

    }

}

/* ==========================================================
   CLEAR SEARCH
========================================================== */

function clearSearch(){

    DOM.searchChat.value = "";

    Search.keyword = "";

    if(window.SidebarUI){

        SidebarUI.loadHistory();

    }

}

/* ==========================================================
   KEYBOARD
========================================================== */

function handleSearchKeys(event){

    if(event.key === "Escape"){

        clearSearch();

    }

}

/* ==========================================================
   HIGHLIGHT ACTIVE CHAT
========================================================== */

function highlightChat(chatId){

    document

        .querySelectorAll(".history-item")

        .forEach(item=>{

            item.classList.remove("active");

        });

    const item = document.querySelector(

        `.history-item[data-id="${chatId}"]`

    );

    if(item){

        item.classList.add("active");

        item.scrollIntoView({

            behavior:"smooth",

            block:"nearest"

        });

    }

}

/* ==========================================================
   SEARCH HISTORY
========================================================== */

function getSearchHistory(){

    return Search.history;

}

function clearSearchHistory(){

    Search.history = [];

}

/* ==========================================================
   EXPORT
========================================================== */

window.SearchUI = {

    performSearch,

    clearSearch,

    highlightChat,

    getSearchHistory,

    clearSearchHistory

};

/* ==========================================================
   START
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initializeSearch

);

