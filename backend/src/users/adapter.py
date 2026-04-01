from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth.models import Group
from .models import User

class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)

        provider = sociallogin.account.provider.upper()
        user.auth_provider = provider

        if provider == 'GOOGLE':
            user.auth_provider = User.AuthProvider.GOOGLE
        elif provider == 'FACEBOOK':
            user.auth_provider = User.AuthProvider.FACEBOOK

        try:
            group = Group.objects.get(name='Student')
            user.groups.add(group)
        except Group.DoesNotExist:
            raise ValueError("Group does not exist in system!")
        
        user.save()

        return user