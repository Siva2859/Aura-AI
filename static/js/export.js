/* ==========================================================
   EXPORT CHAT (PDF & TXT)
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const pdfBtn = document.getElementById("downloadPdf");
    const txtBtn = document.getElementById("downloadTxt");

    if (pdfBtn) {
        pdfBtn.addEventListener("click", exportPDF);
    }

    if (txtBtn) {
        txtBtn.addEventListener("click", exportTXT);
    }

});


/* ==========================================================
   GET CHAT CONTENT
========================================================== */

function getConversationText() {

    let conversation = "";

    document.querySelectorAll(".message").forEach(message => {

        const sender =
            message.classList.contains("user-message")
            ? "You"
            : "Aura AI";

        const textElement = message.querySelector(".message-text");

        if (!textElement) return;

        const text = textElement.innerText.trim();

        conversation += `${sender}:\n`;
        conversation += `${text}\n\n`;
    });

    return conversation;

}


/* ==========================================================
   GET CHAT TITLE
========================================================== */

function getChatTitle() {

    const title = document.querySelector(".chat-title");

    if (title && title.innerText.trim() !== "") {

        return title.innerText.trim();

    }

    return "Aura_Chat";

}


/* ==========================================================
   EXPORT TXT
========================================================== */

function exportTXT() {

    const content = getConversationText();

    if (!content) {

        showToast("No conversation to export", "warning");

        return;

    }

    const blob = new Blob([content], {

        type: "text/plain"

    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = getChatTitle() + ".txt";

    a.click();

    URL.revokeObjectURL(url);

    showToast("TXT Downloaded");

}


/* ==========================================================
   EXPORT PDF
========================================================== */

function exportPDF() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const content = getConversationText();

    if (!content) {

        showToast("No conversation to export", "warning");

        return;

    }

    doc.setFont("helvetica");

    doc.setFontSize(18);

    doc.text(getChatTitle(), 15, 20);

    doc.setFontSize(11);

    const lines = doc.splitTextToSize(content, 180);

    doc.text(lines, 15, 35);

    doc.save(getChatTitle() + ".pdf");

    showToast("PDF Downloaded");

}