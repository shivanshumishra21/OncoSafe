from django.db import models


class Drug(models.Model):
    name = models.CharField(max_length=200)
    rxcui = models.CharField(max_length=50, unique=True)  # RxNorm Concept Unique Identifier
    category = models.CharField(max_length=100)  # Chemo / Supportive
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']
