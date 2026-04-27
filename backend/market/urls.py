from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CustomerViewSet, FarmerViewSet, OrderViewSet, PaymentViewSet, ProductViewSet, dashboard

router = DefaultRouter()
router.register("farmers", FarmerViewSet)
router.register("customers", CustomerViewSet)
router.register("products", ProductViewSet)
router.register("orders", OrderViewSet)
router.register("payments", PaymentViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", dashboard),
]
