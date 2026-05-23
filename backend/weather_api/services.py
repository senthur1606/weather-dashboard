"""
Weather service layer: wraps OpenWeatherMap API with caching,
error handling, and response normalisation.
"""
import requests
import logging
from datetime import datetime, timezone
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger('weather_api')

API_KEY = settings.WEATHER_API_KEY
BASE_URL = settings.WEATHER_API_BASE
GEO_URL = settings.GEOCODING_API_BASE
AQI_URL = settings.AIR_QUALITY_API_BASE
CACHE_TTL = settings.WEATHER_CACHE_TTL


def _get(url: str, params: dict) -> dict:
    """Low-level HTTP GET with error handling."""
    params['appid'] = API_KEY
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.Timeout:
        logger.error(f"Timeout fetching {url}")
        raise ValueError("Weather API timed out. Please try again.")
    except requests.HTTPError as e:
        if e.response.status_code == 404:
            raise ValueError("City not found. Check the city name and try again.")
        if e.response.status_code == 401:
            raise ValueError("Invalid API key. Check your OpenWeatherMap configuration.")
        raise ValueError(f"Weather API error: {e.response.status_code}")
    except requests.RequestException as e:
        logger.error(f"Request error: {e}")
        raise ValueError("Failed to connect to weather service.")


def _cache_key(prefix: str, *args) -> str:
    parts = '_'.join(str(a).lower().replace(' ', '_') for a in args)
    return f"skypulse_{prefix}_{parts}"


# ─── Current Weather ──────────────────────────────────────────────────────────

def get_current_weather(city: str = None, lat: float = None, lon: float = None) -> dict:
    """Fetch and normalise current weather for a city or coordinates."""
    if city:
        key = _cache_key('current', city)
        params = {'q': city, 'units': 'metric'}
    else:
        key = _cache_key('current', lat, lon)
        params = {'lat': lat, 'lon': lon, 'units': 'metric'}

    cached = cache.get(key)
    if cached:
        logger.debug(f"Cache HIT: {key}")
        return cached

    raw = _get(f"{BASE_URL}/weather", params)
    result = _normalise_current(raw)
    cache.set(key, result, CACHE_TTL)
    logger.info(f"Fetched current weather for {result.get('city')}")
    return result


def _normalise_current(raw: dict) -> dict:
    """Transform OWM response into our standard schema."""
    main = raw.get('main', {})
    wind = raw.get('wind', {})
    sys = raw.get('sys', {})
    weather = raw.get('weather', [{}])[0]
    clouds = raw.get('clouds', {})
    coord = raw.get('coord', {})

    tz_offset = raw.get('timezone', 0)
    sunrise_ts = sys.get('sunrise', 0)
    sunset_ts = sys.get('sunset', 0)

    def fmt_time(ts):
        dt = datetime.fromtimestamp(ts + tz_offset, tz=timezone.utc)
        return dt.strftime('%H:%M')

    return {
        'city': raw.get('name', ''),
        'country': sys.get('country', ''),
        'lat': coord.get('lat'),
        'lon': coord.get('lon'),
        'temperature': round(main.get('temp', 0)),
        'feels_like': round(main.get('feels_like', 0)),
        'temp_min': round(main.get('temp_min', 0)),
        'temp_max': round(main.get('temp_max', 0)),
        'humidity': main.get('humidity', 0),
        'pressure': main.get('pressure', 0),
        'wind_speed': round(wind.get('speed', 0) * 3.6, 1),  # m/s → km/h
        'wind_deg': wind.get('deg', 0),
        'wind_gust': round(wind.get('gust', 0) * 3.6, 1) if wind.get('gust') else None,
        'visibility': round(raw.get('visibility', 10000) / 1000, 1),  # m → km
        'cloud_cover': clouds.get('all', 0),
        'uv_index': 0,  # Requires separate UV endpoint
        'condition': weather.get('main', 'Clear'),
        'description': weather.get('description', '').title(),
        'icon': weather.get('icon', '01d'),
        'sunrise': fmt_time(sunrise_ts) if sunrise_ts else '06:00',
        'sunset': fmt_time(sunset_ts) if sunset_ts else '20:00',
        'timezone': tz_offset,
        'local_time': datetime.utcnow().isoformat(),
        'dew_point': None,
    }


# ─── Forecast ─────────────────────────────────────────────────────────────────

def get_forecast(city: str = None, lat: float = None, lon: float = None) -> dict:
    """Fetch 5-day / 3-hour forecast and reshape to daily + hourly."""
    if city:
        key = _cache_key('forecast', city)
        params = {'q': city, 'units': 'metric', 'cnt': 40}
    else:
        key = _cache_key('forecast', lat, lon)
        params = {'lat': lat, 'lon': lon, 'units': 'metric', 'cnt': 40}

    cached = cache.get(key)
    if cached:
        return cached

    raw = _get(f"{BASE_URL}/forecast", params)
    result = _normalise_forecast(raw)
    cache.set(key, result, CACHE_TTL)
    return result


def _normalise_forecast(raw: dict) -> dict:
    items = raw.get('list', [])

    # Build hourly (next 24 entries = ~3 days of 3h intervals)
    hourly = []
    for item in items[:24]:
        dt = datetime.utcfromtimestamp(item['dt'])
        w = item.get('weather', [{}])[0]
        hourly.append({
            'hour': dt.strftime('%H:%M'),
            'timestamp': item['dt'],
            'temperature': round(item['main']['temp']),
            'feels_like': round(item['main']['feels_like']),
            'humidity': item['main']['humidity'],
            'wind_speed': round(item['wind']['speed'] * 3.6, 1),
            'precipitation': round(item.get('pop', 0) * 100),
            'condition': w.get('main', 'Clear'),
            'description': w.get('description', '').title(),
            'icon': w.get('icon', '01d'),
        })

    # Aggregate to daily
    daily_map = {}
    for item in items:
        dt = datetime.utcfromtimestamp(item['dt'])
        day_key = dt.strftime('%Y-%m-%d')
        w = item.get('weather', [{}])[0]
        if day_key not in daily_map:
            daily_map[day_key] = {
                'date': day_key,
                'day': dt.strftime('%a'),
                'temps': [],
                'winds': [],
                'humidities': [],
                'precips': [],
                'conditions': [],
                'icons': [],
            }
        daily_map[day_key]['temps'].append(item['main']['temp'])
        daily_map[day_key]['winds'].append(item['wind']['speed'])
        daily_map[day_key]['humidities'].append(item['main']['humidity'])
        daily_map[day_key]['precips'].append(item.get('pop', 0) * 100)
        daily_map[day_key]['conditions'].append(w.get('main', 'Clear'))
        daily_map[day_key]['icons'].append(w.get('icon', '01d'))

    daily = []
    for day_key, d in list(daily_map.items())[:7]:
        from collections import Counter
        most_common_condition = Counter(d['conditions']).most_common(1)[0][0]
        most_common_icon = Counter(d['icons']).most_common(1)[0][0]
        daily.append({
            'date': d['date'],
            'day': d['day'],
            'high': round(max(d['temps'])),
            'low': round(min(d['temps'])),
            'humidity': round(sum(d['humidities']) / len(d['humidities'])),
            'wind_speed': round(max(d['winds']) * 3.6, 1),
            'precipitation': round(max(d['precips'])),
            'condition': most_common_condition,
            'icon': most_common_icon,
        })

    return {'daily': daily, 'hourly': hourly}


# ─── Air Quality ──────────────────────────────────────────────────────────────

def get_aqi(city: str = None, lat: float = None, lon: float = None) -> dict:
    """Fetch AQI data. Requires lat/lon; geocode city first if needed."""
    if city and not (lat and lon):
        coords = geocode_city(city)
        lat, lon = coords['lat'], coords['lon']

    key = _cache_key('aqi', lat, lon)
    cached = cache.get(key)
    if cached:
        return cached

    raw = _get(f"{AQI_URL}/air_pollution", {'lat': lat, 'lon': lon})
    result = _normalise_aqi(raw)
    cache.set(key, result, CACHE_TTL)
    return result


def _normalise_aqi(raw: dict) -> dict:
    item = raw.get('list', [{}])[0]
    main = item.get('main', {})
    components = item.get('components', {})
    aqi_val = main.get('aqi', 1)

    aqi_labels = {1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Very Poor'}
    # Convert OWM 1-5 scale to 0-500 AQI scale
    aqi_map = {1: 25, 2: 75, 3: 125, 4: 175, 5: 250}

    return {
        'aqi': aqi_map.get(aqi_val, 25),
        'aqi_raw': aqi_val,
        'category': aqi_labels.get(aqi_val, 'Good'),
        'pm2_5': round(components.get('pm2_5', 0), 1),
        'pm10': round(components.get('pm10', 0), 1),
        'o3': round(components.get('o3', 0), 1),
        'no2': round(components.get('no2', 0), 1),
        'so2': round(components.get('so2', 0), 1),
        'co': round(components.get('co', 0) / 1000, 2),  # μg/m³ → mg/m³
        'nh3': round(components.get('nh3', 0), 1),
    }


# ─── Geocoding / City Search ──────────────────────────────────────────────────

def geocode_city(city: str) -> dict:
    """Convert city name to lat/lon."""
    key = _cache_key('geo', city)
    cached = cache.get(key)
    if cached:
        return cached

    raw = _get(f"{GEO_URL}/direct", {'q': city, 'limit': 1})
    if not raw:
        raise ValueError(f"City '{city}' not found.")

    result = {'lat': raw[0]['lat'], 'lon': raw[0]['lon'],
              'name': raw[0]['name'], 'country': raw[0].get('country', '')}
    cache.set(key, result, 3600)  # geo cache 1 hour
    return result


def search_cities(query: str) -> list:
    """Search for city suggestions."""
    key = _cache_key('search', query)
    cached = cache.get(key)
    if cached:
        return cached

    raw = _get(f"{GEO_URL}/direct", {'q': query, 'limit': 8})
    results = [
        {
            'name': item.get('name', ''),
            'state': item.get('state', ''),
            'country': item.get('country', ''),
            'lat': item.get('lat'),
            'lon': item.get('lon'),
        }
        for item in raw
    ]
    cache.set(key, results, 600)  # 10 min cache for searches
    return results


# ─── AI Recommendations ───────────────────────────────────────────────────────

def get_ai_recommendations(weather_data: dict) -> list:
    """Rule-based AI weather recommendations."""
    recs = []
    temp = weather_data.get('temperature', 20)
    condition = (weather_data.get('condition') or '').lower()
    uv = weather_data.get('uv_index', 0)
    wind = weather_data.get('wind_speed', 0)
    humidity = weather_data.get('humidity', 50)
    aqi = weather_data.get('aqi', 50)

    # Temperature-based clothing
    if temp <= 0:
        recs.append("🧥 Bundle up! Heavy winter coat, gloves, and a warm scarf are essential.")
    elif temp <= 10:
        recs.append("🧤 Wear a warm jacket and consider gloves — it's chilly out there.")
    elif temp <= 18:
        recs.append("🧣 A light jacket or cardigan will keep you comfortable.")
    elif temp <= 26:
        recs.append("👕 Light clothes are perfect for today's mild temperature.")
    elif temp <= 33:
        recs.append("🌞 Opt for breathable, light-colored clothing to stay cool.")
    else:
        recs.append("🥵 Extreme heat! Stay indoors during peak hours (10am–4pm).")

    # Precipitation
    if 'thunder' in condition or 'storm' in condition:
        recs.append("⛈️ Thunderstorms expected — avoid outdoor activities and seek shelter.")
    elif 'rain' in condition or 'drizzle' in condition or 'shower' in condition:
        recs.append("☂️ Carry an umbrella and wear waterproof footwear.")

    # Snow / ice
    if 'snow' in condition or 'blizzard' in condition or 'sleet' in condition:
        recs.append("❄️ Icy conditions — drive carefully and wear non-slip footwear.")

    # UV Index
    if uv >= 8:
        recs.append("🕶️ Very high UV — apply SPF 50+, wear sunglasses and a hat.")
    elif uv >= 6:
        recs.append("🧴 High UV — sunscreen and protective clothing recommended.")
    elif uv >= 3:
        recs.append("🌂 Moderate UV — a light SPF is advisable for extended outdoor time.")

    # Wind
    if wind >= 60:
        recs.append("💨 Severe wind warning — secure outdoor items and avoid driving.")
    elif wind >= 35:
        recs.append("🌬️ Strong winds — hold onto hats and umbrellas.")

    # Humidity
    if humidity >= 85:
        recs.append("💧 Very humid — stay hydrated and take it easy on physical activity.")

    # AQI
    if aqi >= 200:
        recs.append("😷 Very unhealthy air — wear an N95 mask and limit outdoor time.")
    elif aqi >= 150:
        recs.append("😮 Unhealthy air quality — sensitive groups should stay indoors.")
    elif aqi >= 100:
        recs.append("⚠️ Moderate air quality — consider a mask if exercising outdoors.")

    # All clear
    if not recs or (len(recs) == 1 and temp > 10 and temp < 28):
        recs.append("✨ Great conditions for outdoor activities today — enjoy!")

    return recs[:5]  # Cap at 5 recommendations


# ─── Historical Weather ───────────────────────────────────────────────────────

def get_historical_weather(city: str, days: int = 7) -> list:
    """
    Return historical weather from stored snapshots.
    OWM free tier doesn't support historical; we use our WeatherSnapshot model.
    """
    from weather_api.models import WeatherSnapshot
    from django.utils import timezone
    from datetime import timedelta

    since = timezone.now() - timedelta(days=days)
    snapshots = (
        WeatherSnapshot.objects
        .filter(city__iexact=city, recorded_at__gte=since)
        .order_by('recorded_at')
        .values('recorded_at', 'temperature', 'humidity', 'wind_speed', 'aqi')
    )

    # Group by day
    daily = {}
    for snap in snapshots:
        day = snap['recorded_at'].strftime('%Y-%m-%d')
        if day not in daily:
            daily[day] = {'temps': [], 'humidities': [], 'winds': []}
        daily[day]['temps'].append(snap['temperature'])
        daily[day]['humidities'].append(snap['humidity'] or 0)
        daily[day]['winds'].append(snap['wind_speed'] or 0)

    result = []
    for day, data in sorted(daily.items()):
        result.append({
            'date': day,
            'avg_temp': round(sum(data['temps']) / len(data['temps']), 1),
            'max_temp': round(max(data['temps']), 1),
            'min_temp': round(min(data['temps']), 1),
            'humidity': round(sum(data['humidities']) / len(data['humidities'])),
            'wind_speed': round(sum(data['winds']) / len(data['winds']), 1),
        })

    return result
