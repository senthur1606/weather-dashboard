import time
import logging

logger = logging.getLogger('weather_api')


class RequestLoggingMiddleware:
    """Log all API requests with timing information."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration = round((time.time() - start) * 1000, 2)

        if request.path.startswith('/api/'):
            logger.info(
                f"{request.method} {request.path} "
                f"→ {response.status_code} [{duration}ms] "
                f"IP:{self.get_client_ip(request)}"
            )

        return response

    def get_client_ip(self, request):
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            return x_forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '—')
