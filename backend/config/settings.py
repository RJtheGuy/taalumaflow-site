# settings.py
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Should be as high as possible
    'django.middleware.common.CommonMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    'https://talumaflow.com',
    'https://www.talumaflow.com',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
]