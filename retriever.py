# ===========================================================
# RETRIEVER
# Document Chunking
# ===========================================================

import re

# Stores all uploaded documents
DOCUMENT_STORE = {}


def chunk_text(text, chunk_size=1000, overlap=200):
    """
    Split a document into overlapping chunks.
    """

    text = re.sub(r"\s+", " ", text).strip()

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunks.append(text[start:end])

        start += chunk_size - overlap

    return chunks


def add_document(filename, text):
    """
    Save one document as chunks.
    """

    DOCUMENT_STORE[filename] = chunk_text(text)


def get_all_documents():
    """
    Return all stored documents.
    """

    return DOCUMENT_STORE

# ===========================================================
# FIND RELEVANT CHUNKS
# ===========================================================

def retrieve_chunks(question, top_k=5):
    """
    Return the most relevant chunks using
    simple keyword matching.
    """

    question_words = set(

        question.lower().split()

    )

    scores = []

    for filename, chunks in DOCUMENT_STORE.items():

        for chunk in chunks:

            chunk_words = set(

                chunk.lower().split()

            )

            score = len(

                question_words.intersection(chunk_words)

            )

            if score > 0:

                scores.append({

                    "filename": filename,

                    "chunk": chunk,

                    "score": score

                })

    scores.sort(

        key=lambda x: x["score"],

        reverse=True

    )

    return scores[:top_k]