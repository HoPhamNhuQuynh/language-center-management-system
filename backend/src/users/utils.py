from datetime import timedelta
from django.utils import timezone
from oauth2_provider.models import AccessToken, RefreshToken
from oauthlib.common import generate_token
from config import settings

oauth2_settings = getattr(settings, 'OAUTH2_PROVIDER', {})
access_token_expire = oauth2_settings.get('ACCESS_TOKEN_EXPIRE_SECONDS', 3600)

def generate_auth_token(user, application):
    expires = timezone.now() + timedelta(seconds=access_token_expire)

    access_token = AccessToken.objects.create(
        user=user,
        application=application,
        token=generate_token(),
        expires=expires,
        scope='read write'
    )

    refresh_token = RefreshToken.objects.create(
        user=user,
        application=application,
        token=generate_token(),
        access_token=access_token
    )

    return access_token, refresh_token