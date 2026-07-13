/* ==========================================================
   Aura AI
   API.JS
   PART 1
========================================================== */

"use strict";

/* ==========================================================
   API CONFIGURATION
========================================================== */

const API = {

    BASE_URL: "",

    HEADERS: {

        "Content-Type": "application/json"

    }

};


/* ==========================================================
   API REQUEST
========================================================== */

async function apiRequest(

    url,

    method = "GET",

    body = null

){

    const options = {

        method,

        headers: API.HEADERS

    };

    if(body){

        options.body = JSON.stringify(body);

    }

    try{

        const response = await fetch(

            API.BASE_URL + url,

            options

        );

        const data = await response.json();

        if(!response.ok){

            throw new Error(

                data.message ||

                "Server Error"

            );

        }

        return data;

    }

    catch(error){

        console.error(error);

        showToast(

            error.message,

            "danger"

        );

        throw error;

    }

}


/* ==========================================================
   GET
========================================================== */

async function apiGet(url){

    return apiRequest(

        url,

        "GET"

    );

}


/* ==========================================================
   POST
========================================================== */

async function apiPost(

    url,

    body

){

    return apiRequest(

        url,

        "POST",

        body

    );

}


/* ==========================================================
   DELETE
========================================================== */

async function apiDelete(url){

    return apiRequest(

        url,

        "DELETE"

    );

}


/* ==========================================================
   HEALTH CHECK
========================================================== */

async function healthCheck(){

    try{

        const result = await apiGet(

            "/health"

        );

        console.log(

            "Server Connected",

            result

        );

    }

    catch{

        showToast(

            "Backend Offline",

            "danger"

        );

    }

}


/* ==========================================================
   APPLICATION INFO
========================================================== */

async function aboutApplication(){

    return apiGet(

        "/about"

    );

}


/* ==========================================================
   CHAT HISTORY
========================================================== */

async function getHistory(){

    return apiGet(

        "/history"

    );

}


/* ==========================================================
   LOAD CHAT
========================================================== */

async function loadChat(

    chatId

){

    return apiGet(

        `/chat/${chatId}`

    );

}


/* ==========================================================
   NEW CHAT
========================================================== */

async function newChat(

    title="New Chat"

){

    return apiPost(

        "/new_chat",

        {

            title

        }

    );

}

/* ==========================================================
   Aura AI
   API.JS
   PART 2
========================================================== */

/* ==========================================================
   SEND MESSAGE
========================================================== */

async function sendChatMessage(

    chatId,

    message

){

    return apiPost(

        "/chat",

        {

            chat_id: chatId,

            message: message,

            model: App.currentModel,

            temperature: App.temperature,

            max_tokens: App.maxTokens

        }

    );

}


/* ==========================================================
   STREAM MESSAGE
========================================================== */

async function streamChatMessage(

    message,

    history=[]

){

    return fetch(

        API.BASE_URL + "/stream_chat",

        {

            method:"POST",

            headers:API.HEADERS,

            body:JSON.stringify({

                message,

                history,

                model: App.currentModel,

                temperature: App.temperature,

                max_tokens: App.maxTokens

            })

        }

    );

}


/* ==========================================================
   RENAME CHAT
========================================================== */

async function renameChat(

    chatId,

    title

){

    return apiPost(

        "/rename_chat",

        {

            chat_id:chatId,

            title:title

        }

    );

}


/* ==========================================================
   DELETE CHAT
========================================================== */

async function deleteChat(

    chatId

){

    return apiDelete(

        `/delete_chat/${chatId}`

    );

}


/* ==========================================================
   SEARCH CHATS
========================================================== */

async function searchChat(

    keyword

){

    return apiGet(

        `/search?q=${encodeURIComponent(keyword)}`

    );

}


/* ==========================================================
   CHAT INFORMATION
========================================================== */

async function getChatInfo(

    chatId

){

    return apiGet(

        `/chat_info/${chatId}`

    );

}


/* ==========================================================
   DELETE ALL CHATS
========================================================== */

async function deleteAllChats(){

    return apiDelete(

        "/delete_all"

    );

}


/* ==========================================================
   EXPORT CHAT
========================================================== */

function exportChatTXT(

    chatId

){

    window.open(

        `/export/txt/${chatId}`,

        "_blank"

    );

}


function exportChatJSON(

    chatId

){

    window.open(

        `/export/json/${chatId}`,

        "_blank"

    );

}


/* ==========================================================
   CONNECTION TEST
========================================================== */

async function testConnection(){

    try{

        await healthCheck();

        return true;

    }

    catch(error){

        return false;

    }

}


/* ==========================================================
   API OBJECT
========================================================== */

window.APIClient={

    apiGet,

    apiPost,

    apiDelete,

    healthCheck,

    aboutApplication,

    getHistory,

    loadChat,

    newChat,

    sendChatMessage,

    streamChatMessage,

    renameChat,

    deleteChat,

    searchChat,

    getChatInfo,

    deleteAllChats,

    exportChatTXT,

    exportChatJSON,

    testConnection

};

/* ==========================================================
   Aura AI
   API.JS
   PART 3
========================================================== */

/* ==========================================================
   FILE UPLOAD
========================================================== */

async function uploadFile(file){

    const formData = new FormData();

    formData.append("file", file);

    try{

        const response = await fetch(

            API.BASE_URL + "/upload",

            {

                method: "POST",

                body: formData

            }

        );

        const data = await response.json();

        if(!response.ok){

            throw new Error(

                data.message ||

                "Upload failed."

            );

        }

        return data;

    }

    catch(error){

        console.error(error);

        showToast(

            error.message,

            "danger"

        );

        throw error;

    }

}


/* ==========================================================
   CHAT WITH DOCUMENT
========================================================== */

async function askDocument(

    question,

    document

){

    return apiPost(

        "/chat_with_file",

        {

            question,

            document

        }

    );

}


/* ==========================================================
   LIST FILES
========================================================== */

async function getUploadedFiles(){

    return apiGet(

        "/files"

    );

}


/* ==========================================================
   DELETE FILE
========================================================== */

async function deleteUploadedFile(

    filename

){

    return apiDelete(

        `/delete_file/${encodeURIComponent(filename)}`

    );

}


/* ==========================================================
   DOWNLOAD FILE
========================================================== */

function downloadUploadedFile(

    filename

){

    window.open(

        `/download/${encodeURIComponent(filename)}`,

        "_blank"

    );

}


/* ==========================================================
   STREAM READER
========================================================== */

async function readStream(

    response,

    onChunk

){

    const reader = response.body.getReader();

    const decoder = new TextDecoder();

    let finished = false;

    while(!finished){

        const {

            value,

            done

        } = await reader.read();

        finished = done;

        if(done){

            break;

        }

        const chunk = decoder.decode(

            value,

            {

                stream:true

            }

        );

        if(onChunk){

            onChunk(chunk);

        }

    }

}


/* ==========================================================
   CANCEL STREAM
========================================================== */

function cancelStream(

    controller

){

    if(controller){

        controller.abort();

    }

}


/* ==========================================================
   EXTEND API OBJECT
========================================================== */

Object.assign(

    window.APIClient,

    {

        uploadFile,

        askDocument,

        getUploadedFiles,

        deleteUploadedFile,

        downloadUploadedFile,

        readStream,

        cancelStream

    }

);

/* ==========================================================
   Aura AI
   API.JS
   PART 4
========================================================== */

/* ==========================================================
   API SETTINGS
========================================================== */

API.TIMEOUT = 30000;

API.MAX_RETRIES = 2;


/* ==========================================================
   REQUEST WITH TIMEOUT
========================================================== */

async function fetchWithTimeout(

    url,

    options = {},

    timeout = API.TIMEOUT

){

    const controller = new AbortController();

    const timer = setTimeout(

        () => controller.abort(),

        timeout

    );

    try{

        const response = await fetch(

            API.BASE_URL + url,

            {

                ...options,

                signal: controller.signal

            }

        );

        clearTimeout(timer);

        return response;

    }

    catch(error){

        clearTimeout(timer);

        throw error;

    }

}


/* ==========================================================
   RETRY REQUEST
========================================================== */

async function retryRequest(

    url,

    options = {},

    retries = API.MAX_RETRIES

){

    let lastError;

    for(

        let i = 0;

        i <= retries;

        i++

    ){

        try{

            return await fetchWithTimeout(

                url,

                options

            );

        }

        catch(error){

            lastError = error;

        }

    }

    throw lastError;

}


/* ==========================================================
   VALIDATE RESPONSE
========================================================== */

function validateResponse(data){

    if(

        data === null ||

        data === undefined

    ){

        throw new Error(

            "Empty response received."

        );

    }

    return data;

}


/* ==========================================================
   SAFE JSON
========================================================== */

async function safeJson(response){

    try{

        return await response.json();

    }

    catch{

        throw new Error(

            "Invalid JSON response."

        );

    }

}


/* ==========================================================
   NETWORK STATUS
========================================================== */

function isOnline(){

    return navigator.onLine;

}


/* ==========================================================
   ENSURE NETWORK
========================================================== */

function ensureOnline(){

    if(!isOnline()){

        throw new Error(

            "No internet connection."

        );

    }

}


/* ==========================================================
   STREAM PARSER
========================================================== */

function parseSSEChunk(chunk){

    return chunk

        .split("\n")

        .filter(

            line => line.startsWith("data:")

        )

        .map(

            line =>

            line.replace("data:","").trim()

        )

        .filter(

            text =>

            text !== "" &&

            text !== "[DONE]"

        );

}


/* ==========================================================
   API STATS
========================================================== */

const APIStats={

    requests:0,

    success:0,

    failed:0

};


function logRequest(success=true){

    APIStats.requests++;

    if(success){

        APIStats.success++;

    }

    else{

        APIStats.failed++;

    }

}


function getAPIStats(){

    return {

        ...APIStats

    };

}


/* ==========================================================
   RESET STATS
========================================================== */

function resetAPIStats(){

    APIStats.requests = 0;

    APIStats.success = 0;

    APIStats.failed = 0;

}


/* ==========================================================
   EXPORT
========================================================== */

Object.assign(

    window.APIClient,

    {

        fetchWithTimeout,

        retryRequest,

        validateResponse,

        safeJson,

        isOnline,

        ensureOnline,

        parseSSEChunk,

        getAPIStats,

        resetAPIStats

    }

);

/* ==========================================================
   Aura AI
   API.JS
   PART 5
========================================================== */

/* ==========================================================
   SIMPLE RESPONSE CACHE
========================================================== */

const APICache = new Map();

function getCached(key){

    return APICache.get(key);

}

function setCache(key,value){

    APICache.set(

        key,

        {

            data:value,

            timestamp:Date.now()

        }

    );

}

function clearCache(){

    APICache.clear();

}

/* ==========================================================
   REQUEST QUEUE
========================================================== */

const RequestQueue=[];

let ProcessingQueue=false;

async function processQueue(){

    if(ProcessingQueue){

        return;

    }

    ProcessingQueue=true;

    while(RequestQueue.length){

        const task=RequestQueue.shift();

        try{

            await task();

        }

        catch(error){

            console.error(error);

        }

    }

    ProcessingQueue=false;

}

function enqueue(task){

    RequestQueue.push(task);

    processQueue();

}

/* ==========================================================
   BATCH REQUESTS
========================================================== */

async function batchRequests(requests){

    return Promise.all(requests);

}

/* ==========================================================
   API VERSION
========================================================== */

const APIVersion={

    name:"Aura AI API",

    version:"1.0.0",

    backend:"Flask",

    database:"SQLite"

};

/* ==========================================================
   INITIALIZE API
========================================================== */

async function initializeAPI(){

    try{

        const online=await testConnection();

        if(online){

            console.log(

                "API Connected"

            );

        }

        else{

            console.warn(

                "API Offline"

            );

        }

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
   HEALTH MONITOR
========================================================== */

let HealthInterval=null;

function startHealthMonitor(){

    if(HealthInterval){

        return;

    }

    HealthInterval=setInterval(

        async()=>{

            try{

                await healthCheck();

            }

            catch(error){

                console.warn(

                    "Health check failed"

                );

            }

        },

        60000

    );

}

function stopHealthMonitor(){

    clearInterval(

        HealthInterval

    );

}

/* ==========================================================
   DESTROY
========================================================== */

function destroyAPI(){

    stopHealthMonitor();

    clearCache();

}

/* ==========================================================
   EXPORT HELPERS
========================================================== */

Object.assign(

    window.APIClient,

    {

        initializeAPI,

        destroyAPI,

        enqueue,

        batchRequests,

        getCached,

        setCache,

        clearCache,

        APIVersion

    }

);

/* ==========================================================
   START API
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        initializeAPI();

        startHealthMonitor();

    }

);

