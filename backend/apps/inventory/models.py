from django.db import models
from apps.drugs.models import Drug


class Inventory(models.Model):
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    expiry_date = models.DateField()
    storage_type = models.CharField(max_length=50)  # Cold / Normal
    
    def __str__(self):
        return f"{self.drug.name} - {self.quantity} units"
    
    class Meta:
        ordering = ['expiry_date']
        verbose_name_plural = 'Inventories'
