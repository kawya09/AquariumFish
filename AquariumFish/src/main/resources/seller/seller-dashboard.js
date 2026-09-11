/**
 * Aquarium Fish - Seller Dashboard JavaScript
 * Logic for Authenticated Seller Dashboard, Analytics Charting, Stock Alerts, and API Interoperability.
 */

// Global Configuration
const API_BASE_URL = 'http://localhost:8080/api';
const USE_MOCK_DATA = true; // Toggle to false when connecting to Spring Boot REST Backend
const DASHBOARD_REFRESH_INTERVAL = 60000; // 1 minute auto-refresh interval when live
const LOW_STOCK_THRESHOLD = 5;

// Dashboard Global State Data
let currentDashboardData = null;
let currentOrdersList = [];

// DEMO DATA ONLY - Used when USE_MOCK_DATA is set to true
const MOCK_SELLER_DASHBOARD_DATA = {
    "seller": {
        "id": 7,
        "shopName": "Ocean Aquatics",
        "phone": "0712345678",
        "address": "Colombo, Sri Lanka",
        "user": {
            "username": "oceanaquatics",
            "email": "seller@oceanaquatics.lk",
            "status": "ACTIVE"
        }
    },
    "statistics": {
        "totalFish": 42,
        "activeListings": 38,
        "totalOrders": 125,
        "pendingOrders": 7,
        "totalSales": 485000.00,
        "lowStockCount": 5
    },
    "salesOverview": [
        { "date": "2026-08-01", "sales": 12500.00, "orders": 3 },
        { "date": "2026-08-05", "sales": 18400.00, "orders": 5 },
        { "date": "2026-08-10", "sales": 15200.00, "orders": 4 },
        { "date": "2026-08-15", "sales": 24000.00, "orders": 6 },
        { "date": "2026-08-20", "sales": 31000.00, "orders": 8 },
        { "date": "2026-08-25", "sales": 28500.00, "orders": 7 },
        { "date": "2026-08-30", "sales": 42000.00, "orders": 10 }
    ],
    "performance": {
        "averageRating": 4.8,
        "fulfillmentRate": 98,
        "completedOrders": 118,
        "reviewCount": 126
    },
    "recentOrders": [
        {
            "id": 1025,
            "orderDate": "2026-08-12T10:30:00",
            "orderStatus": "DELIVERED",
            "sellerAmount": 5000.00,
            "customerName": "John P.",
            "items": [
                { "fishName": "Betta Fish", "quantity": 2, "unitPrice": 2500.00 }
            ]
        },
        {
            "id": 1024,
            "orderDate": "2026-08-11T14:15:00",
            "orderStatus": "PENDING",
            "sellerAmount": 3600.00,
            "customerName": "Kamal S.",
            "items": [
                { "fishName": "Neon Tetra", "quantity": 12, "unitPrice": 300.00 }
            ]
        },
        {
            "id": 1022,
            "orderDate": "2026-08-09T09:00:00",
            "orderStatus": "PROCESSING",
            "sellerAmount": 12000.00,
            "customerName": "Nimali R.",
            "items": [
                { "fishName": "Discus Fish", "quantity": 2, "unitPrice": 6000.00 }
            ]
        }
    ],
    "topSellingFish": [
        {
            "fishId": 15,
            "fishName": "Betta Fish (Halfmoon)",
            "category": "Freshwater",
            "quantitySold": 42,
            "revenue": 105000.00,
            "stockQty": 8,
            "imageUrl": "assets/images/betta.jpg"
        },
        {
            "fishId": 18,
            "fishName": "Neon Tetra",
            "category": "Tetra",
            "quantitySold": 150,
            "revenue": 45000.00,
            "stockQty": 2,
            "imageUrl": "assets/images/neon-tetra.jpg"
        }
    ],
    "lowStockFish": [
        {
            "fishId": 22,
            "fishName": "Neon Tetra",
            "stockQty": 2,
            "imageUrl": "assets/images/neon-tetra.jpg"
        },
        {
            "fishId": 24,
            "fishName": "Red Cap Oranda Goldfish",
            "stockQty": 3,
            "imageUrl": "assets/images/goldfish.jpg"
        }
    ],
    "outOfStockFish": [
        {
            "fishId": 29,
            "fishName": "Blue Diamond Discus",
            "stockQty": 0,
            "imageUrl": "assets/images/discus.jpg"
        }
    ],
    "notifications": [
        { "id": 1, "title": "New Order Received", "message": "Order #1024 requires confirmation.", "time": "10 mins ago", "read": false },
        { "id": 2, "title": "Low Stock Warning", "message": "Neon Tetra stock is down to 2.", "time": "1 hour ago", "read": false },
        { "id": 3, "title": "Order Delivered", "message": "Order #1025 delivered successfully.", "time": "Yesterday", "read": true }
    ]
};

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    checkSellerRole();
    initializeSidebar();
    initializeHeaderControls();
    initializeDashboard();
    initializeLogoutModal();
    initializeFiltersAndSearch();
});

/* ==========================================================================
   1. Authentication & Role Authorization Logic
   ========================================================================== */

function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token && !USE_MOCK_DATA) {
        window.location.href = '../login.html?redirect=seller/seller-dashboard.html';
    }
}

function checkSellerRole() {
    const role = localStorage.getItem('role');

    // DEMO Bypass if in mock mode and no role is set yet
    if (USE_MOCK_DATA && !role) {
        localStorage.setItem('role', 'SELLER');
        return;
    }

    if (role !== 'SELLER') {
        if (role === 'CUSTOMER') {
            window.location.href = '../index.html';
        } else if (role === 'ADMIN') {
            window.location.href = '../admin/admin-dashboard.html';
        } else {
            window.location.href = '../login.html';
        }
    }
}

/* ==========================================================================
   2. API Data Fetching Logic
   ========================================================================== */

async function initializeDashboard() {
    showLoadingState();
    setCurrentDateDisplay();

    try {
        if (USE_MOCK_DATA) {
            // Simulate API Network Delay
            await new Promise(resolve => setTimeout(resolve, 600));
            currentDashboardData = MOCK_SELLER_DASHBOARD_DATA;
        } else {
            currentDashboardData = await fetchSellerDashboardFromAPI();
        }

        renderDashboard(currentDashboardData);
        showMainContentState();
    } catch (error) {
        console.error('Error loading seller dashboard:', error);
        showErrorState(error.message || 'Failed to load seller dashboard data.');
    }
}

async function fetchSellerDashboardFromAPI() {
    // TODO: Replace with actual Spring Boot seller dashboard REST endpoint.
    // TODO: Backend must calculate seller-specific revenue and strictly enforce seller authorization.
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/sellers/me/dashboard`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = '../login.html?redirect=seller/seller-dashboard.html';
        throw new Error('Session expired. Please login again.');
    }

    if (response.status === 403) {
        throw new Error('Access denied. Seller account required.');
    }

    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
}

/* ==========================================================================
   3. Dashboard Renderers
   ========================================================================== */

function renderDashboard(data) {
    if (!data) return;

    // Render Components
    renderSellerProfile(data.seller);
    renderStatistics(data.statistics);
    renderSalesOverview(data.salesOverview || []);
    renderPerformance(data.performance);

    currentOrdersList = data.recentOrders || [];
    renderRecentOrders(currentOrdersList);

    renderTopSellingFish(data.topSellingFish || []);
    renderStockAlerts(data.lowStockFish || [], data.outOfStockFish || []);
    renderNotifications(data.notifications || []);
}

function renderSellerProfile(seller) {
    if (!seller) return;

    const shopName = seller.shopName || 'Ocean Aquatics';
    const email = seller.user?.email || 'seller@example.com';
    const username = seller.user?.username || 'seller';
    const initials = getInitials(shopName);

    // Sidebar & Header Profile Details
    document.getElementById('sidebarShopName').textContent = shopName;
    document.getElementById('sidebarShopAvatar').textContent = initials;
    document.getElementById('headerShopName').textContent = shopName;
    document.getElementById('headerUserAvatar').textContent = initials;
    document.getElementById('dropdownUsername').textContent = `@${username}`;

    // Welcome Banner & Compact Card
    document.getElementById('bannerShopName').textContent = shopName;
    document.getElementById('cardShopName').textContent = shopName;
    document.getElementById('cardShopAvatar').textContent = initials;
    document.getElementById('cardShopPhone').textContent = `Phone: ${seller.phone || 'N/A'}`;
    document.getElementById('cardShopAddress').textContent = `Address: ${seller.address || 'N/A'}`;
    document.getElementById('cardShopEmail').textContent = `Email: ${email}`;
}

function renderStatistics(stats) {
    if (!stats) return;

    document.getElementById('statTotalFish').textContent = stats.totalFish ?? 0;
    document.getElementById('statActiveFish').textContent = `${stats.activeListings ?? 0} Active Listings`;
    document.getElementById('statTotalOrders').textContent = stats.totalOrders ?? 0;

    const pendingOrdersEl = document.getElementById('statPendingOrders');
    pendingOrdersEl.textContent = `${stats.pendingOrders ?? 0} Pending Attention`;

    if (stats.pendingOrders > 0) {
        const orderBadge = document.getElementById('sidebarOrderBadge');
        orderBadge.textContent = stats.pendingOrders;
        orderBadge.style.display = 'inline-block';
    }

    // Revenue formatted strictly using LKR currency helper
    document.getElementById('statTotalSales').textContent = formatCurrency(stats.totalSales ?? 0);
    document.getElementById('statLowStock').textContent = stats.lowStockCount ?? 0;
}

function renderSalesOverview(salesData) {
    if (!salesData || salesData.length === 0) return;

    let periodTotal = 0;
    let periodOrders = 0;

    salesData.forEach(item => {
        periodTotal += item.sales || 0;
        periodOrders += item.orders || 0;
    });

    const avgOrderVal = periodOrders > 0 ? (periodTotal / periodOrders) : 0;

    document.getElementById('summaryPeriodSales').textContent = formatCurrency(periodTotal);
    document.getElementById('summaryPeriodOrders').textContent = periodOrders;
    document.getElementById('summaryAvgOrder').textContent = formatCurrency(avgOrderVal);

    // Render Interactive SVG Sales Chart
    renderSalesChart(salesData);
}

function renderSalesChart(data) {
    const svg = document.getElementById('salesChartSvg');
    if (!svg) return;

    svg.innerHTML = ''; // Clear Previous Render

    const width = 600;
    const height = 220;
    const padding = 30;

    const maxSales = Math.max(...data.map(d => d.sales), 1000);
    const stepX = (width - padding * 2) / (data.length - 1 || 1);

    let points = '';
    let pointsArray = [];

    data.forEach((item, index) => {
        const x = padding + index * stepX;
        const y = height - padding - ((item.sales / maxSales) * (height - padding * 2));
        points += `${x},${y} `;
        pointsArray.push({ x, y, data: item });
    });

    // Draw Chart Background Gradient & Path
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#0284c7');
    polyline.setAttribute('stroke-width', '3');
    polyline.setAttribute('points', points.trim());

    svg.appendChild(polyline);

    // Draw Interactive Data Circles
    pointsArray.forEach(pt => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x);
        circle.setAttribute('cy', pt.y);
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', '#06b6d4');
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '2');
        circle.style.cursor = 'pointer';

        // Tooltip Event Handlers
        circle.addEventListener('mouseenter', (e) => {
            showChartTooltip(e, pt.data);
        });
        circle.addEventListener('mouseleave', hideChartTooltip);

        svg.appendChild(circle);
    });
}

function showChartTooltip(e, item) {
    const tooltip = document.getElementById('chartTooltip');
    tooltip.innerHTML = `<strong>${item.date}</strong><br/>Sales: ${formatCurrency(item.sales)}`;
    tooltip.style.display = 'block';
    tooltip.style.left = `${e.offsetX + 10}px`;
    tooltip.style.top = `${e.offsetY - 30}px`;
}

function hideChartTooltip() {
    document.getElementById('chartTooltip').style.display = 'none';
}

function renderPerformance(perf) {
    if (!perf) return;

    document.getElementById('perfAverageRating').textContent = perf.averageRating || '5.0';
    document.getElementById('perfFulfillmentRate').textContent = `${perf.fulfillmentRate || 100}%`;
    document.getElementById('perfFulfillmentBar').style.width = `${perf.fulfillmentRate || 100}%`;
    document.getElementById('perfCompletedOrders').textContent = perf.completedOrders || 0;
    document.getElementById('perfReviewCount').textContent = perf.reviewCount || 0;
}

function renderRecentOrders(orders) {
    const container = document.getElementById('recentOrdersContainer');

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-boxes-packing empty-icon"></i>
                <h4>No Incoming Orders Yet</h4>
                <p>Orders containing your fish will appear here automatically.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="table-wrapper">
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Fish Item(s)</th>
                        <th>Seller Revenue</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
    `;

    orders.forEach(order => {
        const itemNames = order.items ? order.items.map(i => `${i.fishName} (x${i.quantity})`).join(', ') : 'Fish Items';
        const statusClass = getOrderStatusClass(order.orderStatus);

        html += `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${formatDate(order.orderDate)}</td>
                <td>${order.customerName || 'Customer'}</td>
                <td>${itemNames}</td>
                <td><strong>${formatCurrency(order.sellerAmount)}</strong></td>
                <td><span class="status-badge ${statusClass}">${formatOrderStatus(order.orderStatus)}</span></td>
                <td><a href="seller-orders.html?id=${order.id}" class="btn btn-outline-primary btn-sm">Manage</a></td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

function renderTopSellingFish(topFish) {
    const container = document.getElementById('topSellingContainer');

    if (!topFish || topFish.length === 0) {
        container.innerHTML = `<p class="empty-state-text">No sales data recorded yet.</p>`;
        return;
    }

    let html = '';
    topFish.forEach(fish => {
        html += `
            <div class="fish-item-card">
                <img src="${fish.imageUrl || '../assets/images/fish-placeholder.jpg'}" alt="${fish.fishName}" class="fish-img-thumb" onerror="this.src='../assets/images/fish-placeholder.jpg'">
                <div class="fish-item-info">
                    <h4>${fish.fishName}</h4>
                    <p>Sold: ${fish.quantitySold} units | Stock: ${fish.stockQty}</p>
                </div>
                <strong>${formatCurrency(fish.revenue)}</strong>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderStockAlerts(lowStock, outOfStock) {
    const lowContainer = document.getElementById('lowStockContainer');
    const outContainer = document.getElementById('outOfStockContainer');

    if (!lowStock || lowStock.length === 0) {
        lowContainer.innerHTML = `<p class="empty-state-text text-success"><i class="fa-solid fa-circle-check"></i> Stock level good.</p>`;
    } else {
        let html = '';
        lowStock.forEach(fish => {
            html += `
                <div class="fish-item-card">
                    <div class="fish-item-info">
                        <h4>${fish.fishName}</h4>
                        <p class="text-amber">Only ${fish.stockQty} left in tank</p>
                    </div>
                    <a href="seller-stock.html?fishId=${fish.fishId}" class="btn btn-secondary btn-sm">Update</a>
                </div>
            `;
        });
        lowContainer.innerHTML = html;
    }

    if (!outOfStock || outOfStock.length === 0) {
        outContainer.innerHTML = `<p class="empty-state-text text-muted">No items out of stock.</p>`;
    } else {
        let html = '';
        outOfStock.forEach(fish => {
            html += `
                <div class="fish-item-card">
                    <div class="fish-item-info">
                        <h4>${fish.fishName}</h4>
                        <p class="text-danger">Out of stock</p>
                    </div>
                    <a href="seller-stock.html?fishId=${fish.fishId}" class="btn btn-secondary btn-sm">Restock</a>
                </div>
            `;
        });
        outContainer.innerHTML = html;
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById('notificationListContainer');
    const badge = document.getElementById('notificationBadge');

    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }

    if (!notifications || notifications.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>No notifications.</p></div>`;
        return;
    }

    let html = '';
    notifications.forEach(n => {
        html += `
            <div class="notification-item ${n.read ? '' : 'unread'}">
                <i class="fa-solid fa-bell text-primary"></i>
                <div>
                    <strong>${n.title}</strong>
                    <p>${n.message}</p>
                    <small class="text-muted">${n.time}</small>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/* ==========================================================================
   4. Search and Filter Handlers
   ========================================================================== */

function initializeFiltersAndSearch() {
    const searchInput = document.getElementById('orderSearchInput');
    const statusFilter = document.getElementById('orderStatusFilter');
    const salesFilter = document.getElementById('salesPeriodFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterOrders);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
    }

    if (salesFilter) {
        salesFilter.addEventListener('change', (e) => {
            // TODO: In production, trigger GET /api/seller/dashboard?period=${e.target.value}
            showToast('Info', `Updated filter for period: ${e.target.value}`);
        });
    }
}

function filterOrders() {
    const query = document.getElementById('orderSearchInput').value.toLowerCase();
    const status = document.getElementById('orderStatusFilter').value;

    const filtered = currentOrdersList.filter(order => {
        const matchesQuery = order.id.toString().includes(query) ||
            order.items.some(i => i.fishName.toLowerCase().includes(query));

        const matchesStatus = (status === 'ALL') || (order.orderStatus === status);

        return matchesQuery && matchesStatus;
    });

    renderRecentOrders(filtered);
}

/* ==========================================================================
   5. UI Controls, Sidebar Toggle & Modals
   ========================================================================== */

function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const closeBtn = document.getElementById('sidebarCloseBtn');
    const overlay = document.getElementById('sidebarOverlay');

    const openSidebar = () => {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    };

    if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
}

function initializeHeaderControls() {
    const notifBtn = document.getElementById('notificationMenuBtn');
    const notifDropdown = document.getElementById('notificationDropdown');
    const userBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const refreshBtn = document.getElementById('refreshDashboardBtn');

    if (notifBtn) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.remove('show');
            notifDropdown.classList.toggle('show');
        });
    }

    if (userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.remove('show');
            userDropdown.classList.toggle('show');
        });
    }

    document.addEventListener('click', () => {
        if (notifDropdown) notifDropdown.classList.remove('show');
        if (userDropdown) userDropdown.classList.remove('show');
    });

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            initializeDashboard();
            showToast('Success', 'Dashboard refreshed');
        });
    }
}

function initializeLogoutModal() {
    const logoutModal = document.getElementById('logoutModal');
    const openBtn = document.getElementById('openLogoutBtn');
    const dropdownLogout = document.getElementById('dropdownLogoutBtn');
    const closeBtn = document.getElementById('closeLogoutModalBtn');
    const cancelBtn = document.getElementById('cancelLogoutBtn');
    const confirmBtn = document.getElementById('confirmLogoutBtn');

    const openModal = () => logoutModal.classList.add('show');
    const closeModal = () => logoutModal.classList.remove('show');

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (dropdownLogout) dropdownLogout.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    confirmBtn.addEventListener('click', logout);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    showToast('Success', 'Logged out successfully');
    setTimeout(() => {
        window.location.href = '../login.html';
    }, 500);
}

/* ==========================================================================
   6. Helper & Formatting Functions
   ========================================================================== */

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(amount || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatOrderStatus(status) {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function getOrderStatusClass(status) {
    switch (status) {
        case 'PENDING': return 'status-pending';
        case 'CONFIRMED': return 'status-confirmed';
        case 'PROCESSING': return 'status-processing';
        case 'SHIPPED': return 'status-shipped';
        case 'DELIVERED':
        case 'COMPLETED': return 'status-delivered';
        case 'CANCELLED': return 'status-cancelled';
        default: return 'status-pending';
    }
}

function getInitials(name) {
    if (!name) return 'SP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function setCurrentDateDisplay() {
    const el = document.getElementById('currentDateDisplay');
    if (el) {
        const today = new Date();
        el.textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type.toLowerCase()}`;

    let icon = type === 'Success' ? 'fa-circle-check' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoadingState() {
    document.getElementById('dashboardSkeleton').style.display = 'block';
    document.getElementById('dashboardMainContent').style.display = 'none';
    document.getElementById('dashboardError').style.display = 'none';
}

function showMainContentState() {
    document.getElementById('dashboardSkeleton').style.display = 'none';
    document.getElementById('dashboardMainContent').style.display = 'block';
    document.getElementById('dashboardError').style.display = 'none';
}

function showErrorState(msg) {
    document.getElementById('dashboardSkeleton').style.display = 'none';
    document.getElementById('dashboardMainContent').style.display = 'none';
    const errPanel = document.getElementById('dashboardError');
    document.getElementById('errorMessage').textContent = msg;
    errPanel.style.display = 'block';

    document.getElementById('retryFetchBtn').onclick = () => initializeDashboard();
}