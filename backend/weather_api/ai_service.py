import google.generativeai as genai
from django.conf import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")

def ask_gemini(message, weather_context=None):

    prompt = f"""
You are SkyPulse AI.

Current Weather:

City: {weather_context.get('city')}
Temperature: {weather_context.get('temperature')}°C
Humidity: {weather_context.get('humidity')}%
Wind Speed: {weather_context.get('wind_speed')}
Condition: {weather_context.get('condition')}

User Question:
{message}

Answer naturally.
Give weather recommendations when relevant.
"""

    response = model.generate_content(prompt)

    return response.text