/* ==========================================================
   Aura AI
   UPLOAD.JS
   PART 1
========================================================== */

"use strict";

/* ==========================================================
   UPLOAD MODULE
========================================================== */

const Upload = {

    files: [],

    documents: {},

    uploading: false

};

window.Upload = Upload;

/* ==========================================================
   INITIALIZE
========================================================== */

function initializeUpload(){

    if(!DOM.fileInput){

        return;

    }

    DOM.fileInput.addEventListener(

        "change",

        handleFileSelection

    );

    initializeDragDrop();

}

/* ==========================================================
   UPLOAD
========================================================== */

async function uploadSelectedFile(file){

    try{

        Upload.uploading = true;

        showLoading();

        const response = await APIClient.uploadFile(file);

        Upload.files.push(file);

        Upload.documents[response.filename] = response.content;

        addFilePreview(

            response.filename

        );

        // Automatically show AI response after upload

        if(response.file_type === "image"){

            addAssistantMessage(

                "🖼 **Image Analysis**\n\n" +

                response.content

            );

        }

        else{

            addAssistantMessage(

                "📄 **Document Loaded Successfully**\n\n" +

                "You can now ask me questions about **" +

                response.filename +

                "**."

            );

        }

        showToast(

            "File uploaded successfully"

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Upload failed",

            "danger"

        );

    }

    finally{

        Upload.uploading = false;

        hideLoading();

    }

}

/* ==========================================================
   FILE PREVIEW
========================================================== */

function addFilePreview(filename){

    const item = document.createElement("div");

    item.className = "upload-item";

    item.innerHTML = `

        <i class="ri-file-line"></i>

        <span>${filename}</span>

        <button class="remove-file">

            <i class="ri-close-line"></i>

        </button>

    `;

    item.querySelector("button")

        .addEventListener(

            "click",

            ()=>{

                Upload.files = Upload.files.filter(

                    file => file.name !== filename

                );

                item.remove();

                showToast("File removed");

            }

        );

    DOM.uploadPreview.appendChild(item);

}

/* ==========================================================
   DRAG & DROP
========================================================== */

function initializeDragDrop(){

    DOM.chatMessages.addEventListener(

        "dragover",

        event=>{

            event.preventDefault();

        }

    );

    DOM.chatMessages.addEventListener(

        "drop",

        async event=>{

            event.preventDefault();

            const file =

                event.dataTransfer.files[0];

            if(file){

                await uploadSelectedFile(file);

            }

        }

    );

}

/* ==========================================================
   EXPORT
========================================================== */

window.UploadUI = {

    uploadSelectedFile,

    handleFileSelection,

    initializeUpload

};

document.addEventListener(

    "DOMContentLoaded",

    initializeUpload

);

/* ==========================================================
   Aura AI
   UPLOAD.JS
   PART 2
========================================================== */

/* ==========================================================
   MULTIPLE FILES
========================================================== */

async function uploadFiles(files){

    for(const file of files){

        await uploadSelectedFile(file);

    }

}

/* ==========================================================
   PROGRESS
========================================================== */

function createProgressBar(){

    const progress=document.createElement("div");

    progress.className="progress";

    progress.innerHTML=`

        <div class="progress-bar"></div>

    `;

    DOM.uploadPreview.appendChild(progress);

    return progress;

}

function updateProgress(progress,value){

    const bar=progress.querySelector(".progress-bar");

    if(bar){

        bar.style.width=`${value}%`;

    }

}

/* ==========================================================
   ASK AI ABOUT DOCUMENT
========================================================== */

async function askUploadedDocument(question){

    if(Object.keys(Upload.documents).length === 0){

        showToast(

            "Upload a document first",

            "warning"

        );

        return;

    }

    try{

        setLoading(true);

        const result=await APIClient.askDocument(

            question,

            Upload.documents

        );

        ChatUI.addAssistantMessage(

            result.response

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to analyze document",

            "danger"

        );

    }

    finally{

        setLoading(false);

    }

}

/* ==========================================================
   FILE LIST
========================================================== */

async function refreshUploadedFiles(){

    try{

        removeWelcomeScreen();

        const suggestions = document.querySelector(".suggestion-grid");

        if(suggestions){

            suggestions.style.display = "none";

        }
        
        const files = await APIClient.getUploadedFiles();

        let html = "<h3>📄 Uploaded Documents</h3><br>";

        if(files.length === 0){

            html += "<p>No documents uploaded.</p>";

        }

        else{

            files.forEach(file=>{

                html += `

                <div class="document-item">

                    <div class="document-info">

                        <i class="ri-file-pdf-line"></i>

                        <div>

                            <strong>${file}</strong><br>

                            <small>Uploaded Document</small>

                        </div>

                    </div>

                    <div class="document-actions">

                        <button onclick="window.open('/uploads/${file}','_blank')">

                            👁 Open

                        </button>

                        <button onclick="downloadUploadedDocument('${file}')">

                            ⬇ Download

                        </button>

                        <button onclick="removeUploadedFile('${file}')">

                            🗑 Delete

                        </button>

                    </div>

                </div>

                `;

            });

        }

        document.getElementById("chatMessages").innerHTML = html;

    }

    catch(error){

        console.error(error);

        showToast("Unable to load documents","danger");

    }

}

/* ==========================================================
   DELETE FILE
========================================================== */

async function removeUploadedFile(filename){

    try{

        await APIClient.deleteUploadedFile(

            filename

        );

        showToast(

            "File deleted"

        );

        refreshUploadedFiles();

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
   DOWNLOAD FILE
========================================================== */

function downloadUploadedDocument(filename){

    APIClient.downloadUploadedFile(

        filename

    );

}

/* ==========================================================
   CLEAR FILES
========================================================== */

function clearUploads(){

    Upload.files=[];

    Upload.currentDocument="";

    DOM.uploadPreview.innerHTML="";

}

/* ==========================================================
   FILE TYPE
========================================================== */

function supportedFile(file){

    if(file.size > 20 * 1024 * 1024){

        showToast(

            "Maximum file size is 20 MB",

            "warning"

        );

        return false;

    }

    const allowed=[

        "pdf",

        "docx",

        "txt",

        "csv",

        "png",

        "jpg",

        "jpeg"

    ];

    const ext=file.name

        .split(".")

        .pop()

        .toLowerCase();

    return allowed.includes(ext);

}

/* ==========================================================
   OVERRIDE FILE HANDLER
========================================================== */

async function handleFileSelection(event){

    const files=[...event.target.files];

    const valid=files.filter(

        supportedFile

    );

    if(valid.length===0){

        showToast(

            "Unsupported file",

            "warning"

        );

        return;

    }

    await uploadFiles(valid);

}

/* ==========================================================
   EXPORT
========================================================== */

Object.assign(

    window.UploadUI,

    {

        uploadFiles,

        askUploadedDocument,

        refreshUploadedFiles,

        removeUploadedFile,

        downloadUploadedDocument,

        clearUploads

    }

);

document

.getElementById("documentsBtn")

.addEventListener(

    "click",

    refreshUploadedFiles

);

