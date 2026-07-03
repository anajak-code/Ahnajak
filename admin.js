// Password
const ADMIN_PASSWORD = 'admin147369ahnajakcode';

// Check if already logged in
if (localStorage.getItem('adminLoggedIn') === 'true') {
    showDashboard();
}

// Login Form
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
        showToast('✅ Login successful!');
    } else {
        showToast('❌ Wrong password!', 'error');
    }
});

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    loadAllData();
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    location.reload();
}

// Navigation
function showSection(section) {
    // Update menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Show section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(section + '-section').classList.add('active');
    
    // Load data
    if (section === 'products') loadProducts();
    if (section === 'orders') loadOrders();
    if (section === 'users') loadUsers();
    if (section === 'analytics') loadAnalytics();
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.querySelector('.sidebar').classList.remove('active');
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// Load All Data
function loadAllData() {
    loadProducts();
    loadOrders();
    loadUsers();
    loadAnalytics();
}

// PRODUCTS
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.getElementById('productsTableBody');
    
    document.getElementById('totalProducts').textContent = products.length;
    
    const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
    document.getElementById('totalValue').textContent = '$' + totalValue.toLocaleString();
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">No products yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(p => `
        <tr>
            <td><span class="product-icon"><i class="fas ${p.icon || 'fa-code'}"></i></span></td>
            <td><strong>${p.title}</strong></td>
            <td><span class="category-badge">${p.category}</span></td>
            <td><strong>$${p.price}</strong></td>
            <td>${p.vendor}</td>
            <td>${p.downloads || 0}</td>
            <td>
                <button class="btn-edit" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ORDERS
function loadOrders() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const orders = [];
    
    users.forEach(user => {
        const purchases = user.purchases || [];
        purchases.forEach(p => {
            orders.push({
                id: 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                customer: user.name,
                email: user.email,
                product: p.title,
                amount: p.price,
                date: new Date().toLocaleDateString(),
                status: 'completed'
            });
        });
    });
    
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('ordersBadge').textContent = orders.length;
    
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toLocaleString();
    
    const tbody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No orders yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customer}<br><small style="color:var(--text-muted)">${o.email}</small></td>
            <td>${o.product}</td>
            <td><strong>$${o.amount}</strong></td>
            <td>${o.date}</td>
            <td><span class="status-badge completed">${o.status}</span></td>
        </tr>
    `).join('');
}

// USERS
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    document.getElementById('totalUsers').textContent = users.length;
    
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">No users yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(u => `
        <tr>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td><span class="category-badge">${u.role || 'user'}</span></td>
            <td>${(u.purchases || []).length}</td>
            <td>${new Date().toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// ANALYTICS
function loadAnalytics() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const totalDownloads = products.reduce((sum, p) => sum + (p.downloads || 0), 0);
    document.getElementById('totalDownloads').textContent = totalDownloads;
}

// Product Modal
const modal = document.getElementById('productModal');

function openProductModal() {
    document.getElementById('productForm').reset();
    document.getElementById('edit-id').value = '';
    modal.classList.add('active');
}

function closeProductModal() {
    modal.classList.remove('active');
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === id);
    
    if (product) {
        document.getElementById('edit-id').value = product.id;
        document.getElementById('p-title').value = product.title;
        document.getElementById('p-category').value = product.category;
        document.getElementById('p-price').value = product.price;
        document.getElementById('p-vendor').value = product.vendor;
        document.getElementById('p-desc').value = product.desc;
        document.getElementById('p-icon').value = product.icon || 'fa-code';
        modal.classList.add('active');
    }
}

document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    const productData = {
        id: id ? parseInt(id) : Date.now(),
        title: document.getElementById('p-title').value.trim(),
        category: document.getElementById('p-category').value,
        price: parseFloat(document.getElementById('p-price').value),
        vendor: document.getElementById('p-vendor').value.trim(),
        desc: document.getElementById('p-desc').value.trim(),
        icon: document.getElementById('p-icon').value.trim() || 'fa-code',
        downloads: id ? products.find(p => p.id === parseInt(id))?.downloads || 0 : 0
    };
    
    if (id) {
        const index = products.findIndex(p => p.id === parseInt(id));
        products[index] = productData;
    } else {
        products.push(productData);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    closeProductModal();
    loadProducts();
    showToast(id ? '✅ Product updated!' : '✅ Product added!');
});

function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
    showToast('🗑️ Product deleted!');
}

// Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show' + (type === 'error' ? ' error' : '');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeProductModal();
    }
});
