/**
 * ==========================================================================
 * Aquarium Fish E-Commerce - Admin Dashboard JavaScript
 * Handles authentication checks, mock/REST API data switching, rendering,
 * chart visualization, interactive periods, and UI events.
 * ==========================================================================
 */

// API Configuration & Global Switches
const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true; // Set to false when connecting to Spring Boot backend
const ENABLE_AUTO_REFRESH = false;

// Mock Dashboard Data Repository
const MOCK_DASHBOARD_DATA = {
    stats: {
        totalUsers: 1248,
        totalCustomers: 1180,
        totalSellers: 62,
        totalFish: 342,
        totalCategories: 12,
        totalOrders: 2184,
        totalSales: 7850000,
        pendingOrders: 38,
        completedOrders: 2040,
        pendingPayments: 17,
        pendingDeliveries: 26,
        lowStockProducts: 21,
        outOfStockProducts: 8
    },
    periods: {
        "30d": {
            revenue: 2450000,
            orders: 684,
            avgOrder: 3581,
            salesData: [
                { label: "Day 1", sales: 75000, orders: 22 },
                { label: "Day 5", sales: 92000, orders: 28 },
                { label: "Day 10", sales: 110000, orders: 31 },
                { label: "Day 15", sales: 85000, orders: 24 },
                { label: "Day 20", sales: 140000, orders: 42 },
                { label: "Day 25", sales: 125000, orders: 37 },
                { label: "Day 30", sales: 165000, orders: 48 }
            ]
        },
        "7d": {
            revenue: 685000,
            orders: 192,
            avgOrder: 3567,
            salesData: [
                { label: "Mon", sales: 85000, orders: 24 },
                { label: "Tue", sales: 95000, orders: 27 },
                { label: "Wed", sales: 88000, orders: 25 },
                { label: "Thu", sales: 105000, orders: 30 },
                { label: "Fri", sales: 120000, orders: 34 },
                { label: "Sat", sales: 115000, orders: 32 },
                { label: "Sun", sales: 77000, orders: 20 }
            ]
        },
        "year": {
            revenue: 34500000,
            orders: 9840,
            avgOrder: 3506,
            salesData: [
                { label: "Jan", sales: 2600000, orders: 740 },
                { label: "Feb", sales: 2800000, orders: 810 },
                { label: "Mar", sales: 2950000, orders: 850 },
                { label: "Apr", sales: 3100000, orders: 890 },
                { label: "May", sales: 2750000, orders: 780 },
                { label: "Jun", sales: 3200000, orders: 920 },
                { label: "Jul", sales: 3400000, orders: 970 },
                { label: "Aug", sales: 3300000, orders: 950 },
                { label: "Sep", sales: 2450000, orders: 684 },
                { label: "Oct", sales: 0, orders: 0 },
                { label: "Nov", sales: 0, orders: 0 },
                { label: "Dec", sales: 0, orders: 0 }
            ]
        },
        "today": {
            revenue: 85000,
            orders: 24,
            avgOrder: 3541,
            salesData: [
                { label: "06:00", sales: 5000, orders: 2 },
                { label: "09:00", sales: 18000, orders: 5 },
                { label: "12:00", sales: 25000, orders: 7 },
                { label: "15:00", sales: 22000, orders: 6 },
                { label: "18:00", sales: 15000, orders: 4 }
            ]
        }
    },
    orderStatusCounts: {
        pending: 38,
        processing: 46,
        shipped: 72,
        completed: 2040,
        cancelled: 28
    },
    recentOrders: [
        { id: "ORD-1048", customerName: "Kasun Perera", date: "Sep 11, 2026", amount: 12500, payment: "Paid", delivery: "Processing", status: "PROCESSING" },
        { id: "ORD-1047", customerName: "Nimal Silva", date: "Sep 11, 2026", amount: 8400, payment: "Paid", delivery: "Shipped", status: "SHIPPED" },
        { id: "ORD-1046", customerName: "Ayesha Mendis", date: "Sep 10, 2026", amount: 24000, payment: "Paid", delivery: "Delivered", status: "COMPLETED" },
        { id: "ORD-1045", customerName: "Chaminda Karunarathne", date: "Sep 10, 2026", amount: 4500, payment: "Pending", delivery: "Pending", status: "PENDING" },
        { id: "ORD-1044", customerName: "Priyankara Gunasekara", date: "Sep 09, 2026", amount: 15600, payment: "Paid", delivery: "Delivered", status: "COMPLETED" },
        { id: "ORD-1043", customerName: "Sanduni Perera", date: "Sep 09, 2026", amount: 9200, payment: "Failed", delivery: "Failed", status: "CANCELLED" }
    ],
    recentUsers: [
        { username: "nimal_s", email: "nimal@example.com", role: "CUSTOMER", status: "Active", joined: "Today" },
        { username: "blueocean_shop", email: "support@blueocean.lk", role: "SELLER", status: "Active", joined: "Yesterday" },
        { username: "ayesha_m", email: "ayesha@gmail.com", role: "CUSTOMER", status: "Active", joined: "Sep 09, 2026" },
        { username: "tropical_life", email: "info@tropicallife.lk", role: "SELLER", status: "Active", joined: "Sep 08, 2026" },
        { username: "ravindu_k", email: "ravindu@yahoo.com", role: "CUSTOMER", status: "Inactive", joined: "Sep 05, 2026" }
    ],
    topFish: [
        { name: "Neon Tetra", category: "Tropical", unitsSold: 184, revenue: 644000, image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=100&auto=format&fit=crop" },
        { name: "Guppy Mosaic", category: "Livebearer", unitsSold: 156, revenue: 468000, image: "https://images.unsplash.com/photo-1535591273668-578e3112a443?w=100&auto=format&fit=crop" },
        { name: "Betta Halfmoon", category: "Anabantid", unitsSold: 120, revenue: 720000, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&auto=format&fit=crop" },
        { name: "Angel Fish Marble", category: "Cichlid", unitsSold: 98, revenue: 588000, image: "https://images.unsplash.com/photo-1524704796724-ea48696b0552?w=100&auto=format&fit=crop" }
    ],
    reviewsSummary: {
        averageRating: 4.7,
        totalReviews: 1284,
        breakdown: { 5: 68, 4: 21, 3: 7, 2: 3, 1: 1 }
    },
    notifications: [
        { id: 1, text: "8 new seller listings require your review.", time: "10 mins ago", type: "warning" },
        { id: 2, text: "3 products are currently out of stock.", time: "1 hour ago", type: "danger" },
        { id: 3, text: "17 new customer payments are pending verification.", time: "3 hours ago", type: "info" },
        { id: 4, text: "26 deliveries require logistics attention.", time: "5 hours ago", type: "info" }
    ]
};

// Formatters
const currencyFormatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
});

// Main Initialization
document.addEventListener("DOMContentLoaded", () => {
    checkAuthentication();
    initializeDashboard();
    setupEventListeners();
});

// Authentication Validation (Frontend UX Check + Backend Readiness)
function checkAuthentication() {
    const token = localStorage.getItem("accessToken");
    // TODO: When integrating with Spring Boot backend, ensure token is validated against authorities.
    // NOTE: Frontend security check is strictly for UX. The backend @PreAuthorize("hasRole('ADMIN')") remains authoritative.
    if (!token && USE_MOCK_DATA === false) {
        showToast("Your session has expired. Please log in again.", "error");
        setTimeout(() => {
            window.location.href = "../login.html";
        }, 1500);
    }
}

// Initialize Dashboard
function initializeDashboard() {
    showLoadingStates();

    setTimeout(() => {
        if (USE_MOCK_DATA) {
            loadMockDashboard();
        } else {
            loadDashboardFromApi();
        }
    }, 400); // Simulated network latency for realism
}

// Load Mock Data
function loadMockDashboard() {
    const data = MOCK_DASHBOARD_DATA;
    renderStatistics(data.stats);
    renderSalesOverview("30d");
    renderOrderStatus(data.orderStatusCounts);
    renderRecentOrders(data.recentOrders);
    renderRecentUsers(data.recentUsers);
    renderTopFish(data.topFish);
    renderInventoryAlerts(data.stats);
    renderReviewsOverview(data.reviewsSummary);
    renderNotifications(data.notifications);

    // Toggle Demo Badge visibility
    const demoBadge = document.getElementById("demoBadge");
    if (demoBadge) demoBadge.style.display = "inline-block";
}

// Load Real REST API Data
async function loadDashboardFromApi() {
    // TODO: Replace mock dashboard data with actual REST endpoints.
    // GET /api/admin/dashboard
    try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            showToast("Your session has expired. Please log in again.", "error");
            setTimeout(() => window.location.href = "../login.html", 1500);
            return;
        }

        if (response.status === 403) {
            showToast("You do not have permission to access the admin dashboard.", "error");
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch dashboard summary.");
        }

        const data = await response.json();

        renderStatistics(data.stats);
        renderSalesOverview("30d", data.sales);
        renderOrderStatus(data.orderStatusCounts);
        renderRecentOrders(data.recentOrders);
        renderRecentUsers(data.recentUsers);
        renderTopFish(data.topFish);
        renderInventoryAlerts(data.stats);
        renderReviewsOverview(data.reviewsSummary);
        renderNotifications(data.notifications);

    } catch (error) {
        console.error("API Error:", error);
        showErrorState();
    }
}

// Render Statistics KPIs
function renderStatistics(stats) {
    document.getElementById("kpiTotalUsers").textContent = stats.totalUsers.toLocaleString();
    document.getElementById("kpiTotalCustomers").textContent = stats.totalCustomers.toLocaleString();
    document.getElementById("kpiTotalSellers").textContent = stats.totalSellers.toLocaleString();
    document.getElementById("kpiTotalFish").textContent = stats.totalFish.toLocaleString();
    document.getElementById("kpiTotalOrders").textContent = stats.totalOrders.toLocaleString();
    document.getElementById("kpiTotalSales").textContent = currencyFormatter.format(stats.totalSales);

    document.getElementById("kpiLowStock").textContent = stats.lowStockProducts;
    document.getElementById("kpiOutOfStock").textContent = stats.outOfStockProducts;
    document.getElementById("kpiPendingOrders").textContent = stats.pendingOrders;
    document.getElementById("kpiPendingDeliveries").textContent = stats.pendingDeliveries;
}

// Render Sales Overview & Custom SVG Chart
function renderSalesOverview(periodKey, apiSalesObj = null) {
    let periodData;
    if (USE_MOCK_DATA) {
        periodData = MOCK_DASHBOARD_DATA.periods[periodKey];
    } else {
        periodData = apiSalesObj || MOCK_DASHBOARD_DATA.periods["30d"];
    }

    document.getElementById("summarySalesRevenue").textContent = currencyFormatter.format(periodData.revenue);
    document.getElementById("summarySalesOrders").textContent = periodData.orders.toLocaleString();
    document.getElementById("summaryAvgOrder").textContent = currencyFormatter.format(periodData.avgOrder);

    renderSalesChart(periodData.salesData);
}

// Pure SVG Sales Chart Implementation
function renderSalesChart(dataPoints) {
    const svg = document.getElementById("salesSvgChart");
    const tooltip = document.getElementById("chartTooltip");
    if (!svg) return;

    svg.innerHTML = `
        <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#00ffed" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#0099ff" stop-opacity="0.0"/>
            </linearGradient>
        </defs>
    `;

    if (!dataPoints || dataPoints.length === 0) return;

    const maxSales = Math.max(...dataPoints.map(d => d.sales), 10000);
    const svgWidth = 800;
    const svgHeight = 260;
    const padding = 40;
    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    const points = dataPoints.map((d, index) => {
        const x = padding + (index / (dataPoints.length - 1)) * chartWidth;
        const y = svgHeight - padding - (d.sales / maxSales) * chartHeight;
        return { x, y, ...d };
    });

    // Draw grid lines
    for (let i = 0; i <= 4; i++) {
        const yCoord = padding + (chartHeight / 4) * i;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", padding);
        line.setAttribute("y1", yCoord);
        line.setAttribute("x2", svgWidth - padding);
        line.setAttribute("y2", yCoord);
        line.setAttribute("stroke", "rgba(255, 255, 255, 0.05)");
        line.setAttribute("stroke-width", "1");
        svg.appendChild(line);
    }

    // Build path data
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        pathD += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
    }
    pathD += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;

    // Area path
    const areaPathD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

    const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
    area.setAttribute("d", areaPathD);
    area.setAttribute("fill", "url(#chartGradient)");
    svg.appendChild(area);

    // Line path
    const linePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    linePath.setAttribute("d", pathD);
    linePath.setAttribute("fill", "none");
    linePath.setAttribute("stroke", "#00ffed");
    linePath.setAttribute("stroke-width", "3");
    linePath.setAttribute("filter", "drop-shadow(0 0 6px rgba(0,255,237,0.5))");
    svg.appendChild(linePath);

    // Render data nodes and labels
    points.forEach((pt) => {
        // Circle point
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x);
        circle.setAttribute("cy", pt.y);
        circle.setAttribute("r", "5");
        circle.setAttribute("fill", "#090d16");
        circle.setAttribute("stroke", "#00ffed");
        circle.setAttribute("stroke-width", "2.5");
        circle.style.cursor = "pointer";

        // Tooltip events
        circle.addEventListener("mouseenter", (e) => {
            tooltip.style.display = "block";
            tooltip.innerHTML = `<strong>${escapeHtml(pt.label)}</strong><br>${currencyFormatter.format(pt.sales)}<br><small>${pt.orders} orders</small>`;
            const rect = svg.getBoundingClientRect();
            tooltip.style.left = `${e.clientX - rect.left}px`;
            tooltip.style.top = `${e.clientY - rect.top - 10}px`;
        });
        circle.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });

        svg.appendChild(circle);

        // X-axis label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", pt.x);
        text.setAttribute("y", svgHeight - 12);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#9ca3af");
        text.setAttribute("font-size", "11");
        text.textContent = pt.label;
        svg.appendChild(text);
    });
}

// Render Order Status Breakdown
function renderOrderStatus(statusCounts) {
    const container = document.getElementById("orderStatusContainer");
    if (!container) return;

    const total = Object.values(statusCounts).reduce((a, b) => a + b, 1);

    const statuses = [
        { label: "Pending", key: "pending", color: "#f59e0b" },
        { label: "Processing", key: "processing", color: "#3b82f6" },
        { label: "Shipped", key: "shipped", color: "#8b5cf6" },
        { label: "Completed", key: "completed", color: "#10b981" },
        { label: "Cancelled", key: "cancelled", color: "#ef4444" }
    ];

    container.innerHTML = statuses.map(s => {
        const count = statusCounts[s.key] || 0;
        const pct = Math.round((count / total) * 100);
        return `
            <div class="status-bar-row">
                <div class="status-bar-meta">
                    <span class="status-bar-name">${s.label}</span>
                    <span class="status-bar-count">${count} <small>(${pct}%)</small></span>
                </div>
                <div class="status-bar-track">
                    <div class="status-bar-fill" style="width: ${pct}%; background-color: ${s.color};"></div>
                </div>
            </div>
        `;
    }).join("");
}

// Render Recent Orders Table
function renderRecentOrders(orders) {
    const tbody = document.getElementById("recentOrdersTableBody");
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center">No recent orders found.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(ord => `
        <tr>
            <td><strong>${escapeHtml(ord.id)}</strong></td>
            <td>${escapeHtml(ord.customerName)}</td>
            <td>${escapeHtml(ord.date)}</td>
            <td>${currencyFormatter.format(ord.amount)}</td>
            <td><span class="badge ${ord.payment.toLowerCase()}">${escapeHtml(ord.payment)}</span></td>
            <td><span class="badge ${ord.delivery.toLowerCase()}">${escapeHtml(ord.delivery)}</span></td>
            <td><span class="badge ${ord.status.toLowerCase()}">${escapeHtml(ord.status)}</span></td>
            <td>
                <a href="orders.html?id=${encodeURIComponent(ord.id)}" class="btn-sm btn-outline-cyan">
                    <i class="fa-solid fa-eye"></i> View
                </a>
            </td>
        </tr>
    `).join("");
}

// Render Recent Users Table
function renderRecentUsers(users) {
    const tbody = document.getElementById("recentUsersTableBody");
    if (!tbody) return;

    if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No recent users found.</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(u => {
        const initials = u.username.substring(0, 2).toUpperCase();
        return `
            <tr>
                <td>
                    <div class="user-avatar-initials">
                        <div class="avatar-circle">${initials}</div>
                        <strong>${escapeHtml(u.username)}</strong>
                    </div>
                </td>
                <td>${escapeHtml(u.email)}</td>
                <td><span class="badge ${u.role.toLowerCase()}">${escapeHtml(u.role)}</span></td>
                <td><span class="badge ${u.status.toLowerCase()}">${escapeHtml(u.status)}</span></td>
                <td>${escapeHtml(u.joined)}</td>
            </tr>
        `;
    }).join("");
}

// Render Top Selling Fish
function renderTopFish(fishList) {
    const container = document.getElementById("topFishListContainer");
    if (!container) return;

    if (!fishList || fishList.length === 0) {
        container.innerHTML = `<p class="text-muted">No top fish data available.</p>`;
        return;
    }

    container.innerHTML = fishList.map(fish => `
        <div class="top-fish-item">
            <div class="fish-item-info">
                <img src="${escapeHtml(fish.image)}" alt="${escapeHtml(fish.name)}" class="fish-thumb" onerror="this.src='https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=100&auto=format&fit=crop'">
                <div class="fish-meta">
                    <h4>${escapeHtml(fish.name)}</h4>
                    <span>${escapeHtml(fish.category)}</span>
                </div>
            </div>
            <div class="fish-sales-data">
                <span class="units-sold">${fish.unitsSold} sold</span>
                <span class="revenue-amt">${currencyFormatter.format(fish.revenue)}</span>
            </div>
        </div>
    `).join("");
}

// Render Inventory Alerts Text
function renderInventoryAlerts(stats) {
    const lowText = document.getElementById("lowStockAlertText");
    const outText = document.getElementById("outStockAlertText");
    if (lowText) lowText.textContent = `${stats.lowStockProducts} fish are low in stock`;
    if (outText) outText.textContent = `${stats.outOfStockProducts} fish are completely out of stock`;
}

// Render Reviews Overview
function renderReviewsOverview(reviewData) {
    const avgScore = document.getElementById("avgRatingScore");
    const totalCount = document.getElementById("totalReviewsCount");
    const breakdownContainer = document.getElementById("ratingBreakdownContainer");

    if (avgScore) avgScore.textContent = reviewData.averageRating.toFixed(1);
    if (totalCount) totalCount.textContent = `Based on ${reviewData.totalReviews.toLocaleString()} reviews`;

    if (breakdownContainer) {
        const breakdown = reviewData.breakdown;
        breakdownContainer.innerHTML = [5, 4, 3, 2, 1].map(star => {
            const pct = breakdown[star] || 0;
            return `
                <div class="rating-bar-row">
                    <span class="rating-star-label">${star}★</span>
                    <div class="rating-track">
                        <div class="rating-fill" style="width: ${pct}%;"></div>
                    </div>
                    <span class="rating-percentage">${pct}%</span>
                </div>
            `;
        }).join("");
    }
}

// Render Header Notifications Dropdown
function renderNotifications(notifications) {
    const listContainer = document.getElementById("notificationListContainer");
    const countBadge = document.getElementById("notificationCount");

    if (countBadge) countBadge.textContent = notifications.length;
    if (!listContainer) return;

    if (!notifications || notifications.length === 0) {
        listContainer.innerHTML = `<div class="notification-item">No new notifications.</div>`;
        return;
    }

    listContainer.innerHTML = notifications.map(n => `
        <a href="orders.html" class="notification-item">
            <p>${escapeHtml(n.text)}</p>
            <span class="notification-time">${escapeHtml(n.time)}</span>
        </a>
    `).join("");
}

// Event Listeners Setup
function setupEventListeners() {
    // Period selector buttons
    const periodButtons = document.querySelectorAll(".period-btn");
    periodButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            periodButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            const period = e.target.getAttribute("data-period");
            renderSalesOverview(period);
            showToast(`Dashboard updated for ${e.target.textContent}`, "success");
        });
    });

    // Refresh button
    const refreshBtn = document.getElementById("refreshDashboardBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            refreshDashboard();
        });
    }

    // Mobile Sidebar Toggles
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mobileCloseBtn = document.getElementById("mobileCloseBtn");
    const adminSidebar = document.getElementById("adminSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    if (hamburgerBtn && adminSidebar && sidebarOverlay) {
        hamburgerBtn.addEventListener("click", () => {
            adminSidebar.classList.add("mobile-open");
            sidebarOverlay.classList.add("show");
        });
    }

    if (mobileCloseBtn && adminSidebar && sidebarOverlay) {
        mobileCloseBtn.addEventListener("click", () => {
            adminSidebar.classList.remove("mobile-open");
            sidebarOverlay.classList.remove("show");
        });
    }

    if (sidebarOverlay && adminSidebar) {
        sidebarOverlay.addEventListener("click", () => {
            adminSidebar.classList.remove("mobile-open");
            sidebarOverlay.classList.remove("show");
        });
    }

    // ESC key closes sidebar / dropdowns
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (adminSidebar) adminSidebar.classList.remove("mobile-open");
            if (sidebarOverlay) sidebarOverlay.classList.remove("show");
            document.querySelectorAll(".dropdown-panel").forEach(p => p.classList.remove("show"));
        }
    });

    // Notification dropdown toggle
    const notificationToggleBtn = document.getElementById("notificationToggleBtn");
    const notificationPanel = document.getElementById("notificationPanel");
    if (notificationToggleBtn && notificationPanel) {
        notificationToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            notificationPanel.classList.toggle("show");
            document.getElementById("adminMenuPanel")?.classList.remove("show");
        });
    }

    // Admin profile dropdown toggle
    const adminMenuToggleBtn = document.getElementById("adminMenuToggleBtn");
    const adminMenuPanel = document.getElementById("adminMenuPanel");
    if (adminMenuToggleBtn && adminMenuPanel) {
        adminMenuToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            adminMenuPanel.classList.toggle("show");
            document.getElementById("notificationPanel")?.classList.remove("show");
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown-panel").forEach(p => p.classList.remove("show"));
    });

    // Logout triggers
    const logoutBtn = document.getElementById("logoutBtn");
    const dropdownLogoutBtn = document.getElementById("dropdownLogoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", (e) => { e.preventDefault(); logout(); });
    if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener("click", (e) => { e.preventDefault(); logout(); });

    // Global Admin Search Handler
    const globalSearchInput = document.getElementById("globalAdminSearch");
    if (globalSearchInput) {
        globalSearchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const query = globalSearchInput.value.trim().toLowerCase();
                if (query.includes("user")) window.location.href = "users.html";
                else if (query.includes("fish")) window.location.href = "fish.html";
                else if (query.includes("order")) window.location.href = "orders.html";
                else if (query.includes("payment")) window.location.href = "payments.html";
                else if (query.includes("delivery")) window.location.href = "deliveries.html";
                else if (query.includes("review")) window.location.href = "reviews.html";
                else if (query.includes("category")) window.location.href = "categories.html";
                else showToast(`Navigating to relevant modules for "${query}"`, "success");
            }
        });
    }
}

// Refresh Dashboard Action
function refreshDashboard() {
    showToast("Refreshing dashboard data...", "success");
    initializeDashboard();
}

// Toast Notification Helper
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const iconClass = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Loading States Helper
function showLoadingStates() {
    // Skeletons or subtle opacity transitions can be placed here
}

// Error State Helper
function showErrorState() {
    showToast("Unable to load dashboard data.", "error");
}

// XSS Protection Helper
function escapeHtml(value) {
    if (!value) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Logout Implementation
function logout() {
    // TODO: In production with Spring Boot Security (JWT / HttpOnly cookies),
    // invoke backend POST /api/auth/logout if token revocation is required.
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    showToast("Logged out successfully.", "success");
    setTimeout(() => {
        window.location.href = "../login.html";
    }, 1000);
}