from datetime import date, timedelta

from django.core.management.base import BaseCommand

from market.models import Customer, Farmer, Order, Payment, Product


class Command(BaseCommand):
    help = "Create demo farmers, products, customers, orders, and payments."

    def handle(self, *args, **options):
        farmer, _ = Farmer.objects.get_or_create(
            phone="9876543210",
            defaults={
                "name": "Ravi Kumar",
                "village": "Anantapur",
                "district": "Anantapur",
                "upi_id": "ravi@upi",
            },
        )
        farmer_two, _ = Farmer.objects.get_or_create(
            phone="9123456780",
            defaults={
                "name": "Meena Devi",
                "village": "Mysuru",
                "district": "Mysuru",
                "upi_id": "meena@upi",
            },
        )
        product, _ = Product.objects.get_or_create(
            farmer=farmer,
            name="Organic Tomatoes",
            defaults={
                "category": "vegetables",
                "price_per_kg": 32,
                "quantity_kg": 120,
                "harvest_date": date.today() - timedelta(days=1),
                "description": "Freshly harvested, chemical-free tomatoes.",
            },
        )
        Product.objects.get_or_create(
            farmer=farmer_two,
            name="Mysuru Bananas",
            defaults={
                "category": "fruits",
                "price_per_kg": 48,
                "quantity_kg": 80,
                "harvest_date": date.today(),
                "description": "Sweet local bananas available for direct purchase.",
            },
        )
        customer, _ = Customer.objects.get_or_create(
            phone="9988776655",
            defaults={
                "name": "Asha Nair",
                "address": "MG Road, Bengaluru",
            },
        )
        order, _ = Order.objects.get_or_create(
            customer=customer,
            product=product,
            defaults={
                "quantity_kg": 5,
                "total_amount": 160,
                "status": "confirmed",
                "delivery_address": customer.address,
            },
        )
        Payment.objects.update_or_create(
            order=order,
            defaults={"method": "upi", "status": "paid", "transaction_id": "UPI-DEMO-1001"},
        )
        self.stdout.write(self.style.SUCCESS("Demo data is ready."))
