"""
Weather service layer using Open-Meteo APIs
"""

import requests
import logging
from datetime import datetime
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger('weather_api')

BASE_URL = settings.WEATHER_API_BASE
GEO_URL = settings.GEOCODING_API_BASE
AQI_URL = settings.AIR_QUALITY_API_BASE
CACHE_TTL = settings.WEATHER_CACHE_TTL


# ─────────────────────────────────────────────────────────────
# HTTP HELPER
# ─────────────────────────────────────────────────────────────

def _get(url: str, params: dict) -> dict:
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()

    except requests.Timeout:
        logger.error(f"Timeout fetching {url}")
        raise ValueError("Weather API timed out.")

    except requests.RequestException as e:
        logger.error(f"Request error: {e}")
        raise ValueError("Failed to connect to weather service.")


def _cache_key(prefix: str, *args) -> str:
    parts = '_'.join(str(a).lower().replace(' ', '_') for a in args)
    return f"skypulse_{prefix}_{parts}"


# ─────────────────────────────────────────────────────────────
# GEOCODING
# ─────────────────────────────────────────────────────────────

def geocode_city(city: str) -> dict:

    key = _cache_key('geo', city)

    cached = cache.get(key)
    if cached:
        return cached

    raw = _get(
        f"{GEO_URL}/search",
        {
            "name": city,
            "count": 1
        }
    )

    results = raw.get('results')

    if not results:
        raise ValueError(f"City '{city}' not found.")

    result = {
        'lat': results[0]['latitude'],
        'lon': results[0]['longitude'],
        'name': results[0]['name'],
        'country': results[0].get('country', ''),
    }

    cache.set(key, result, 3600)

    return result


# ─────────────────────────────────────────────────────────────
# CURRENT WEATHER
# ─────────────────────────────────────────────────────────────

def get_current_weather(city=None, lat=None, lon=None):

    city_name = ''
    country = ''

    # Search by city name
    if city and not (lat and lon):

        coords = geocode_city(city)

        lat = coords['lat']
        lon = coords['lon']

        city_name = coords['name']
        country = coords['country']

    # Search by GPS coordinates
    elif lat and lon:

        location = reverse_geocode(lat, lon)

        city_name = location['name']
        country = location['country']

    else:
        raise ValueError("City or coordinates required.")

    key = _cache_key('current', lat, lon)

    cached = cache.get(key)
    if cached:
        return cached

    raw = _get(
        f"{BASE_URL}/forecast",
        {
            "latitude": lat,
            "longitude": lon,

            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "pressure_msl",
                "wind_speed_10m",
                "weather_code",
                "visibility"
            ],

            "daily": [
                "sunrise",
                "sunset",
                "uv_index_max"
            ],

            "timezone": "auto"
        }
    )

    raw['city_name'] = city_name
    raw['country'] = country

    result = _normalise_current(raw)

    cache.set(key, result, CACHE_TTL)

    return result

def get_weather_condition(weather_code):
    mapping = {
        0: ("Clear", "clear"),
        1: ("Mainly Clear", "clear"),
        2: ("Partly Cloudy", "cloudy"),
        3: ("Overcast", "cloudy"),

        45: ("Fog", "foggy"),
        48: ("Fog", "foggy"),

        51: ("Light Drizzle", "rainy"),
        53: ("Drizzle", "rainy"),
        55: ("Heavy Drizzle", "rainy"),

        61: ("Light Rain", "rainy"),
        63: ("Rain", "rainy"),
        65: ("Heavy Rain", "rainy"),

        71: ("Light Snow", "snowy"),
        73: ("Snow", "snowy"),
        75: ("Heavy Snow", "snowy"),

        80: ("Rain Showers", "rainy"),
        81: ("Heavy Showers", "rainy"),
        82: ("Violent Rain", "rainy"),

        95: ("Thunderstorm", "stormy"),
        96: ("Thunderstorm", "stormy"),
        99: ("Thunderstorm", "stormy"),
    }

    return mapping.get(
        weather_code,
        ("Unknown", "default")
    )


def _normalise_current(raw):

    current = raw.get('current', {})
    daily= raw.get('daily',{})
    weather_code = current.get('weather_code', 0)
    description, condition = get_weather_condition(weather_code)

    return {
        'city': raw.get('city_name',''),
        'country': raw.get('country',''),

        'lat': raw.get('latitude'),
        'lon': raw.get('longitude'),

        'temperature': round(current.get('temperature_2m', 0)),

        'feels_like': round(
            current.get('apparent_temperature', 0)
        ),

        'temp_min': round(
            current.get('temperature_2m', 0)
        ),

        'temp_max': round(
            current.get('temperature_2m', 0)
        ),

        'humidity': current.get(
            'relative_humidity_2m',
            0
        ),

        'pressure': current.get(
            'pressure_msl',
            0
        ),

        'wind_speed': current.get(
            'wind_speed_10m',
            0
        ),

        'wind_deg': 0,

        'wind_gust': None,

        'visibility': round(
            current.get('visibility',0) / 1000,
            1
        ),

        'cloud_cover': 0,

        'uv_index': daily.get(
            'uv_index_max',
            [0]
        )[0],

        'condition': condition,
        
        'description': description,

        'icon': '01d',

        'sunrise': daily.get('sunrise', ['06:00'])[0][-5:],

        'sunset': daily.get('sunset', ['18:00'])[0][-5:],

        'timezone': raw.get('timezone', ''),

        'local_time': current.get('time', ''),

        'dew_point': None,
    }

# ─────────────────────────────────────────────────────────────
# FORECAST
# ─────────────────────────────────────────────────────────────

def get_forecast(city=None, lat=None, lon=None):

    if city and not (lat and lon):
        coords = geocode_city(city)
        lat = coords['lat']
        lon = coords['lon']

    key = _cache_key('forecast', lat, lon)

    cached = cache.get(key)
    if cached:
        return cached

    raw = _get(
    f"{BASE_URL}/forecast",
    {
        "latitude": lat,
        "longitude": lon,

        "daily": [
            "temperature_2m_max",
            "temperature_2m_min"
        ],

        "hourly":[
            "temperature_2m",
            "precipitation_probability",
            "relative_humidity_2m",
            "wind_speed_10m"
        ],

        "timezone": "auto"
       }
     )

    result = _normalise_forecast(raw)

    cache.set(key, result, CACHE_TTL)

    return result


def _normalise_forecast(raw):

    daily_data = raw.get('daily', {})

    dates = daily_data.get('time', [])

    highs = daily_data.get('temperature_2m_max', [])

    lows = daily_data.get('temperature_2m_min', [])

    daily = []

    hourly_raw = raw.get('hourly', {})

    times = hourly_raw.get('time', [])
    temps = hourly_raw.get("temperature_2m",[])
    rain = hourly_raw.get('precipitation_probability',[])
    humidity = hourly_raw.get("relative_humidity_2m", [])
    wind = hourly_raw.get("wind_speed_10m", [])
    hourly = []

    for i in range(min(24, len(times))):
     hourly.append({
       "hour": times[i][11:16],
       "temperature": round(temps[i]),
       "humidity": humidity[i] if i < len(humidity) else 0,
       "wind_speed": wind[i] if i < len(wind) else 0,
       "precipitation": rain[i] if i < len(rain) else 0,
       "condition": "Clear"
    })

    for i in range(len(dates)):

        dt = datetime.strptime(dates[i], '%Y-%m-%d')

        daily.append({
            'date': dates[i],

            'day': dt.strftime('%a'),

            'high': round(highs[i]),

            'low': round(lows[i]),

            'humidity': 0,

            'wind_speed': 0,

            'precipitation': 0,

            'condition': 'Clear',

            'icon': '01d',
        })

    return {
        'daily': daily,
        'hourly': hourly
    }


# ─────────────────────────────────────────────────────────────
# AQI
# ─────────────────────────────────────────────────────────────

def get_aqi(city=None, lat=None, lon=None):

    if city and not (lat and lon):
        coords = geocode_city(city)
        lat = coords['lat']
        lon = coords['lon']

    key = _cache_key('aqi', lat, lon)

    cached = cache.get(key)
    if cached:
        return cached

    raw = _get(
        f"{AQI_URL}/air-quality",
        {
            "latitude": lat,
            "longitude": lon,

            "hourly": [
                "pm10",
                "pm2_5",
                "uv_index"
            ],

            "timezone": "auto"
        }
    )

    result = _normalise_aqi(raw)

    cache.set(key, result, CACHE_TTL)

    return result


def _normalise_aqi(raw):

    hourly = raw.get('hourly', {})

    pm25 = hourly.get('pm2_5', [0])[0]

    pm10 = hourly.get('pm10', [0])[0]

    return {

        'aqi': 50,

        'aqi_raw': 1,

        'category': 'Good',

        'pm2_5': pm25,

        'pm10': pm10,

        'o3': 0,

        'no2': 0,

        'so2': 0,

        'co': 0,

        'nh3': 0,
    }


# ─────────────────────────────────────────────────────────────
# SEARCH CITIES
# ─────────────────────────────────────────────────────────────

def search_cities(query: str):

    raw = _get(
        f"{GEO_URL}/search",
        {
            "name": query,
            "count": 8
        }
    )

    results = []

    for item in raw.get('results', []):

        results.append({
            'name': item.get('name', ''),
            'country': item.get('country', ''),
            'state': item.get('admin1', ''),
            'lat': item.get('latitude'),
            'lon': item.get('longitude'),
        })

    return results

def reverse_geocode(lat, lon):
    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={
                "lat": lat,
                "lon": lon,
                "format": "jsonv2"
            },
            headers={
                "User-Agent": "SkyPulse"
            },
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        address = data.get("address", {})

        city = (
            address.get("city")
            or address.get("town")
            or address.get("village")
            or address.get("county")
            or "Current Location"
        )

        return {
            "name": city,
            "country": address.get("country", "")
        }

    except Exception as e:
        logger.error(f"Reverse geocode error: {e}")

        return {
            "name": "Current Location",
            "country": ""
        }

def get_ai_recommendations(data):

    city = data.get('city')
    lat = data.get('lat')
    lon = data.get('lon')

    weather = get_current_weather(
        city=city,
        lat=lat,
        lon=lon
    )

    temp = weather.get('temperature', 0)
    humidity = weather.get('humidity', 0)
    wind_speed = weather.get('wind_speed', 0)

    recommendations = []

    if temp > 35:
        recommendations.append(
            "🔥 Very hot weather. Stay hydrated and avoid direct sunlight."
        )
    elif temp > 28:
        recommendations.append(
            "😎 Warm weather. Light cotton clothes recommended."
        )
    elif temp < 15:
        recommendations.append(
            "🧥 Cool weather. Consider carrying a jacket."
        )
    else:
        recommendations.append(
            "✨ Pleasant weather for outdoor activities."
        )

    if humidity > 80:
        recommendations.append(
            "💧 High humidity today."
        )

    if wind_speed > 25:
        recommendations.append(
            "💨 Strong winds detected."
        )

    return recommendations