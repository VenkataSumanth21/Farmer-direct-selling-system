from django.utils import timezone
from rest_framework import serializers

from .models import Customer, Farmer, Order, Payment, Product


class FarmerSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Farmer
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source="farmer.name", read_only=True)
    farmer_village = serializers.CharField(source="farmer.village", read_only=True)

    class Meta:
        model = Product
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ["total_amount"]

    def create(self, validated_data):
        product = validated_data["product"]
        quantity = validated_data["quantity_kg"]
        validated_data["total_amount"] = product.price_per_kg * quantity
        order = super().create(validated_data)
        Payment.objects.create(order=order, method="upi", status="pending")
        return order


class PaymentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["method", "status", "transaction_id"]

    def update(self, instance, validated_data):
        if validated_data.get("status") == "paid" and not instance.paid_at:
            instance.paid_at = timezone.now()
        return super().update(instance, validated_data)
