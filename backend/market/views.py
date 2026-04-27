from django.db.models import Count, Sum
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Customer, Farmer, Order, Payment, Product
from .serializers import (
    CustomerSerializer,
    FarmerSerializer,
    OrderSerializer,
    PaymentSerializer,
    PaymentUpdateSerializer,
    ProductSerializer,
)


class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.annotate(product_count=Count("products")).order_by("-joined_at")
    serializer_class = FarmerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.order_by("-created_at")
    serializer_class = CustomerSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("farmer").order_by("-created_at")
    serializer_class = ProductSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related("customer", "product", "payment").order_by("-created_at")
    serializer_class = OrderSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("order").order_by("-id")

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return PaymentUpdateSerializer
        return PaymentSerializer


@api_view(["GET"])
def dashboard(request):
    paid_revenue = (
        Order.objects.filter(payment__status="paid").aggregate(total=Sum("total_amount"))["total"]
        or 0
    )
    return Response(
        {
            "farmers": Farmer.objects.count(),
            "customers": Customer.objects.count(),
            "products": Product.objects.count(),
            "orders": Order.objects.count(),
            "paid_revenue": paid_revenue,
            "pending_payments": Payment.objects.filter(status="pending").count(),
            "recent_orders": OrderSerializer(
                Order.objects.select_related("customer", "product", "payment").order_by("-created_at")[:5],
                many=True,
            ).data,
        }
    )
