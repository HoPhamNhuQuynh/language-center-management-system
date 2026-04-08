
from django.contrib.auth.models import AbstractUser
from django.db import models
from cloudinary.models import CloudinaryField
'''
    User, Profile
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
    classrooms = models.ManyToManyField('classes.ClassRoom', through='classes.TeachingAssignment', related_name='teachers')
    enrollments = models.ManyToManyField('classes.ClassRoom', through='enrollments.Enrollment', related_name='students')

    @property
    def is_teacher(self):
        return self.is_authenticated and self.groups.filter(name='Teacher').exists()

    @property
    def is_student(self):
        return self.is_authenticated and self.groups.filter(name='Student').exists()
    
    @property
    def is_admin(self):
        return self.is_authenticated and (self.is_staff or self.is_superuser)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    avatar = CloudinaryField(folder='language_center_testing/users/', default='language_center_testing/defaults/student_4297861_lyjelp')
    phone_num = models.CharField(max_length=10, unique=True, null=True, blank=True, default=None)

    def __str__(self):
        return self.user.username
    
