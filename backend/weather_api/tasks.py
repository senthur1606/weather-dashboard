"""
Celery async tasks:
- Periodic weather cache warming
- Alert detection and user notifications
- Weather snapshot cleanup
"""
import logging
from celery import shared_task
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger('weather_api')


@shared_task(name='weather_api.tasks.update_weather_cache', bind=True, max_retries=3)
def update_weather_cache(self):
    """
    Pre-warm weather cache for all favorited cities.
    Runs every 10 minutes via Celery Beat.
    """
    from weather_api.models import FavoriteCity
    from weather_api import services

    cities = FavoriteCity.objects.values_list('city', flat=True).distinct()
    updated = 0
    errors = 0

    for city in cities:
        try:
            services.get_current_weather(city=city)
            services.get_forecast(city=city)
            updated += 1
            logger.debug(f"Cache refreshed: {city}")
        except Exception as e:
            errors += 1
            logger.warning(f"Cache refresh failed for {city}: {e}")

    logger.info(f"Cache update complete: {updated} cities updated, {errors} errors")
    return {'updated': updated, 'errors': errors}


@shared_task(name='weather_api.tasks.send_weather_alerts', bind=True, max_retries=3)
def send_weather_alerts(self):
    """
    Detect severe weather and notify users who have email alerts enabled.
    Runs every hour.
    """
    from weather_api.models import FavoriteCity, WeatherAlert, UserProfile
    from weather_api import services
    from weather_api.utils import get_alert_severity

    SEVERE_CONDITIONS = [
        'thunderstorm', 'tornado', 'hurricane', 'blizzard',
        'heavy rain', 'storm', 'extreme'
    ]

    alert_count = 0
    users_with_alerts = UserProfile.objects.filter(email_alerts=True).select_related('user')

    for profile in users_with_alerts:
        user = profile.user
        if not user.email:
            continue

        favorites = FavoriteCity.objects.filter(user=user)
        alerts_to_send = []

        for fav in favorites:
            try:
                weather = services.get_current_weather(city=fav.city)
                condition = weather.get('condition', '').lower()
                wind = weather.get('wind_speed', 0)
                temp = weather.get('temperature', 20)

                is_severe = any(kw in condition for kw in SEVERE_CONDITIONS) or wind > 60

                if is_severe:
                    severity = get_alert_severity(condition, wind, temp)
                    alert, created = WeatherAlert.objects.get_or_create(
                        city=fav.city,
                        title=f"Severe Weather: {weather.get('condition')}",
                        defaults={
                            'description': f"{weather.get('description')} — {wind}km/h winds",
                            'severity': severity,
                            'is_active': True,
                        }
                    )
                    if created or not alert.notified:
                        alerts_to_send.append(alert)

            except Exception as e:
                logger.warning(f"Alert check failed for {fav.city}: {e}")

        if alerts_to_send:
            _send_alert_email(user, alerts_to_send)
            WeatherAlert.objects.filter(id__in=[a.id for a in alerts_to_send]).update(notified=True)
            alert_count += len(alerts_to_send)

    logger.info(f"Sent {alert_count} weather alerts")
    return {'alerts_sent': alert_count}


def _send_alert_email(user, alerts):
    """Send a weather alert email to a user."""
    city_list = ', '.join(a.city for a in alerts)
    body = f"""
Hi {user.first_name or user.username},

SkyPulse has detected severe weather conditions in cities you're tracking:

"""
    for alert in alerts:
        body += f"⚠️ {alert.city} — [{alert.severity.upper()}] {alert.title}\n   {alert.description}\n\n"

    body += "\nStay safe!\n\nThe SkyPulse Team\nhttps://skypulse.app"

    try:
        send_mail(
            subject=f"[SkyPulse] Severe Weather Alert: {city_list}",
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
        logger.info(f"Alert email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send alert email to {user.email}: {e}")


@shared_task(name='weather_api.tasks.cleanup_old_snapshots')
def cleanup_old_snapshots():
    """
    Remove weather snapshots older than 30 days to keep the DB clean.
    Run daily.
    """
    from weather_api.models import WeatherSnapshot

    cutoff = timezone.now() - timedelta(days=30)
    deleted, _ = WeatherSnapshot.objects.filter(recorded_at__lt=cutoff).delete()
    logger.info(f"Cleaned up {deleted} old weather snapshots")
    return {'deleted': deleted}


@shared_task(name='weather_api.tasks.refresh_single_city', bind=True)
def refresh_single_city(self, city: str):
    """Refresh weather data for a specific city on demand."""
    from weather_api import services
    from weather_api.utils import clear_city_cache

    clear_city_cache(city)
    try:
        current = services.get_current_weather(city=city)
        services.get_forecast(city=city)
        logger.info(f"Refreshed weather for {city}: {current.get('temperature')}°C")
        return {'city': city, 'temperature': current.get('temperature'), 'status': 'ok'}
    except Exception as e:
        logger.error(f"Failed to refresh {city}: {e}")
        raise self.retry(exc=e, countdown=60)
