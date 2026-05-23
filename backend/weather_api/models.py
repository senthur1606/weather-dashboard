from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


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


class UserProfile(models.Model):
    """Extended user profile for preferences."""
    UNIT_CHOICES = [('metric', 'Metric (°C)'), ('imperial', 'Imperial (°F)')]
    LANG_CHOICES = [
        ('en', 'English'), ('es', 'Spanish'), ('fr', 'French'),
        ('de', 'German'), ('ja', 'Japanese'), ('zh', 'Chinese'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    temperature_unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='metric')
    language = models.CharField(max_length=5, choices=LANG_CHOICES, default='en')
    email_alerts = models.BooleanField(default=False)
    default_city = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.username}"


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
