"""
===========================================================
Aura AI Chatbot
Database Module
SQLite
===========================================================
"""

import sqlite3
from datetime import datetime
from config import DATABASE_PATH


# ===========================================================
# DATABASE CONNECTION
# ===========================================================

def get_connection():

    conn = sqlite3.connect(DATABASE_PATH)

    conn.row_factory = sqlite3.Row

    conn.execute("PRAGMA foreign_keys = ON")

    return conn


# ===========================================================
# INITIALIZE DATABASE
# ===========================================================

def init_db():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            title TEXT NOT NULL,

            created_at TEXT,

            updated_at TEXT

        )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        chat_id INTEGER,

        role TEXT,

        message TEXT,

        timestamp TEXT,

        FOREIGN KEY(chat_id)
        REFERENCES chats(id)
        ON DELETE CASCADE

    )
    """)

    cursor.execute("""

    CREATE INDEX IF NOT EXISTS idx_messages_chat_id

    ON messages(chat_id)

    """)

    cursor.execute("""

    CREATE INDEX IF NOT EXISTS idx_chats_updated

    ON chats(updated_at)

    """)
    conn.commit()
    conn.close()


# ===========================================================
# CREATE CHAT
# ===========================================================

def create_chat(title="New Chat"):

    conn = get_connection()
    cursor = conn.cursor()

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO chats(
            title,
            created_at,
            updated_at
        )
        VALUES(?,?,?)
    """, (title, now, now))

    chat_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return chat_id


# ===========================================================
# GET ALL CHATS
# ===========================================================

def get_chats():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM chats
        ORDER BY updated_at DESC
    """)

    chats = cursor.fetchall()

    conn.close()

    return chats


# ===========================================================
# GET SINGLE CHAT
# ===========================================================

def get_chat(chat_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""

        SELECT *

        FROM chats

        WHERE id=?

    """, (chat_id,))

    chat = cursor.fetchone()

    conn.close()

    return chat


# ===========================================================
# SAVE MESSAGE
# ===========================================================

def save_message(chat_id, role, message):

    conn = get_connection()

    cursor = conn.cursor()

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO messages(
            chat_id,
            role,
            message,
            timestamp
        )
        VALUES(?,?,?,?)
    """, (
        chat_id,
        role,
        message,
        now
    ))

    cursor.execute("""
        UPDATE chats

        SET updated_at=?

        WHERE id=?
    """, (
        now,
        chat_id
    ))

    conn.commit()

    conn.close()


# ===========================================================
# LOAD CHAT MESSAGES
# ===========================================================

def load_chat(chat_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""

        SELECT *

        FROM messages

        WHERE chat_id=?

        ORDER BY id ASC

    """, (chat_id,))

    messages = cursor.fetchall()

    conn.close()

    return messages


# ===========================================================
# RENAME CHAT
# ===========================================================

def rename_chat(chat_id, new_title):

    conn = get_connection()

    cursor = conn.cursor()

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""

        UPDATE chats

        SET

        title=?,

        updated_at=?

        WHERE id=?

    """, (
        new_title,
        now,
        chat_id
    ))

    conn.commit()

    conn.close()


# ===========================================================
# DELETE CHAT
# ===========================================================

def delete_chat(chat_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""

        DELETE FROM messages

        WHERE chat_id=?

    """, (chat_id,))

    cursor.execute("""

        DELETE FROM chats

        WHERE id=?

    """, (chat_id,))

    conn.commit()

    conn.close()


# ===========================================================
# SEARCH CHATS
# ===========================================================

def search_chats(keyword):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""

        SELECT *

        FROM chats

        WHERE title LIKE ?

        ORDER BY updated_at DESC

    """, (f"%{keyword}%",))

    chats = cursor.fetchall()

    conn.close()

    return chats


# ===========================================================
# UPDATE CHAT TITLE
# ===========================================================

def update_chat_title(chat_id, title):

    rename_chat(chat_id, title)


# ===========================================================
# GET CHAT TITLE
# ===========================================================

def get_chat_title(chat_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""

        SELECT title

        FROM chats

        WHERE id=?

    """, (chat_id,))

    row = cursor.fetchone()

    conn.close()

    if row:

        return row["title"]

    return None


# ===========================================================
# DELETE ALL CHATS
# ===========================================================

def delete_all_chats():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("DELETE FROM messages")

    cursor.execute("DELETE FROM chats")

    conn.commit()

    conn.close()


# ===========================================================
# DATABASE TEST
# ===========================================================

if __name__ == "__main__":

    init_db()

    print("Database initialized successfully.")
    