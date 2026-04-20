from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.patients.models import Patient
from apps.drugs.models import Drug
from apps.prescriptions.models import Prescription
from apps.inventory.models import Inventory
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Create seed data for RBAC testing (admin and patient users with sample data)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating seed data...')
        
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_user(
                username='admin',
                password='admin123',
                email='admin@oncosafe.com'
            )
            admin.role = 'admin'
            admin.save()
            self.stdout.write(self.style.SUCCESS('✓ Created admin user (admin/admin123)'))
        else:
            self.stdout.write('Admin user already exists')
        
        # Create patient1 user and profile
        patient1 = None
        if not User.objects.filter(username='patient1').exists():
            patient1_user = User.objects.create_user(
                username='patient1',
                password='patient123',
                email='patient1@oncosafe.com'
            )
            patient1_user.role = 'patient'
            patient1_user.save()
            
            patient1 = Patient.objects.create(
                user=patient1_user,
                name='John Doe',
                age=45,
                weight=75.0,
                height=175.0,
                kidney_status='Normal',
                liver_status='Low'
            )
            self.stdout.write(self.style.SUCCESS('✓ Created patient1 user (patient1/patient123) - John Doe'))
        else:
            patient1 = Patient.objects.filter(user__username='patient1').first()
            self.stdout.write('Patient1 user already exists')
        
        # Create patient2 user and profile
        patient2 = None
        if not User.objects.filter(username='patient2').exists():
            patient2_user = User.objects.create_user(
                username='patient2',
                password='patient123',
                email='patient2@oncosafe.com'
            )
            patient2_user.role = 'patient'
            patient2_user.save()
            
            patient2 = Patient.objects.create(
                user=patient2_user,
                name='Jane Smith',
                age=52,
                weight=65.0,
                height=165.0,
                kidney_status='Low',
                liver_status='Normal'
            )
            self.stdout.write(self.style.SUCCESS('✓ Created patient2 user (patient2/patient123) - Jane Smith'))
        else:
            patient2 = Patient.objects.filter(user__username='patient2').first()
            self.stdout.write('Patient2 user already exists')
        
        # Create patient3 user and profile
        patient3 = None
        if not User.objects.filter(username='patient3').exists():
            patient3_user = User.objects.create_user(
                username='patient3',
                password='patient123',
                email='patient3@oncosafe.com'
            )
            patient3_user.role = 'patient'
            patient3_user.save()
            
            patient3 = Patient.objects.create(
                user=patient3_user,
                name='Robert Johnson',
                age=38,
                weight=82.0,
                height=180.0,
                kidney_status='Normal',
                liver_status='Normal'
            )
            self.stdout.write(self.style.SUCCESS('✓ Created patient3 user (patient3/patient123) - Robert Johnson'))
        else:
            patient3 = Patient.objects.filter(user__username='patient3').first()
            self.stdout.write('Patient3 user already exists')
        
        # Create sample drugs if they don't exist
        drug1, created = Drug.objects.get_or_create(
            rxcui='1234567',
            defaults={
                'name': 'Cisplatin',
                'category': 'Chemo'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created drug: Cisplatin'))
        
        drug2, created = Drug.objects.get_or_create(
            rxcui='2345678',
            defaults={
                'name': 'Doxorubicin',
                'category': 'Chemo'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created drug: Doxorubicin'))
        
        drug3, created = Drug.objects.get_or_create(
            rxcui='3456789',
            defaults={
                'name': 'Ondansetron',
                'category': 'Supportive'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created drug: Ondansetron'))
        
        # Create sample prescriptions
        if patient1 and not Prescription.objects.filter(patient=patient1).exists():
            prescription1 = Prescription.objects.create(patient=patient1)
            prescription1.drugs.add(drug1, drug3)
            self.stdout.write(self.style.SUCCESS('✓ Created prescription for John Doe'))
        
        if patient2 and not Prescription.objects.filter(patient=patient2).exists():
            prescription2 = Prescription.objects.create(patient=patient2)
            prescription2.drugs.add(drug2, drug3)
            self.stdout.write(self.style.SUCCESS('✓ Created prescription for Jane Smith'))
        
        if patient3 and not Prescription.objects.filter(patient=patient3).exists():
            prescription3 = Prescription.objects.create(patient=patient3)
            prescription3.drugs.add(drug1, drug2)
            self.stdout.write(self.style.SUCCESS('✓ Created prescription for Robert Johnson'))
        
        # Create sample inventory items with varying expiry dates and stock levels
        inventory_data = [
            {'drug': drug1, 'quantity': 50, 'days_until_expiry': 90, 'storage_type': 'Cold'},
            {'drug': drug1, 'quantity': 5, 'days_until_expiry': 15, 'storage_type': 'Cold'},  # Low stock + expiring soon
            {'drug': drug2, 'quantity': 30, 'days_until_expiry': 120, 'storage_type': 'Normal'},
            {'drug': drug2, 'quantity': 8, 'days_until_expiry': 60, 'storage_type': 'Normal'},  # Low stock
            {'drug': drug3, 'quantity': 100, 'days_until_expiry': 180, 'storage_type': 'Normal'},
            {'drug': drug3, 'quantity': 20, 'days_until_expiry': 10, 'storage_type': 'Normal'},  # Expiring soon
        ]
        
        for inv_data in inventory_data:
            expiry_date = date.today() + timedelta(days=inv_data['days_until_expiry'])
            # Check if similar inventory item already exists
            if not Inventory.objects.filter(
                drug=inv_data['drug'],
                quantity=inv_data['quantity'],
                expiry_date=expiry_date
            ).exists():
                Inventory.objects.create(
                    drug=inv_data['drug'],
                    quantity=inv_data['quantity'],
                    expiry_date=expiry_date,
                    storage_type=inv_data['storage_type']
                )
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Created inventory: {inv_data["drug"].name} - {inv_data["quantity"]} units (expires in {inv_data["days_until_expiry"]} days)'
                ))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Seed data created successfully!'))
        self.stdout.write('\nTest accounts:')
        self.stdout.write('  Admin: admin/admin123')
        self.stdout.write('  Patient 1: patient1/patient123 (John Doe)')
        self.stdout.write('  Patient 2: patient2/patient123 (Jane Smith)')
        self.stdout.write('  Patient 3: patient3/patient123 (Robert Johnson)')
        self.stdout.write('\nSample data:')
        self.stdout.write('  3 drugs (Cisplatin, Doxorubicin, Ondansetron)')
        self.stdout.write('  3 prescriptions (one per patient)')
        self.stdout.write('  6 inventory items (with varying stock levels and expiry dates)')
