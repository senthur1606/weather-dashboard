from google import genai
from django.conf import settings
from django.core.cache import cache

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def ask_gemini(message, weather_context=None):
    weather_context = weather_context or {}

    key = f"ai_{weather_context.get('city')}_{message.lower()}"

    cached = cache.get(key)
    if cached:
        return cached

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

Rules:
- Answer in under 100 words.
- Be concise.
- Give weather advice only if relevant.
- Do not use markdown.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        answer = response.text

        cache.set(key, answer, 600)

        return answer

    except Exception as e:
     import logging

     logging.exception("Gemini API Error")

     return "Sorry, I couldn't generate a response right now."