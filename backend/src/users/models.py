
from django.contrib.auth.models import AbstractUser
from django.db import models
from cloudinary.models import CloudinaryField
'''
    User, Profile, Role
'''

class User(AbstractUser):

    class AuthProvider(models.TextChoices):
        LOCAL = "LOCAL", "Tài khoản hệ thống"
        GOOGLE = "GOOGLE", "Tài khoản Google"
        FACEBOOK = "FACEBOOK", "Tài khoản Facebook"

    email = models.EmailField(unique=True)
    auth_provider = models.CharField(
                                    max_length=20,
                                    choices=AuthProvider.choices,
                                    default=AuthProvider.LOCAL
                                )
    provider_id = models.CharField(max_length=255, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True) 
    classrooms = models.ManyToManyField('classes.ClassRoom', through='classes.TeachingAssignment', related_name='teached_classes')
    enrollments = models.ManyToManyField('classes.ClassRoom', through='enrollments.Enrollment', related_name='enrolled_classes')

    def __str__(self):
        return self.username

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    avatar = CloudinaryField(folder='language_center_testing/users/', default='language_center_testing/defaults/student_4297861_lyjelp')
    phone_num = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.user.username
