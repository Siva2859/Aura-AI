"""
===========================================================
Aura AI Chatbot
Main Flask Application
Part 1
===========================================================
"""

import os
import sys
import subprocess
import importlib
import json
import logging
from xml.parsers.expat import model
from vision import analyze_image
from retriever import (

    add_document,

    retrieve_chunks

)

def import_flask_components():
    try:
        flask = importlib.import_module("flask")
    except ModuleNotFoundError as exc:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "flask"])
            flask = importlib.import_module("flask")
        except Exception:
            raise ImportError(
                "Flask is required to run this application. Install it with `pip install flask`."
            ) from exc

    try:
        Flask = flask.Flask
        render_template = flask.render_template
        request = flask.request
        jsonify = flask.jsonify
        send_from_directory = flask.send_from_directory
        Response = flask.Response
    except AttributeError as exc:
        raise ImportError(
            "Flask module did not provide expected components."
        ) from exc

    return Flask, render_template, request, jsonify, send_from_directory, Response


def import_secure_filename():
    try:
        werkzeug_utils = importlib.import_module("werkzeug.utils")
    except ModuleNotFoundError as exc:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "werkzeug"])
            werkzeug_utils = importlib.import_module("werkzeug.utils")
        except Exception:
            raise ImportError(
                "Werkzeug is required to run this application. Install it with `pip install werkzeug`."
            ) from exc

    try:
        return werkzeug_utils.secure_filename
    except AttributeError as exc:
        raise ImportError(
            "Werkzeug module did not provide secure_filename."
        ) from exc


Flask, render_template, request, jsonify, send_from_directory, Response = import_flask_components()

secure_filename = import_secure_filename()


def import_file_processing_components():
    try:
        pypdf = importlib.import_module("pypdf")
    except ModuleNotFoundError:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
            pypdf = importlib.import_module("pypdf")
        except Exception:
            pypdf = None

    try:
        docx = importlib.import_module("docx")
    except ModuleNotFoundError:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx"])
            docx = importlib.import_module("docx")
        except Exception:
            docx = None

    try:
        pandas = importlib.import_module("pandas")
    except ModuleNotFoundError:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas"])
            pandas = importlib.import_module("pandas")
        except Exception:
            pandas = None

    return pypdf, docx, pandas


pypdf, docx, pd = import_file_processing_components()

from config import (
    APP_NAME,
    SECRET_KEY,
    DEBUG,
    HOST,
    PORT,
    UPLOAD_FOLDER,
    MAX_CONTENT_LENGTH,
    ALLOWED_EXTENSIONS
)

from database import (
    init_db,
    create_chat,
    get_chats,
    get_chat,
    load_chat,
    save_message,
    rename_chat,
    delete_chat,
    search_chats,
    update_chat_title,
    get_chat_title
)

from ai import (
    get_ai_response,
    generate_chat_title,
    stream_ai_response
)

# ===========================================================
# FLASK APP
# ===========================================================

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

app.config["SECRET_KEY"] = SECRET_KEY
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

# ===========================================================
# INITIALIZE DATABASE
# ===========================================================

init_db()

# ===========================================================
# HELPER FUNCTIONS
# ===========================================================

def allowed_file(filename):
    """
    Check whether an uploaded file has
    an allowed extension.
    """

    return (
        "." in filename and
        filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )

# ===========================================================
# HOME PAGE
# ===========================================================

@app.route("/")
def home():
    """
    Load the chatbot interface.
    """

    chats = get_chats()

    return render_template(
        "index.html",
        app_name=APP_NAME,
        chats=chats
    )

# ===========================================================
# HEALTH CHECK
# ===========================================================

@app.route("/health")
def health():

    return jsonify({

        "status": "ok",

        "application": APP_NAME,

        "version": "1.0.0",

        "database": "connected"

    })

# ===========================================================
# STATIC UPLOAD ACCESS
# ===========================================================

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):

    return send_from_directory(

        app.config["UPLOAD_FOLDER"],

        filename

    )

# ===========================================================
# CREATE NEW CHAT
# ===========================================================

@app.route("/new_chat", methods=["POST"])
def new_chat():

    data = request.get_json(silent=True) or {}

    title = data.get("title", "New Chat")

    chat_id = create_chat(title)

    return jsonify({

        "success": True,

        "chat_id": chat_id,

        "title": title

    })


# ===========================================================
# GET ALL CHAT HISTORY
# ===========================================================

@app.route("/history", methods=["GET"])
def history():

    chats = get_chats()

    history = []

    for chat in chats:

        history.append({

            "id": chat["id"],

            "title": chat["title"],

            "created_at": chat["created_at"],

            "updated_at": chat["updated_at"]

        })

    return jsonify(history)


# ===========================================================
# LOAD A SINGLE CHAT
# ===========================================================

@app.route("/chat/<int:chat_id>", methods=["GET"])
def load_chat_route(chat_id):

    chat = get_chat(chat_id)

    if chat is None:

        return jsonify({

            "success": False,

            "message": "Chat not found."

        }), 404

    messages = load_chat(chat_id)

    conversation = []

    for msg in messages:

        conversation.append({

            "id": msg["id"],

            "role": msg["role"],

            "message": msg["message"],

            "timestamp": msg["timestamp"]

        })

    return jsonify({

        "success": True,

        "chat": {

            "id": chat["id"],

            "title": chat["title"]

        },

        "messages": conversation

    })


# ===========================================================
# SEND MESSAGE TO AI
# ===========================================================

@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json(silent=True)

    model = data.get("model")
    temperature = data.get("temperature")
    max_tokens = data.get("max_tokens")

    if not data:

        return jsonify({

            "success": False,

            "message": "No JSON received."

        }), 400

    chat_id = data.get("chat_id")

    user_message = data.get("message", "").strip()
    
    logger.info("Received message: %s", user_message)

    if not user_message:

        return jsonify({

            "success": False,

            "message": "Message cannot be empty."

        }), 400

    if not chat_id:

        chat_id = create_chat("New Chat")

    history = load_chat(chat_id)

    save_message(

        chat_id,

        "user",

        user_message

    )

    try:

        ai_reply = get_ai_response(

            user_message,

            history,

            model=model,

            temperature=temperature,

            max_tokens=max_tokens

        )

    except Exception as e:

        logger.exception("AI response failed")

        return jsonify({

            "success": False,

            "message": "Unable to generate AI response."

        }), 500

    save_message(

        chat_id,

        "assistant",

        ai_reply

    )

    title = get_chat_title(chat_id)

    if title == "New Chat":

        try:

            new_title = user_message[:40]

            if len(user_message) > 40:
                new_title += "..."

            update_chat_title(

                chat_id,

                new_title

            )

            title = new_title

        except Exception:

            pass

    return jsonify({

        "success": True,

        "chat_id": chat_id,

        "title": title,

        "response": ai_reply

    })
    
# ===========================================================
# RENAME CHAT
# ===========================================================

@app.route("/rename_chat", methods=["POST"])
def rename_chat_route():

    data = request.get_json(silent=True)

    if not data:

        return jsonify({

            "success": False,

            "message": "Invalid request."

        }), 400

    chat_id = data.get("chat_id")

    new_title = data.get("title", "").strip()

    if not chat_id:

        return jsonify({

            "success": False,

            "message": "Chat ID is required."

        }), 400

    if not new_title:

        return jsonify({

            "success": False,

            "message": "Title cannot be empty."

        }), 400

    chat = get_chat(chat_id)

    if chat is None:

        return jsonify({

            "success": False,

            "message": "Chat not found."

        }), 404

    rename_chat(

        chat_id,

        new_title

    )

    return jsonify({

        "success": True,

        "message": "Chat renamed successfully.",

        "title": new_title

    })


# ===========================================================
# DELETE CHAT
# ===========================================================

@app.route("/delete_chat/<int:chat_id>", methods=["DELETE"])
def delete_chat_route(chat_id):

    chat = get_chat(chat_id)

    if chat is None:

        return jsonify({

            "success": False,

            "message": "Chat not found."

        }), 404

    delete_chat(chat_id)

    return jsonify({

        "success": True,

        "message": "Chat deleted successfully."

    })


# ===========================================================
# SEARCH CHATS
# ===========================================================

@app.route("/search", methods=["GET"])
def search_route():

    keyword = request.args.get(

        "q",

        ""

    ).strip()

    if keyword == "":

        return jsonify([])

    chats = search_chats(keyword)

    results = []

    for chat in chats:

        results.append({

            "id": chat["id"],

            "title": chat["title"],

            "created_at": chat["created_at"],

            "updated_at": chat["updated_at"]

        })

    return jsonify(results)


# ===========================================================
# CHAT INFORMATION
# ===========================================================

@app.route("/chat_info/<int:chat_id>", methods=["GET"])
def chat_info(chat_id):

    chat = get_chat(chat_id)

    if chat is None:

        return jsonify({

            "success": False,

            "message": "Chat not found."

        }), 404

    messages = load_chat(chat_id)

    return jsonify({

        "success": True,

        "chat": {

            "id": chat["id"],

            "title": chat["title"],

            "created_at": chat["created_at"],

            "updated_at": chat["updated_at"],

            "message_count": len(messages)

        }

    })


# ===========================================================
# DELETE ALL CHATS
# ===========================================================

@app.route("/delete_all", methods=["DELETE"])
def delete_all():

    from database import delete_all_chats

    delete_all_chats()

    return jsonify({

        "success": True,

        "message": "All chats deleted successfully."

    })


# ===========================================================
# APPLICATION INFORMATION
# ===========================================================

@app.route("/about", methods=["GET"])
def about():

    return jsonify({

        "application": APP_NAME,

        "version": "1.0.0",

        "framework": "Flask",

        "database": "SQLite",

        "ai": "Groq",

        "status": "Running"

    })
    
# ===========================================================
# EXTRACT TEXT FROM FILES
# ===========================================================

def extract_text(filepath):

    extension = filepath.rsplit(".", 1)[1].lower()

    text = ""

    try:

        if extension == "txt":

            with open(filepath, "r", encoding="utf-8") as file:

                text = file.read()

        elif extension == "pdf":

            if pypdf is None:
                raise ImportError("pypdf is not available.")

            pdf = pypdf.PdfReader(filepath)

            for page in pdf.pages:

                page_text = page.extract_text()

                if page_text:

                    text += page_text + "\n"

        elif extension == "docx":

            if docx is None:
                raise ImportError("python-docx is not available.")

            document = docx.Document(filepath)

            for paragraph in document.paragraphs:

                text += paragraph.text + "\n"

        elif extension == "csv":

            if pd is None:
                raise ImportError("pandas is not available.")

            dataframe = pd.read_csv(filepath)

            text = dataframe.to_string(index=False)

        else:

            text = "Unsupported file type."

    except Exception as e:

        text = f"Unable to read file.\n{str(e)}"

    return text


# ===========================================================
# FILE UPLOAD
# ===========================================================

@app.route("/upload", methods=["POST"])
def upload_file():

    if "file" not in request.files:

        return jsonify({

            "success": False,

            "message": "No file selected."

        }), 400

    file = request.files["file"]

    if file.filename == "":

        return jsonify({

            "success": False,

            "message": "Empty filename."

        }), 400

    if not allowed_file(file.filename):

        return jsonify({

            "success": False,

            "message": "Unsupported file type."

        }), 400

    os.makedirs(

        app.config["UPLOAD_FOLDER"],

        exist_ok=True

    )

    filename = secure_filename(file.filename)

    filepath = os.path.join(

        app.config["UPLOAD_FOLDER"],

        filename

    )

    file.save(filepath)

    logger.info("Uploaded file: %s", filename)

    extension = filename.rsplit(".", 1)[1].lower()

    # -------------------------------------------------------
    # IMAGE FILES → GEMINI VISION
    # -------------------------------------------------------

    if extension in [

        "png",

        "jpg",

        "jpeg",

        "webp"

    ]:

        description = analyze_image(

            filepath,

            "Describe this image in detail. "
            "If there is text, read it. "
            "If it contains a chart, explain it. "
            "If it contains code, explain the code."

        )

        return jsonify({

            "success": True,

            "filename": filename,

            "filepath": filepath,

            "file_type": "image",

            "content": description

        })

    # -------------------------------------------------------
    # DOCUMENTS → EXISTING EXTRACTION
    # -------------------------------------------------------

    extracted_text = extract_text(filepath)
    
    add_document(

        filename,

        extracted_text

    )

    return jsonify({

        "success": True,

        "filename": filename,

        "filepath": filepath,

        "file_type": "document",

        "content": extracted_text

    })
    
# ===========================================================
# CHAT WITH MULTIPLE FILES
# ===========================================================

@app.route("/chat_with_file", methods=["POST"])
def chat_with_file():

    data = request.get_json(silent=True)

    if not data:

        return jsonify({

            "success": False,

            "message": "Invalid request."

        }), 400

    question = data.get("question", "").strip()

    documents = data.get("document", {})

    if question == "":

        return jsonify({

            "success": False,

            "message": "Question cannot be empty."

        }), 400

    if not documents:

        return jsonify({

            "success": False,

            "message": "No documents uploaded."

        }), 400

    results = retrieve_chunks(

        question,

        top_k=5

    )

    context = ""

    for item in results:

        context += f"""

    ==============================
    FILE: {item['filename']}
    ==============================

    {item['chunk']}

    """

    prompt = f"""
You are Aura AI.

The following documents have been uploaded.

{context}

------------------------------------

User Question:

{question}

Instructions:

- Answer ONLY using the uploaded documents.
- If multiple documents are relevant,
  combine the information.
- Mention the filename whenever useful.
- If the answer isn't found,
  clearly say so.
"""

    answer = get_ai_response(prompt)

    return jsonify({

        "success": True,

        "response": answer

    })
    
# ===========================================================
# LIST UPLOADED FILES
# ===========================================================

@app.route("/files", methods=["GET"])
def uploaded_files():

    files = []

    for filename in os.listdir(app.config["UPLOAD_FOLDER"]):

        files.append(filename)

    return jsonify(files)


# ===========================================================
# DELETE UPLOADED FILE
# ===========================================================

@app.route("/delete_file/<filename>", methods=["DELETE"])
def delete_uploaded_file(filename):

    filepath = os.path.join(

        app.config["UPLOAD_FOLDER"],

        filename

    )

    if os.path.exists(filepath):

        os.remove(filepath)

        return jsonify({

            "success": True,

            "message": "File deleted."

        })

    return jsonify({

        "success": False,

        "message": "File not found."

    }), 404


# ===========================================================
# DOWNLOAD FILE
# ===========================================================

@app.route("/download/<filename>")
def download_file(filename):

    return send_from_directory(

        app.config["UPLOAD_FOLDER"],

        filename,

        as_attachment=True

    )
    
# ===========================================================
# STREAM AI RESPONSE
# ===========================================================


@app.route("/stream_chat", methods=["POST"])
def stream_chat():

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "success": False,
            "message": "Invalid request."
        }), 400

    message = data.get("message", "").strip()

    history = data.get("history", [])

    def generate():

        try:

            for chunk in stream_ai_response(
                message,
                history
            ):

                yield f"data: {chunk}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:

            yield f"data: ERROR: {str(e)}\n\n"

    return Response(

        generate(),

        mimetype="text/event-stream"

    )


# ===========================================================
# EXPORT CHAT AS TXT
# ===========================================================

@app.route("/export/txt/<int:chat_id>")
def export_txt(chat_id):

    messages = load_chat(chat_id)

    lines = []

    for msg in messages:

        role = msg["role"].capitalize()

        text = msg["message"]

        lines.append(f"{role}: {text}")

    content = "\n\n".join(lines)

    return Response(

        content,

        mimetype="text/plain",

        headers={

            "Content-Disposition":

            f"attachment; filename=chat_{chat_id}.txt"

        }

    )


# ===========================================================
# EXPORT CHAT AS JSON
# ===========================================================

@app.route("/export/json/<int:chat_id>")
def export_json(chat_id):

    messages = load_chat(chat_id)

    data = []

    for msg in messages:

        data.append({

            "role": msg["role"],

            "message": msg["message"],

            "timestamp": msg["timestamp"]

        })

    return Response(

        json.dumps(

            data,

            indent=4

        ),

        mimetype="application/json",

        headers={

            "Content-Disposition":

            f"attachment; filename=chat_{chat_id}.json"

        }

    )


# ===========================================================
# GLOBAL ERROR HANDLERS
# ===========================================================

@app.errorhandler(404)
def page_not_found(error):

    return jsonify({

        "success": False,

        "message": "Page not found."

    }), 404


@app.errorhandler(413)
def file_too_large(error):

    return jsonify({

        "success": False,

        "message": "Uploaded file exceeds the allowed size."

    }), 413


@app.errorhandler(500)
def internal_server_error(error):

    return jsonify({

        "success": False,

        "message": "Internal server error."

    }), 500

@app.route("/uploads/<filename>")
def open_uploaded_file(filename):

    return send_from_directory(

        app.config["UPLOAD_FOLDER"],

        filename

    )
    
# ===========================================================
# START APPLICATION
# ===========================================================

if __name__ == "__main__":

    print("=" * 60)
    print(f"Starting {APP_NAME}")
    print(f"Server : http://{HOST}:{PORT}")
    print("=" * 60)

    app.run(

        host=HOST,

        port=PORT,

        debug=DEBUG,

        threaded=True

    )
    
