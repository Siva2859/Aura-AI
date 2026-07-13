# ===========================================================
# GEMINI VISION
# ===========================================================

import os

from PIL import Image

import google.generativeai as genai

from dotenv import load_dotenv

load_dotenv()

genai.configure(

    api_key=os.getenv("GEMINI_API_KEY")

)

VISION_MODEL = genai.GenerativeModel(

    "gemini-2.5-flash"

)


def analyze_image(image_path, prompt):

    """
    Analyze an uploaded image using Gemini Vision.
    """

    try:

        image = Image.open(image_path)

        response = VISION_MODEL.generate_content(

            [

                prompt,

                image

            ]

        )

        return response.text

    except Exception as e:

        return f"Vision Error: {e}"