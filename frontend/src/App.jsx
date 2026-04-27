import {
  BarChart3,
  CheckCircle2,
  IndianRupee,
  Leaf,
  PackagePlus,
  ShoppingBasket,
  Sprout,
  Truck,
  Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const emptyFarmer = {
  name: "",
  phone: "",
  village: "",
  district: "",
  upi_id: "",
};

const emptyProduct = {
  farmer: "",
  name: "",
  category: "vegetables",
  price_per_kg: "",
  quantity_kg: "",
  harvest_date: new Date().toISOString().slice(0, 10),
  description: "",
};

const emptyCustomer = {
  name: "",
  phone: "",
  address: "",
};

const demoFarmers = [
  {
    id: 1,
    name: "Ravi Kumar",
    phone: "9876543210",
    village: "Anantapur",
    district: "Anantapur",
    upi_id: "ravi@upi",
    product_count: 1,
  },
  {
    id: 2,
    name: "Meena Devi",
    phone: "9123456780",
    village: "Mysuru",
    district: "Mysuru",
    upi_id: "meena@upi",
    product_count: 1,
  },
];

const demoProducts = [
  {
    id: 1,
    farmer: 1,
    farmer_name: "Ravi Kumar",
    farmer_village: "Anantapur",
    name: "Organic Tomatoes",
    category: "vegetables",
    price_per_kg: "32.00",
    quantity_kg: "120.00",
    harvest_date: new Date().toISOString().slice(0, 10),
    description: "Freshly harvested, chemical-free tomatoes.",
  },
  {
    id: 2,
    farmer: 2,
    farmer_name: "Meena Devi",
    farmer_village: "Mysuru",
    name: "Mysuru Bananas",
    category: "fruits",
    price_per_kg: "48.00",
    quantity_kg: "80.00",
    harvest_date: new Date().toISOString().slice(0, 10),
    description: "Sweet local bananas available for direct purchase.",
  },
];

const demoCustomers = [
  {
    id: 1,
    name: "Asha Nair",
    phone: "9988776655",
    address: "MG Road, Bengaluru",
  },
];

const demoOrders = [
  {
    id: 1,
    product: 1,
    product_name: "Organic Tomatoes",
    customer: 1,
    customer_name: "Asha Nair",
    quantity_kg: "5.00",
    total_amount: "160.00",
    status: "confirmed",
    payment: { id: 1, method: "upi", status: "paid", transaction_id: "UPI-DEMO-1001" },
  },
];

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export default function App() {
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [farmerForm, setFarmerForm] = useState(emptyFarmer);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("Connecting farmers and customers directly.");
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);

  async function loadData() {
    const [farmerData, productData, customerData, orderData, dashboardData] = await Promise.all([
      api("/farmers/"),
      api("/products/"),
      api("/customers/"),
      api("/orders/"),
      api("/dashboard/"),
    ]);
    setFarmers(farmerData);
    setProducts(productData);
    setCustomers(customerData);
    setOrders(orderData);
    setDashboard(dashboardData);
    setApiOnline(true);
    if (!selectedProduct && productData.length) {
      setSelectedProduct(productData[0].id);
    }
    if (!productForm.farmer && farmerData.length) {
      setProductForm((current) => ({ ...current, farmer: farmerData[0].id }));
    }
  }

  useEffect(() => {
    loadData().catch(() => {
      setApiOnline(false);
      setFarmers(demoFarmers);
      setProducts(demoProducts);
      setCustomers(demoCustomers);
      setOrders(demoOrders);
      setDashboard({
        farmers: demoFarmers.length,
        customers: demoCustomers.length,
        products: demoProducts.length,
        orders: demoOrders.length,
        paid_revenue: 160,
        pending_payments: 0,
      });
      setSelectedProduct(demoProducts[0].id);
      setProductForm((current) => ({ ...current, farmer: demoFarmers[0].id }));
      setMessage("Demo mode is running until the Render API is connected.");
    });
  }, []);

  const selectedProductData = useMemo(
    () => products.find((product) => String(product.id) === String(selectedProduct)),
    [products, selectedProduct],
  );

  const orderTotal = selectedProductData ? Number(selectedProductData.price_per_kg) * Number(quantity || 0) : 0;

  async function handleCreateFarmer(event) {
    event.preventDefault();
    setLoading(true);
    try {
      if (apiOnline) {
        await api("/farmers/", { method: "POST", body: JSON.stringify(farmerForm) });
        await loadData();
      } else {
        const farmer = { ...farmerForm, id: Date.now(), product_count: 0 };
        setFarmers((current) => [farmer, ...current]);
        setDashboard((current) => ({ ...current, farmers: current.farmers + 1 }));
      }
      setFarmerForm(emptyFarmer);
      setMessage("Farmer registered successfully.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    setLoading(true);
    try {
      if (apiOnline) {
        await api("/products/", { method: "POST", body: JSON.stringify(productForm) });
        await loadData();
      } else {
        const farmer = farmers.find((item) => String(item.id) === String(productForm.farmer));
        const product = {
          ...productForm,
          id: Date.now(),
          farmer_name: farmer?.name || "Registered Farmer",
          farmer_village: farmer?.village || "Local village",
        };
        setProducts((current) => [product, ...current]);
        setDashboard((current) => ({ ...current, products: current.products + 1 }));
        setSelectedProduct(product.id);
      }
      setProductForm((current) => ({ ...emptyProduct, farmer: current.farmer }));
      setMessage("Product uploaded to the marketplace.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCustomer(event) {
    event.preventDefault();
    setLoading(true);
    try {
      if (apiOnline) {
        await api("/customers/", { method: "POST", body: JSON.stringify(customerForm) });
        await loadData();
      } else {
        const customer = { ...customerForm, id: Date.now() };
        setCustomers((current) => [customer, ...current]);
        setDashboard((current) => ({ ...current, customers: current.customers + 1 }));
      }
      setCustomerForm(emptyCustomer);
      setMessage("Customer profile created.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();
    if (!customers.length || !selectedProductData) return;
    setLoading(true);
    try {
      const customer = customers[0];
      if (apiOnline) {
        const order = await api("/orders/", {
          method: "POST",
          body: JSON.stringify({
            customer: customer.id,
            product: selectedProductData.id,
            quantity_kg: quantity,
            delivery_address: customer.address,
          }),
        });
        await api(`/payments/${order.payment.id}/`, {
          method: "PATCH",
          body: JSON.stringify({
            method: "upi",
            status: "paid",
            transaction_id: `UPI-${Date.now()}`,
          }),
        });
        await loadData();
      } else {
        const order = {
          id: Date.now(),
          product: selectedProductData.id,
          product_name: selectedProductData.name,
          customer: customer.id,
          customer_name: customer.name,
          quantity_kg: Number(quantity).toFixed(2),
          total_amount: orderTotal.toFixed(2),
          status: "placed",
          payment: { id: Date.now() + 1, method: "upi", status: "paid", transaction_id: `UPI-${Date.now()}` },
        };
        setOrders((current) => [order, ...current]);
        setDashboard((current) => ({
          ...current,
          orders: current.orders + 1,
          paid_revenue: Number(current.paid_revenue || 0) + orderTotal,
        }));
      }
      setMessage("Order placed and payment marked as paid.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header className="hero">
        <nav>
          <div className="brand">
            <Sprout size={30} />
            <span>Farmer Direct Selling System</span>
          </div>
          <div className="nav-status">
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        </nav>
        <section className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Fresh produce. Fair prices. No middlemen.</p>
            <h1>Farmers sell directly. Customers buy transparently.</h1>
            <p>
              A digital market for farmer registration, product listing, direct ordering,
              payment tracking, and admin monitoring.
            </p>
            <div className="hero-actions">
              <a href="#market">Browse Market</a>
              <a href="#farmer">Add Farmer</a>
            </div>
          </div>
          <div className="market-visual" aria-label="Direct farm marketplace overview">
            <div className="field-card">
              <Leaf size={28} />
              <span>Farmer</span>
              <strong>Uploads produce</strong>
            </div>
            <div className="route-line" />
            <div className="field-card customer-card">
              <ShoppingBasket size={28} />
              <span>Customer</span>
              <strong>Orders directly</strong>
            </div>
            <div className="produce-strip">
              {["Tomato", "Banana", "Rice", "Milk"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </section>
      </header>

      <section className="metrics" aria-label="Admin dashboard">
        {[
          ["Farmers", dashboard?.farmers, Users],
          ["Products", dashboard?.products, PackagePlus],
          ["Orders", dashboard?.orders, Truck],
          ["Paid Revenue", currency(dashboard?.paid_revenue), IndianRupee],
        ].map(([label, value, Icon]) => (
          <article key={label}>
            <Icon size={22} />
            <span>{label}</span>
            <strong>{value ?? "0"}</strong>
          </article>
        ))}
      </section>

      <section className="workspace">
        <div className="panel" id="farmer">
          <div className="section-title">
            <PackagePlus size={22} />
            <h2>Farmer Module</h2>
          </div>
          <form onSubmit={handleCreateFarmer}>
            <input placeholder="Farmer name" value={farmerForm.name} onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })} required />
            <input placeholder="Phone" value={farmerForm.phone} onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })} required />
            <input placeholder="Village" value={farmerForm.village} onChange={(e) => setFarmerForm({ ...farmerForm, village: e.target.value })} required />
            <input placeholder="District" value={farmerForm.district} onChange={(e) => setFarmerForm({ ...farmerForm, district: e.target.value })} required />
            <input placeholder="UPI ID" value={farmerForm.upi_id} onChange={(e) => setFarmerForm({ ...farmerForm, upi_id: e.target.value })} />
            <button disabled={loading}>Register Farmer</button>
          </form>
        </div>

        <div className="panel">
          <div className="section-title">
            <Leaf size={22} />
            <h2>Product Upload</h2>
          </div>
          <form onSubmit={handleCreateProduct}>
            <select value={productForm.farmer} onChange={(e) => setProductForm({ ...productForm, farmer: e.target.value })} required>
              <option value="">Choose farmer</option>
              {farmers.map((farmer) => (
                <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
              ))}
            </select>
            <input placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
            <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="dairy">Dairy</option>
              <option value="spices">Spices</option>
            </select>
            <input type="number" placeholder="Price per kg" value={productForm.price_per_kg} onChange={(e) => setProductForm({ ...productForm, price_per_kg: e.target.value })} required />
            <input type="number" placeholder="Quantity kg" value={productForm.quantity_kg} onChange={(e) => setProductForm({ ...productForm, quantity_kg: e.target.value })} required />
            <input type="date" value={productForm.harvest_date} onChange={(e) => setProductForm({ ...productForm, harvest_date: e.target.value })} required />
            <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
            <button disabled={loading}>Upload Product</button>
          </form>
        </div>

        <div className="panel">
          <div className="section-title">
            <Users size={22} />
            <h2>Customer Module</h2>
          </div>
          <form onSubmit={handleCreateCustomer}>
            <input placeholder="Customer name" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} required />
            <input placeholder="Phone" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} required />
            <textarea placeholder="Delivery address" value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} required />
            <button disabled={loading}>Create Customer</button>
          </form>
        </div>
      </section>

      <section className="market-section" id="market">
        <div className="section-title">
          <ShoppingBasket size={24} />
          <h2>Fresh Products</h2>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <span>{product.category}</span>
              <h3>{product.name}</h3>
              <p>{product.description || "Fresh product listed directly by the farmer."}</p>
              <div className="product-meta">
                <strong>{currency(product.price_per_kg)} / kg</strong>
                <small>{product.quantity_kg} kg available</small>
              </div>
              <div className="farmer-line">
                <Leaf size={16} />
                {product.farmer_name}, {product.farmer_village}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="checkout">
        <div>
          <div className="section-title">
            <IndianRupee size={24} />
            <h2>Order & Payment</h2>
          </div>
          <form onSubmit={handlePlaceOrder} className="order-form">
            <select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)} required>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            <div className="total-box">
              <span>Total</span>
              <strong>{currency(orderTotal)}</strong>
            </div>
            <button disabled={loading || !customers.length || !products.length}>Pay with UPI</button>
          </form>
        </div>
        <div className="orders">
          <div className="section-title">
            <BarChart3 size={22} />
            <h2>Order Tracking</h2>
          </div>
          {orders.slice(0, 6).map((order) => (
            <article key={order.id}>
              <div>
                <strong>{order.product_name}</strong>
                <span>{order.customer_name}</span>
              </div>
              <p>{order.status.replaceAll("_", " ")}</p>
              <small>{currency(order.total_amount)} · {order.payment?.status || "pending"}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
