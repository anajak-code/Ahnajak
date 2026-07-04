// ============================================
// ZOOM PREVENTION - រារាំង Zoom ជាដាច់ខាត់
// ============================================
(function() {
  // រារាំង pinch zoom (touch events)
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // រារាំង double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
  
  // រារាំង Ctrl/Cmd + wheel zoom
  document.addEventListener('wheel', function(e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // រារាំង keyboard zoom (Ctrl +/-)
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
      e.preventDefault();
    }
  });
  
  // រារាំង gesture events (iOS Safari)
  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
  });
  
  document.addEventListener('gesturechange', function(e) {
    e.preventDefault();
  });
  
  document.addEventListener('gestureend', function(e) {
    e.preventDefault();
  });
})();

// ============================================
// DATA
// ============================================
let PRODUCTS = JSON.parse(localStorage.getItem('products')) || [
  { id: 1, title: "E-commerce Script", category: "script", price: 49, icon: "fa-shopping-cart", desc: "Script ពេញលេញសម្រាប់ហាងអនឡាញ", vendor: "DevMaster" },
  { id: 2, title: "WordPress SEO Plugin", category: "plugin", price: 29, icon: "fa-plug", desc: "Plugin សម្រាប់បង្កើន SEO", vendor: "PluginPro" },
  { id: 3, title: "Portfolio Template", category: "template", price: 19, icon: "fa-briefcase", desc: "Template ស្អាតសម្រាប់ Portfolio", vendor: "TemplateHub" },
  { id: 4, title: "Admin Dashboard UI", category: "ui", price: 39, icon: "fa-chart-line", desc: "UI Kit សម្រាប់ Admin Dashboard", vendor: "UIDesign" },
  { id: 5, title: "Chat App Script", category: "script", price: 59, icon: "fa-comments", desc: "Real-time chat application", vendor: "DevMaster" },
  { id: 6, title: "Payment Gateway Plugin", category: "plugin", price: 35, icon: "fa-credit-card", desc: "ភ្ជាប់ ABA/Stripe", vendor: "PluginPro" }
];

let ORDERS = JSON.parse(localStorage.getItem('admin_orders')) || [];
let USERS = JSON.parse(localStorage.getItem('users')) || [];

let currentOrderFilter = 'all';

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderHome();
  renderProductsTable();
  renderOrdersTable();
  renderUsersTable();
});

// Sync data from localStorage (user site)
window.addEventListener('storage', (e) => {
  if (e.key === 'products') {
    PRODUCTS = JSON.parse(localStorage.getItem('products')) || PRODUCTS;
    renderProductsTable();
    renderHome();
  }
  if (e.key === 'users') {
    USERS = JSON.parse(localStorage.getItem('users')) || [];
    renderUsersTable();
    renderHome();
  }
});

window.addEventListener('focus', () => {
  loadData();
  renderHome();
  renderProductsTable();
  renderOrdersTable();
  renderUsersTable();
});

function loadData() {
  PRODUCTS = JSON.parse(localStorage.getItem('products')) || PRODUCTS;
  ORDERS = JSON.parse(localStorage.getItem('admin_orders')) || [];
  USERS = JSON.parse(localStorage.getItem('users')) || [];
}

// ============================================
// NAVIGATION
// ============================================
function showSection(sectionId, element) {
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  if (element) element.classList.add('active');
  
  // Show section
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
  
  // Update title
  const titles = {
    home: { title: 'Home', subtitle: 'Dashboard Overview' },
    products: { title: 'Products', subtitle: 'Manage Your Products' },
    orders: { title: 'Orders', subtitle: 'Track Customer Orders' },
    users: { title: 'Users', subtitle: 'Manage Registered Users' }
  };
  
  document.getElementById('pageTitle').textContent = titles[sectionId].title;
  document.getElementById('pageSubtitle').textContent = titles[sectionId].subtitle;
  
  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('active');
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

function refreshData() {
  loadData();
  renderHome();
  renderProductsTable();
  renderOrdersTable();
  renderUsersTable();
  showToast('✅ Data refreshed successfully!');
}

// ============================================
// HOME / DASHBOARD
// ============================================
function renderHome() {
  // Stats
  document.getElementById('statProducts').textContent = PRODUCTS.length;
  document.getElementById('statOrders').textContent = ORDERS.length;
  document.getElementById('statUsers').textContent = USERS.length;
  
  const totalRevenue = ORDERS
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0);
  document.getElementById('statRevenue').textContent = '$' + totalRevenue.toFixed(2);
  
  // Notification count
  const pendingCount = ORDERS.filter(o => o.status === 'pending').length;
  document.getElementById('notifCount').textContent = pendingCount;
  
  // Quick stats
  document.getElementById('paidOrders').textContent = ORDERS.filter(o => o.status === 'paid').length;
  document.getElementById('pendingOrders').textContent = ORDERS.filter(o => o.status === 'pending').length;
  document.getElementById('unpaidOrders').textContent = ORDERS.filter(o => o.status === 'unpaid').length;
  document.getElementById('totalDownloads').textContent = PRODUCTS.reduce((sum, p) => sum + (p.downloads || 0), 0);
  
  // Recent products
  const recentContainer = document.getElementById('recentProducts');
  const recent = PRODUCTS.slice(0, 5);
  
  if (recent.length === 0) {
    recentContainer.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No products yet</p></div>';
  } else {
    recentContainer.innerHTML = recent.map(p => `
      <div class="mini-product-item">
        <div class="mini-product-icon">
          <i class="fas ${p.icon || 'fa-code'}"></i>
        </div>
        <div class="mini-product-info">
          <h4>${p.title}</h4>
          <p>${p.vendor || 'Unknown'}</p>
        </div>
        <div class="mini-product-price">$${p.price}</div>
      </div>
    `).join('');
  }
}

// ============================================
// PRODUCTS
// ============================================
function renderProductsTable(products = null) {
  const allProducts = products || PRODUCTS;
  const tbody = document.getElementById('productsTableBody');
  
  if (allProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><i class="fas fa-box-open"></i><p>No products found</p></div></td></tr>';
    return;
  }
  
  tbody.innerHTML = allProducts.map(p => `
    <tr>
      <td><strong>#${p.id}</strong></td>
      <td><span class="product-icon-cell"><i class="fas ${p.icon || 'fa-code'}"></i></span></td>
      <td><strong>${p.title}</strong><br><small style="color:var(--text-muted)">${p.desc ? p.desc.substring(0, 40) + '...' : ''}</small></td>
      <td><span class="category-badge ${p.category}">${p.category}</span></td>
      <td><strong style="color:var(--success)">$${p.price}</strong></td>
      <td>${p.vendor || '-'}</td>
      <td>${p.downloads || 0}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action edit" onclick="editProduct(${p.id})" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action delete" onclick="deleteProduct(${p.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function searchProducts() {
  const query = document.getElementById('productSearch').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  
  let filtered = PRODUCTS.filter(p => 
    p.title.toLowerCase().includes(query) ||
    (p.vendor && p.vendor.toLowerCase().includes(query)) ||
    (p.desc && p.desc.toLowerCase().includes(query))
  );
  
  if (category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }
  
  renderProductsTable(filtered);
}

function filterProducts() {
  searchProducts();
}

function openProductModal() {
  document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('pIcon').value = 'fa-code';
  document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
}

function editProduct(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  
  document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Product';
  document.getElementById('productId').value = product.id;
  document.getElementById('pTitle').value = product.title;
  document.getElementById('pCategory').value = product.category;
  document.getElementById('pPrice').value = product.price;
  document.getElementById('pVendor').value = product.vendor || '';
  document.getElementById('pDesc').value = product.desc || '';
  document.getElementById('pIcon').value = product.icon || 'fa-code';
  
  document.getElementById('productModal').classList.add('active');
}

function saveProduct(e) {
  e.preventDefault();
  
  const id = document.getElementById('productId').value;
  const productData = {
    title: document.getElementById('pTitle').value.trim(),
    category: document.getElementById('pCategory').value,
    price: parseFloat(document.getElementById('pPrice').value),
    vendor: document.getElementById('pVendor').value.trim(),
    desc: document.getElementById('pDesc').value.trim(),
    icon: document.getElementById('pIcon').value.trim() || 'fa-code'
  };
  
  if (id) {
    // Update
    const index = PRODUCTS.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      PRODUCTS[index] = { ...PRODUCTS[index], ...productData };
      showToast('✅ Product updated successfully!');
    }
  } else {
    // Create
    const newProduct = {
      id: Date.now(),
      ...productData,
      downloads: 0
    };
    PRODUCTS.push(newProduct);
    showToast('✅ Product added successfully!');
  }
  
  localStorage.setItem('products', JSON.stringify(PRODUCTS));
  closeProductModal();
  renderProductsTable();
  renderHome();
}

function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  PRODUCTS = PRODUCTS.filter(p => p.id !== id);
  localStorage.setItem('products', JSON.stringify(PRODUCTS));
  renderProductsTable();
  renderHome();
  showToast('🗑️ Product deleted!');
}

// ============================================
// ORDERS
// ============================================
function renderOrdersTable(filter = currentOrderFilter) {
  let filtered = ORDERS;
  
  if (filter !== 'all') {
    filtered = ORDERS.filter(o => o.status === filter);
  }
  
  // Update order stats
  document.getElementById('allOrdersCount').textContent = ORDERS.length;
  document.getElementById('paidCount').textContent = ORDERS.filter(o => o.status === 'paid').length;
  document.getElementById('pendingCount').textContent = ORDERS.filter(o => o.status === 'pending').length;
  document.getElementById('unpaidCount').textContent = ORDERS.filter(o => o.status === 'unpaid').length;
  
  const tbody = document.getElementById('ordersTableBody');
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No orders found</p></div></td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="user-avatar">${(o.customer || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <strong>${o.customer || 'Unknown'}</strong><br>
            <small style="color:var(--text-muted)">${o.email || '-'}</small>
          </div>
        </div>
      </td>
      <td>${o.product || '-'}</td>
      <td><strong style="color:var(--success)">$${(o.amount || 0).toFixed(2)}</strong></td>
      <td>${o.date || '-'}</td>
      <td>
        <span class="status-badge ${o.status}">
          <i class="fas ${o.status === 'paid' ? 'fa-check-circle' : o.status === 'pending' ? 'fa-clock' : 'fa-times-circle'}"></i>
          ${o.status}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-action view" onclick="viewOrder('${o.id}')" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-action delete" onclick="deleteOrder('${o.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterOrders(status) {
  currentOrderFilter = status;
  
  // Update active card
  document.querySelectorAll('.order-stat-card').forEach(card => {
    card.classList.remove('active');
  });
  event.currentTarget.classList.add('active');
  
  renderOrdersTable(status);
}

function viewOrder(orderId) {
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) return;
  
  document.getElementById('orderDetails').innerHTML = `
    <div class="order-detail-row">
      <span class="label">Order ID</span>
      <span class="value">${order.id}</span>
    </div>
    <div class="order-detail-row">
      <span class="label">Customer</span>
      <span class="value">${order.customer || 'Unknown'}</span>
    </div>
    <div class="order-detail-row">
      <span class="label">Email</span>
      <span class="value">${order.email || '-'}</span>
    </div>
    <div class="order-detail-row">
      <span class="label">Product</span>
      <span class="value">${order.product || '-'}</span>
    </div>
    <div class="order-detail-row">
      <span class="label">Amount</span>
      <span class="value" style="color:var(--success)">$${(order.amount || 0).toFixed(2)}</span>
    </div>
    <div class="order-detail-row">
      <span class="label">Date</span>
      <span class="value">${order.date || '-'}</span>
    </div>
    <div class="order-detail-row">
      <span class="label">Status</span>
      <span class="value">
        <span class="status-badge ${order.status}">
          <i class="fas ${order.status === 'paid' ? 'fa-check-circle' : order.status === 'pending' ? 'fa-clock' : 'fa-times-circle'}"></i>
          ${order.status}
        </span>
      </span>
    </div>
  `;
  
  document.getElementById('orderModal').classList.add('active');
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('active');
}

function deleteOrder(orderId) {
  if (!confirm('Are you sure you want to delete this order?')) return;
  
  ORDERS = ORDERS.filter(o => o.id !== orderId);
  localStorage.setItem('admin_orders', JSON.stringify(ORDERS));
  renderOrdersTable();
  renderHome();
  showToast('🗑️ Order deleted!');
}

// ============================================
// USERS
// ============================================
function renderUsersTable(users = null) {
  const allUsers = users || USERS;
  const tbody = document.getElementById('usersTableBody');
  
  if (allUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-users"></i><p>No users found</p></div></td></tr>';
    return;
  }
  
  tbody.innerHTML = allUsers.map(u => `
    <tr>
      <td><strong>#${u.id}</strong></td>
      <td>
        <div class="user-avatar">${(u.name || 'U').charAt(0).toUpperCase()}</div>
      </td>
      <td><strong>${u.name || '-'}</strong></td>
      <td>${u.email || '-'}</td>
      <td>${u.phone || '-'}</td>
      <td><strong style="color:var(--primary)">${(u.purchases || []).length}</strong></td>
      <td>${u.joined || new Date().toLocaleDateString()}</td>
    </tr>
  `).join('');
}

function searchUsers() {
  const query = document.getElementById('userSearch').value.toLowerCase();
  const filtered = USERS.filter(u => 
    (u.name && u.name.toLowerCase().includes(query)) ||
    (u.email && u.email.toLowerCase().includes(query)) ||
    (u.phone && u.phone.includes(query))
  );
  renderUsersTable(filtered);
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show' + (type === 'error' ? ' error' : type === 'warning' ? ' warning' : '');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Close modals when clicking outside
document.getElementById('productModal').addEventListener('click', (e) => {
  if (e.target.id === 'productModal') closeProductModal();
});

document.getElementById('orderModal').addEventListener('click', (e) => {
  if (e.target.id === 'orderModal') closeOrderModal();
});
