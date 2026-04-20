from django.db import models
from django.contrib.auth.models import User


class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile', null=True, blank=True)
    name = models.CharField(max_length=200)
    age = models.IntegerField()
    weight = models.FloatField()  # kg
    height = models.FloatField()  # cm
    kidney_status = models.CharField(max_length=50)  # Normal / Low / Critical
    liver_status = models.CharField(max_length=50)   # Normal / Low / Critical
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']


# Extend User model with role field
User.add_to_class('role', models.CharField(
    max_length=10,
    choices=[('admin', 'Admin'), ('patient', 'Patient')],
    default='patient'
))
