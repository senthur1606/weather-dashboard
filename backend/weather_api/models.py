import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class FavoriteCity(models.Model):
    """User's saved favorite cities."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=10, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'city')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} → {self.city}"


class WeatherAlert(models.Model):
    """Severe weather alerts for users."""
    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('severe', 'Severe'),
        ('extreme', 'Extreme'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts', null=True, blank=True)
    city = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='info')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity.upper()}] {self.city}: {self.title}"


class WeatherSearchLog(models.Model):
    """Track popular city searches for analytics."""
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=10, blank=True)
    search_count = models.PositiveIntegerField(default=1)
    last_searched = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-search_count']

    def __str__(self):
        return f"{self.city} ({self.search_count} searches)"

class WeatherSnapshot(models.Model):
    """Cache snapshots of weather data for historical queries."""
    city = models.CharField(max_length=100, db_index=True)
    country = models.CharField(max_length=10, blank=True)
    temperature = models.FloatField()
    feels_like = models.FloatField(null=True, blank=True)
    humidity = models.IntegerField(null=True, blank=True)
    pressure = models.IntegerField(null=True, blank=True)
    wind_speed = models.FloatField(null=True, blank=True)
    condition = models.CharField(max_length=100, blank=True)
    aqi = models.IntegerField(null=True, blank=True)
    recorded_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['city', 'recorded_at']),
        ]

    def __str__(self):
        return f"{self.city} @ {self.recorded_at.strftime('%Y-%m-%d %H:%M')}: {self.temperature}°C"
