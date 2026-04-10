
from django.db import models
from core.models import BaseActiveModel, TimeStampedModel
from cloudinary.models import CloudinaryField
'''
    Course, Tag, Level, ScoreType
'''

class Course(BaseActiveModel, TimeStampedModel):
    name = models.CharField(max_length=255, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=2000000)
    description = models.TextField()
    image = CloudinaryField(folder='language_center_testing/courses/', default='language_center_testing/courses/lxkpvpnsh95v520gb0on')
    total_sessions = models.PositiveIntegerField(default=0)
    
    level = models.ForeignKey('Level', on_delete=models.PROTECT)
    tags = models.ManyToManyField('Tag', blank=True)

    def __str__(self):
        return self.name
    
class Level(BaseActiveModel, TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()

    def __str__(self):
        return self.name
    
class Tag(BaseActiveModel, TimeStampedModel):
    name = models.CharField(max_length=100, unique=True, db_index=True)

    def __str__(self):
        return self.name
    
class ScoreType(BaseActiveModel, TimeStampedModel):
    name = models.CharField(max_length=255)
    weight = models.FloatField()
    course = models.ForeignKey(Course, on_delete=models.PROTECT)

    class Meta:
        unique_together = ['name', 'course']
    
    def __str__(self):
        return self.name