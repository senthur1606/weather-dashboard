from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import FavoriteCity, WeatherAlert, WeatherSnapshot
# ─── Favorites ────────────────────────────────────────────────────────────────

class FavoriteCitySerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteCity
        fields = ['id', 'city', 'country', 'lat', 'lon', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_city(self, value):
        return value.strip().title()


# ─── Weather Alerts ───────────────────────────────────────────────────────────

class WeatherAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherAlert
        fields = ['id', 'city', 'title', 'description', 'severity', 'start_time', 'end_time', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


# ─── Weather Data (pass-through from service) ────────────────────────────────

class CurrentWeatherSerializer(serializers.Serializer):
    city = serializers.CharField()
    country = serializers.CharField()
    lat = serializers.FloatField(allow_null=True)
    lon = serializers.FloatField(allow_null=True)
    temperature = serializers.IntegerField()
    feels_like = serializers.IntegerField()
    temp_min = serializers.IntegerField()
    temp_max = serializers.IntegerField()
    humidity = serializers.IntegerField()
    pressure = serializers.IntegerField()
    wind_speed = serializers.FloatField()
    wind_deg = serializers.IntegerField()
    wind_gust = serializers.FloatField(allow_null=True)
    visibility = serializers.FloatField()
    cloud_cover = serializers.IntegerField()
    uv_index = serializers.FloatField()
    condition = serializers.CharField()
    description = serializers.CharField()
    icon = serializers.CharField()
    sunrise = serializers.CharField()
    sunset = serializers.CharField()
    timezone = serializers.IntegerField()
    local_time = serializers.CharField()
    dew_point = serializers.FloatField(allow_null=True)


class HourlyForecastSerializer(serializers.Serializer):
    hour = serializers.CharField()
    timestamp = serializers.IntegerField()
    temperature = serializers.IntegerField()
    feels_like = serializers.IntegerField()
    humidity = serializers.IntegerField()
    wind_speed = serializers.FloatField()
    precipitation = serializers.IntegerField()
    condition = serializers.CharField()
    description = serializers.CharField()
    icon = serializers.CharField()


class DailyForecastSerializer(serializers.Serializer):
    date = serializers.CharField()
    day = serializers.CharField()
    high = serializers.IntegerField()
    low = serializers.IntegerField()
    humidity = serializers.IntegerField()
    wind_speed = serializers.FloatField()
    precipitation = serializers.IntegerField()
    condition = serializers.CharField()
    icon = serializers.CharField()


class ForecastSerializer(serializers.Serializer):
    daily = DailyForecastSerializer(many=True)
    hourly = HourlyForecastSerializer(many=True)


class AQISerializer(serializers.Serializer):
    aqi = serializers.IntegerField()
    aqi_raw = serializers.IntegerField()
    category = serializers.CharField()
    pm2_5 = serializers.FloatField()
    pm10 = serializers.FloatField()
    o3 = serializers.FloatField()
    no2 = serializers.FloatField()
    so2 = serializers.FloatField()
    co = serializers.FloatField()
    nh3 = serializers.FloatField(required=False, allow_null=True)


class CitySearchSerializer(serializers.Serializer):
    name = serializers.CharField()
    state = serializers.CharField(allow_blank=True)
    country = serializers.CharField(allow_blank=True)
    lat = serializers.FloatField(allow_null=True)
    lon = serializers.FloatField(allow_null=True)


class RecommendationRequestSerializer(serializers.Serializer):
    city = serializers.CharField(required=False)
    temperature = serializers.FloatField(required=False)
    condition = serializers.CharField(required=False)
    humidity = serializers.IntegerField(required=False)
    wind_speed = serializers.FloatField(required=False)
    uv_index = serializers.FloatField(required=False)
    aqi = serializers.IntegerField(required=False)


class WeatherSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherSnapshot
        fields = ['city', 'temperature', 'humidity', 'wind_speed', 'condition', 'aqi', 'recorded_at']
