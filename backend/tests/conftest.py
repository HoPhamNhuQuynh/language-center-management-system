import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import Group
from model_bakery import baker
from django.conf import settings
from oauth2_provider.models import Application
from django.contrib.auth import get_user_model

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def student_group(db):
    group, _ = Group.objects.get_or_create(name='Student')
    return group

@pytest.fixture
def teacher_group(db):
    group, _ = Group.objects.get_or_create(name='Teacher')
    return group

@pytest.fixture
def active_user(db, student_group):
    user = baker.make('users.User', username='testuser', email='test@gmail.com', is_active=True)
    user.groups.add(student_group)
    user.set_password('Password123!')
    user.save()
    baker.make('users.Profile', user=user, phone_num='0987654321')
    return user

@pytest.fixture
def active_teacher(db, teacher_group):
    user = baker.make('users.User', username='teacher_test', is_active=True)
    user.groups.add(teacher_group)
    user.save()
    baker.make('users.Profile', user=user)
    return user

@pytest.fixture
def classroom(db):
    course = baker.make(
        "courses.Course",
        price=6000000,
        total_sessions=20,
    )
    return baker.make('classes.ClassRoom', course=course, capacity=20, name="Lớp Python")


@pytest.fixture
def admin_user(db):
    user = baker.make('users.User', is_staff=True, is_active=True)
    return user

@pytest.fixture
def setup_course_data(db):
    level = baker.make('courses.Level', name="Basic")
    tag = baker.make('courses.Tag', name="Python")
    return level, tag

@pytest.fixture(autouse=True)
def oauth_application(db): 
    User = get_user_model()
    admin, _ = User.objects.get_or_create(
        username="admin", defaults={"password": "admin123"}
    )

    app, _ = Application.objects.get_or_create(
        name="Language Center",
        defaults={
            "user": admin,
            "client_type": Application.CLIENT_CONFIDENTIAL,
            "authorization_grant_type": Application.GRANT_PASSWORD,
        },
    )
    settings.CLIENT_ID = app.client_id
    settings.CLIENT_SECRET = app.client_secret

    return app