from django.contrib import admin
from .models import *

admin.site.register(Course)
admin.site.register(Tag)
admin.site.register(Level)
admin.site.register(ScoreType)