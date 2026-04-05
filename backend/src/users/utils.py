from datetime import timedelta
from django.utils import timezone
from oauth2_provider.models import AccessToken, RefreshToken
from oauthlib.common import generate_token

def generate_auth_token(user, application):
    expires = timezone.now() + timedelta(minutes=15)

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