"""
SkyPulse Weather API Views
All weather data endpoints, auth, favorites, AQI, recommendations, and export.
"""
import logging
import uuid
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.core.cache import cache
from django.http import HttpResponse
from django.conf import settings
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView


from . import services
from .models import FavoriteCity, WeatherAlert, WeatherSnapshot
from .ai_service import ask_gemini
from .serializers import (
    FavoriteCitySerializer, WeatherAlertSerializer,
    CurrentWeatherSerializer, ForecastSerializer, AQISerializer,
    CitySearchSerializer, RecommendationRequestSerializer,
    WeatherSnapshotSerializer,
)
from .utils import get_client_ip, success_response, error_response, generate_weather_pdf

logger = logging.getLogger('weather_api')

# ── Health Check ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'ok',
        'service': 'SkyPulse Auth API',
        'version': '1.0.0',
        'timestamp': timezone.now().isoformat(),
    })

# ── Token Verify ──────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_token(request):
    """Lightweight endpoint to check if an access token is still valid."""
    # If JWT authentication passed, user is set
    if request.user and request.user.is_authenticated:
        return Response({'valid': True, 'user_id': request.user.id})
    return Response({'valid': False}, status=401)

# ─── Current Weather ──────────────────────────────────────────────────────────

class CurrentWeatherView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        city = request.query_params.get('city')
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')

        if not city and not (lat and lon):
            return error_response('Provide either "city" or "lat" and "lon" parameters.', 400)

        try:
            if city:
                data = services.get_current_weather(city=city)
            else:
                data = services.get_current_weather(lat=float(lat), lon=float(lon))

            # Record snapshot for historical data
            self._save_snapshot(data)
            return success_response(data)

        except ValueError as e:
            return error_response(str(e), 404)
        except Exception as e:
            logger.exception(f"Unexpected error in CurrentWeatherView: {e}")
            return error_response('An unexpected error occurred.', 500)

    def _save_snapshot(self, data):
        """Save current weather to history (best-effort)."""
        try:
            WeatherSnapshot.objects.create(
                city=data['city'],
                country=data.get('country', ''),
                temperature=data['temperature'],
                feels_like=data.get('feels_like'),
                humidity=data.get('humidity'),
                pressure=data.get('pressure'),
                wind_speed=data.get('wind_speed'),
                condition=data.get('condition', ''),
            )
        except Exception:
            pass  # non-critical


# ─── Forecast ─────────────────────────────────────────────────────────────────

class ForecastView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        city = request.query_params.get('city')
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')

        if not city and not (lat and lon):
            return error_response('Provide either "city" or coordinates.', 400)

        try:
            if city:
                data = services.get_forecast(city=city)
            else:
                data = services.get_forecast(lat=float(lat), lon=float(lon))
            return success_response(data)
        except ValueError as e:
            return error_response(str(e), 404)
        except Exception as e:
            logger.exception(e)
            return error_response('Failed to fetch forecast.', 500)


# ─── Air Quality ──────────────────────────────────────────────────────────────

class AQIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        city = request.query_params.get('city')
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')

        try:
            if lat and lon:
                data = services.get_aqi(lat=float(lat), lon=float(lon))
            elif city:
                data = services.get_aqi(city=city)
            else:
                return error_response('Provide city or coordinates.', 400)
            return success_response(data)
        except ValueError as e:
            return error_response(str(e), 404)
        except Exception as e:
            logger.exception(e)
            return error_response('Failed to fetch AQI data.', 500)

# ____________ AI chat view __________________________________        
class AIChatView(APIView):

    permission_classes = []

    def post(self, request):

        message = request.data.get("message")

        weather_context = request.data.get(
            "weather_context",
            {}
        )

        reply = ask_gemini(
            message,
            weather_context
        )

        return Response({
            "reply": reply
        })


# ─── City Search ──────────────────────────────────────────────────────────────

class CitySearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if len(query) < 2:
            return Response([], status=200)
        try:
            results = services.search_cities(query)
            return Response(results)
        except Exception as e:
            logger.warning(f"City search failed: {e}")
            return Response([], status=200)


# ─── Favorites ────────────────────────────────────────────────────────────────

class FavoritesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favs = FavoriteCity.objects.filter(user=request.user)
        return Response(FavoriteCitySerializer(favs, many=True).data)

    def post(self, request):
        serializer = FavoriteCitySerializer(data=request.data)
        if serializer.is_valid():
            city_name = serializer.validated_data['city']
            if FavoriteCity.objects.filter(user=request.user, city=city_name).exists():
                return error_response(f'{city_name} is already in your favorites.', 400)

            # Try to get coordinates
            try:
                coords = services.geocode_city(city_name)
                fav = FavoriteCity.objects.create(
                    user=request.user,
                    city=coords.get('name', city_name),
                    country=coords.get('country', ''),
                    lat=coords.get('lat'),
                    lon=coords.get('lon'),
                )
            except Exception:
                fav = FavoriteCity.objects.create(user=request.user, city=city_name)

            return Response(FavoriteCitySerializer(fav).data, status=201)

        return Response(serializer.errors, status=400)


class FavoriteDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, city):
        deleted, _ = FavoriteCity.objects.filter(user=request.user, city__iexact=city).delete()
        if deleted:
            return Response({'message': f'Removed {city} from favorites.'})
        return error_response(f'{city} not found in your favorites.', 404)


# ─── AI Recommendations ───────────────────────────────────────────────────────

class RecommendationsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RecommendationRequestSerializer(data=request.data)
        if serializer.is_valid():
            recommendations = services.get_ai_recommendations(serializer.validated_data)
            return Response({'recommendations': recommendations})
        # Fall back to full request data
        recommendations = services.get_ai_recommendations(request.data)
        return Response({'recommendations': recommendations})


# ─── Weather Alerts ───────────────────────────────────────────────────────────

class AlertsView(generics.ListAPIView):
    serializer_class = WeatherAlertSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = WeatherAlert.objects.filter(is_active=True)
        city = self.request.query_params.get('city')
        if city:
            qs = qs.filter(city__iexact=city)
        return qs


# ─── Historical Data ──────────────────────────────────────────────────────────

class HistoricalView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        city = request.query_params.get('city')
        days = int(request.query_params.get('days', 7))
        if not city:
            return error_response('Provide a city name.', 400)
        if days > 30:
            days = 30

        data = services.get_historical_weather(city, days)
        return Response(data)


# ─── Export PDF ───────────────────────────────────────────────────────────────

class ExportReportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        city = request.query_params.get('city', 'Unknown')
        try:
            current = services.get_current_weather(city=city)
            forecast = services.get_forecast(city=city)
            pdf_bytes = generate_weather_pdf(city, current, forecast)
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="weather_{city.lower()}.pdf"'
            return response
        except Exception as e:
            return error_response(str(e), 500)
