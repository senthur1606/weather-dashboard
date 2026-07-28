from django.core.cache import cache

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
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.4,
                "max_output_tokens": 150,
            }
        )

        answer = response.text
        cache.set(key, answer, 600)

        return answer

    except Exception:
        return "Sorry, I couldn't reach the AI service. Please try again."