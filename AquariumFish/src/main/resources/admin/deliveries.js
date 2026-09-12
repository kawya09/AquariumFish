/**
 * Aquarium Fish E-Commerce - Customer Deliveries Management Script
 * Frontend built with Vanilla JS for Spring Boot + JPA integration.
 */

const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true; // Set USE_MOCK_DATA = false when the Spring Boot REST API is ready.
const PAGE_SIZE = 10;

// State management
let allDeliveries = [];
let filteredDeliveries = [];
let currentPage = 1;

// Mock Delivery Data DTOs matching backend JPA projection recommendations
const MOCK_DELIVERIES = [
    {
        id: 501,
        deliveryStatus: "OUT_FOR_DELIVERY",
        deliveryDate: "2026-09-12",
        trackingNo: "AQTRK938475",
        deliveryAddress: "No. 25, Main Street, Colombo, Sri Lanka",
        order: {
            id: 125,
            orderDate: "2026-09-08",
            orderStatus: "SHIPPED",
            items: [
                { id: 1, quantity: 2, fish: { id: 15, fishName: "Blue Betta", imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=100" } },
                { id: 2, quantity: 5, fish: { id: 18, fishName: "Neon Tetra", imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=100" } }
            ]
        }
    },
    {
        id: 502,
        deliveryStatus: "DELIVERED",
        deliveryDate: "2026-09-05",
        trackingNo: "AQTRK728194",
        deliveryAddress: "No. 14/B, Lake Road, Gampaha, Sri Lanka",
        order: {
            id: 120,
            orderDate: "2026-09-01",
            orderStatus: "DELIVERED",
            items: [
                { id: 3, quantity: 1, fish: { id: 22, fishName: "Discus Fish", imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100" } },
                { id: 4, quantity: 3, fish: { id: 25, fishName: "Guppy Fish", imageUrl: "https://images.unsplash.com/photo-1520302368036-3914534f9a38?w=100" } }
            ]
        }
    },
    {
        id: 503,
        deliveryStatus: "SHIPPED",
        deliveryDate: "2026-09-15",
        trackingNo: "AQTRK561923",
        deliveryAddress: "No. 25, Main Street, Colombo, Sri Lanka",
        order: {
            id: 130,
            orderDate: "2026-09-10",
            orderStatus: "SHIPPED",
            items: [
                { id: 5, quantity: 2, fish: { id: 30, fishName: "Angelfish", imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=100" } }
            ]
        }
    },
    {
        id: 504,
        deliveryStatus: "PROCESSING",
        deliveryDate: "2026-09-18",
        trackingNo: null,
        deliveryAddress: "No. 25, Main Street, Colombo, Sri Lanka",
        order: {
            id: 134,
            orderDate: "2026-09-11",
            orderStatus: "PROCESSING",
            items: [
                { id: 6, quantity: 4, fish: { id: 35, fishName: "Cherry Barb", imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=100" } },
                { id: 7, quantity: 2, fish: { id: 38, fishName: "Zebra Danio", imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=100" } },
                { id: 8, quantity: 1, fish: { id: 40, fishName: "Oscar Fish", imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100" } },
                { id: 9, quantity: 6, fish: { id: 42, fishName: "Platy", imageUrl: "https://images.unsplash.com/photo-1520302368036-3914534f9a38?w=100" } }
            ]
        }
    },
    {
        id: 505,
        deliveryStatus: "PENDING",
        deliveryDate: "2026-09-20",
        trackingNo: null,
        deliveryAddress: "No. 25, Main Street, Colombo, Sri Lanka",
        order: {
            id: 138,
            orderDate: "2026-09-12",
            orderStatus: "PENDING",
            items: [
                { id: 10, quantity: 3, fish: { id: 45, fishName: "Molly", imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=100" } }
            ]
        }
    },
    {
        id: 506,
        deliveryStatus: "CANCELLED",
        deliveryDate: null,
        trackingNo: "AQTRK119283",
        deliveryAddress: "No. 25, Main Street, Colombo, Sri Lanka",
        order: {
            id: 110,
            orderDate: "2026-08-20",
            orderStatus: "CANCELLED",
            items: [
                { id: 11, quantity: 2, fish: { id: 15, fishName: "Blue Betta", imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=100" } }
            ]
        }
    }
];

document.addEventListener("DOMContentLoaded", () => {
    initDeliveriesPage();
});

function initDeliveriesPage() {
    checkAuthentication();
    setupEventListeners();
    handleUrlParams();
    loadDeliveries();
    updateCartBadge();
}

function checkAuthentication() {
    // UX Authentication Guard Check
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token && !USE_MOCK_DATA) {
        redirectToLogin();
    }
}

function redirectToLogin() {
    window.location.href = "login.html?redirect=deliveries.html";
}

function setupEventListeners() {
    // Hamburger menu toggle
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("authToken");
            sessionStorage.removeItem("authToken");
            showToast("Logged out successfully.", "success");
            setTimeout(() => redirectToLogin(), 1000);
        });
    }

    // Filtering and Search
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const dateFilter = document.getElementById("dateFilter");
    const sortFilter = document.getElementById("sortFilter");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const resetFiltersBtn = document.getElementById("resetFiltersBtn");
    const retryBtn = document.getElementById("retryBtn");

    if (searchInput) searchInput.addEventListener("input", debounce(applyFilters, 250));
    if (statusFilter) statusFilter.addEventListener("change", applyFilters);
    if (dateFilter) dateFilter.addEventListener("change", applyFilters);
    if (sortFilter) sortFilter.addEventListener("change", applyFilters);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", clearAllFilters);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener("click", clearAllFilters);
    if (retryBtn) retryBtn.addEventListener("click", loadDeliveries);

    // Modal controls
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modalOverlay = document.getElementById("modalOverlay");
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeDeliveryModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeDeliveryModal);
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDeliveryModal();
    });
}

function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const search = params.get("search") || params.get("trackingNo");
    const orderId = params.get("orderId");

    if (status && document.getElementById("statusFilter")) {
        document.getElementById("statusFilter").value = status.toUpperCase();
    }
    if (search && document.getElementById("searchInput")) {
        document.getElementById("searchInput").value = search;
    }
}

async function loadDeliveries() {
    showLoading();
    try {
        let data = [];
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network latency
            data = MOCK_DELIVERIES;
            document.getElementById("demoBadge").style.display = "inline-block";
        } else {
            // TODO: Replace with real Spring Boot REST API endpoint
            // GET /api/deliveries/my-deliveries
            const response = await apiRequest("/deliveries/my-deliveries");
            data = response.data || [];
        }

        allDeliveries = data.map(d => normalizeDelivery(d));
        applyFilters();
    } catch (error) {
        console.error("Failed to load deliveries:", error);
        showError(error.message || "We couldn't retrieve your delivery information right now.");
    }
}

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        redirectToLogin();
        throw new Error("Your session has expired. Please log in again.");
    }
    if (response.status === 403) {
        throw new Error("You are not authorized to access this delivery information.");
    }
    if (response.status === 404) {
        throw new Error("Delivery information could not be found.");
    }
    if (!response.ok) {
        throw new Error("Something went wrong on the server. Please try again later.");
    }

    return response.json();
}

function normalizeDelivery(delivery) {
    return {
        id: delivery.id,
        deliveryStatus: (delivery.deliveryStatus || delivery.status || "PENDING").toUpperCase(),
        deliveryDate: delivery.deliveryDate || null,
        trackingNo: delivery.trackingNo || delivery.trackingNumber || null,
        deliveryAddress: delivery.deliveryAddress || "Address unavailable",
        order: {
            id: delivery.order?.id || delivery.orderId || 0,
            orderDate: delivery.order?.orderDate || null,
            orderStatus: delivery.order?.orderStatus || "PENDING",
            items: (delivery.order?.items || delivery.items || []).map(item => ({
                id: item.id,
                quantity: item.quantity || 1,
                fish: {
                    id: item.fish?.id || 0,
                    fishName: item.fish?.fishName || "Aquarium Fish",
                    imageUrl: item.fish?.imageUrl || ""
                }
            }))
        }
    };
}

function normalizeDeliveryStatus(status) {
    const normalized = (status || "").trim().toUpperCase().replace(/-/g, "_");
    switch (normalized) {
        case "PENDING": return { label: "Pending", class: "pending", icon: "fa-clock" };
        case "PROCESSING": return { label: "Processing", class: "processing", icon: "fa-box" };
        case "SHIPPED": return { label: "Shipped", class: "shipped", icon: "fa-truck" };
        case "OUT_FOR_DELIVERY": return { label: "Out for Delivery", class: "out-for-delivery", icon: "fa-motorcycle" };
        case "DELIVERED": return { label: "Delivered", class: "delivered", icon: "fa-circle-check" };
        case "CANCELLED": return { label: "Cancelled", class: "cancelled", icon: "fa-ban" };
        case "FAILED": return { label: "Failed", class: "failed", icon: "fa-triangle-exclamation" };
        default: return { label: status || "Pending", class: "pending", icon: "fa-clock" };
    }
}

function applyFilters() {
    const searchTerm = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
    const statusValue = document.getElementById("statusFilter")?.value || "";
    const dateValue = document.getElementById("dateFilter")?.value || "";
    const sortValue = document.getElementById("sortFilter")?.value || "newest";

    filteredDeliveries = allDeliveries.filter(delivery => {
        // Search match
        const matchSearch = !searchTerm ||
            (delivery.trackingNo && delivery.trackingNo.toLowerCase().includes(searchTerm)) ||
            (delivery.order.id.toString().includes(searchTerm)) ||
            (delivery.order.items.some(item => item.fish.fishName.toLowerCase().includes(searchTerm)));

        // Status match
        const matchStatus = !statusValue || delivery.deliveryStatus === statusValue;

        // Date match
        let matchDate = true;
        if (dateValue && delivery.order.orderDate) {
            const orderDateObj = new Date(delivery.order.orderDate);
            const now = new Date();
            const diffDays = (now - orderDateObj) / (1000 * 60 * 60 * 24);
            matchDate = diffDays <= parseInt(dateValue);
        }

        return matchSearch && matchStatus && matchDate;
    });

    // Sort deliveries
    filteredDeliveries.sort((a, b) => {
        const dateA = new Date(a.order.orderDate || 0);
        const dateB = new Date(b.order.orderDate || 0);
        const delDateA = new Date(a.deliveryDate || 0);
        const delDateB = new Date(b.deliveryDate || 0);

        if (sortValue === "newest") return dateB - dateA;
        if (sortValue === "oldest") return dateA - dateB;
        if (sortValue === "delivery-latest") return delDateB - delDateA;
        if (sortValue === "delivery-earliest") return delDateA - delDateB;
        return 0;
    });

    currentPage = 1;
    updateStatistics();
    renderDeliveries();

    // Update URL params without reload
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (statusValue) params.set("status", statusValue);
    const newRelativePathQuery = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    history.replaceState(null, "", newRelativePathQuery);
}

function clearAllFilters() {
    if (document.getElementById("searchInput")) document.getElementById("searchInput").value = "";
    if (document.getElementById("statusFilter")) document.getElementById("statusFilter").value = "";
    if (document.getElementById("dateFilter")) document.getElementById("dateFilter").value = "";
    if (document.getElementById("sortFilter")) document.getElementById("sortFilter").value = "newest";
    applyFilters();
}

function updateStatistics() {
    const total = allDeliveries.length;
    const transit = allDeliveries.filter(d => d.deliveryStatus === "SHIPPED").length;
    const out = allDeliveries.filter(d => d.deliveryStatus === "OUT_FOR_DELIVERY").length;
    const delivered = allDeliveries.filter(d => d.deliveryStatus === "DELIVERED").length;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statTransit").textContent = transit;
    document.getElementById("statOut").textContent = out;
    document.getElementById("statDelivered").textContent = delivered;
}

function renderDeliveries() {
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const noResultsState = document.getElementById("noResultsState");
    const errorState = document.getElementById("errorState");
    const deliveriesList = document.getElementById("deliveriesList");
    const paginationContainer = document.getElementById("paginationContainer");

    loadingState.style.display = "none";
    errorState.style.display = "none";

    if (allDeliveries.length === 0) {
        emptyState.style.display = "block";
        noResultsState.style.display = "none";
        deliveriesList.style.display = "none";
        paginationContainer.style.display = "none";
        return;
    }

    emptyState.style.display = "none";

    if (filteredDeliveries.length === 0) {
        noResultsState.style.display = "block";
        deliveriesList.style.display = "none";
        paginationContainer.style.display = "none";
        return;
    }

    noResultsState.style.display = "none";
    deliveriesList.style.display = "flex";

    // Pagination slicing
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedItems = filteredDeliveries.slice(startIndex, endIndex);

    deliveriesList.innerHTML = paginatedItems.map(delivery => renderDeliveryCard(delivery)).join("");
    renderPagination();
}

function renderDeliveryCard(delivery) {
    const statusInfo = normalizeDeliveryStatus(delivery.deliveryStatus);
    const formattedDate = formatDate(delivery.deliveryDate);
    const dateLabel = delivery.deliveryStatus === "DELIVERED" ? "Delivered Date" : "Expected Delivery";

    return `
        <div class="delivery-card" data-id="${delivery.id}">
            <div class="delivery-card-header">
                <span class="order-ref">Order #${escapeHtml(delivery.order.id)}</span>
                <span class="status-badge ${statusInfo.class}">
                    <i class="fa-solid ${statusInfo.icon}"></i> ${escapeHtml(statusInfo.label)}
                </span>
            </div>

            <div class="delivery-card-body">
                <div class="delivery-section">
                    <h4>Tracking Number</h4>
                    ${delivery.trackingNo ? `
                        <div class="tracking-box">
                            <span class="tracking-number">${escapeHtml(delivery.trackingNo)}</span>
                            <button class="copy-btn" onclick="copyTrackingNumber('${escapeHtml(delivery.trackingNo)}')"><i class="fa-regular fa-copy"></i> Copy</button>
                        </div>
                    ` : `
                        <p class="text-muted" style="font-size: 0.85rem;">Tracking number will be available once your order has been shipped.</p>
                    `}
                </div>

                <div class="delivery-section">
                    <h4>Delivery Address</h4>
                    <p class="delivery-address-text">${escapeHtml(delivery.deliveryAddress)}</p>
                </div>

                <div class="delivery-section">
                    <h4>${dateLabel}</h4>
                    <p class="delivery-date-text">${escapeHtml(formattedDate)}</p>
                </div>
            </div>

            ${renderDeliveryItemsPreview(delivery.order.items, delivery.order.id)}

            ${renderDeliveryTimeline(delivery.deliveryStatus)}

            <div class="delivery-card-footer">
                <button class="btn-secondary" onclick="openDeliveryModal(${delivery.id})">
                    <i class="fa-solid fa-circle-info"></i> Delivery Details
                </button>
                <button class="btn-secondary" onclick="refreshDeliveryStatus(${delivery.id})">
                    <i class="fa-solid fa-rotate"></i> Refresh Status
                </button>
                <a href="order-details.html?id=${encodeURIComponent(delivery.order.id)}" class="btn-primary">
                    View Order <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `;
}

function renderDeliveryItemsPreview(items, orderId) {
    if (!items || items.length === 0) return "";
    const visibleItems = items.slice(0, 2);
    const remainingCount = items.length - 2;

    let html = `<div class="items-preview">`;
    visibleItems.forEach(item => {
        const imgSrc = item.fish.imageUrl || "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=100";
        html += `
            <div class="preview-item">
                <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(item.fish.fishName)}" onerror="this.src='https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=100'">
                <div class="preview-item-info">
                    <div class="preview-item-name">${escapeHtml(item.fish.fishName)}</div>
                    <div class="preview-item-qty">Qty: ${escapeHtml(item.quantity)}</div>
                </div>
            </div>
        `;
    });

    if (remainingCount > 0) {
        html += `<div class="more-items">+ ${remainingCount} more item(s)</div>`;
    }
    html += `</div>`;
    return html;
}

function renderDeliveryTimeline(status) {
    if (status === "CANCELLED" || status === "FAILED") {
        return `
            <div style="background: #fee2e2; color: #b91c1c; padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.9rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem;">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>Delivery was ${status.toLowerCase()}. Please check order details or contact support.</span>
            </div>
        `;
    }

    const steps = [
        { key: "PENDING", label: "Confirmed" },
        { key: "PROCESSING", label: "Processing" },
        { key: "SHIPPED", label: "Shipped" },
        { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
        { key: "DELIVERED", label: "Delivered" }
    ];

    const statusOrder = ["PENDING", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
    const currentIndex = statusOrder.indexOf(status);

    let html = `<div class="delivery-timeline">`;
    steps.forEach((step, index) => {
        let stepClass = "";
        let iconHtml = `<i class="fa-solid fa-circle"></i>`;

        if (currentIndex !== -1 && index <= currentIndex) {
            stepClass = "completed";
            iconHtml = `<i class="fa-solid fa-check"></i>`;
        }
        if (index === currentIndex) {
            stepClass = "active";
            iconHtml = `<i class="fa-solid fa-circle-dot"></i>`;
        }

        html += `
            <div class="timeline-step ${stepClass}">
                <div class="timeline-icon">${iconHtml}</div>
                <div class="timeline-label">${escapeHtml(step.label)}</div>
            </div>
        `;
    });
    html += `</div>`;
    return html;
}

function renderPagination() {
    const paginationContainer = document.getElementById("paginationContainer");
    const totalPages = Math.ceil(filteredDeliveries.length / PAGE_SIZE);

    if (totalPages <= 1) {
        paginationContainer.style.display = "none";
        return;
    }

    paginationContainer.style.display = "flex";
    let html = `
        <button class="page-btn" ${currentPage === 1 ? "disabled" : ""} onclick="changePage(${currentPage - 1})">
            <i class="fa-solid fa-chevron-left"></i> Previous
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `
        <button class="page-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(${currentPage + 1})">
            Next <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    paginationContainer.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderDeliveries();
    window.scrollTo({ top: 300, behavior: "smooth" });
}

async function copyTrackingNumber(trackingNo) {
    if (!trackingNo) return;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(trackingNo);
            showToast("Tracking number copied.", "success");
        } else {
            // Fallback textarea method
            const textArea = document.createElement("textarea");
            textArea.value = trackingNo;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            showToast("Tracking number copied.", "success");
        }
    } catch (err) {
        showToast("Failed to copy tracking number.", "error");
    }
}

async function refreshDeliveryStatus(deliveryId) {
    showToast("Checking latest delivery status...", "success");
    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 800));
        } else {
            // TODO: Replace with real Spring Boot REST API endpoint
            // GET /api/deliveries/{deliveryId}/status
            await apiRequest(`/deliveries/${deliveryId}/status`);
        }
        showToast("Delivery status updated.", "success");
        loadDeliveries();
    } catch (err) {
        showToast("Unable to refresh delivery status.", "error");
    }
}

function openDeliveryModal(deliveryId) {
    const delivery = allDeliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    const modalBody = document.getElementById("modalBody");
    const statusInfo = normalizeDeliveryStatus(delivery.deliveryStatus);
    const formattedDate = formatDate(delivery.deliveryDate);

    modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">Order Reference</span>
                    <h4 style="font-size: 1.1rem; color: var(--primary-deep);">Order #${escapeHtml(delivery.order.id)}</h4>
                </div>
                <span class="status-badge ${statusInfo.class}">
                    <i class="fa-solid ${statusInfo.icon}"></i> ${escapeHtml(statusInfo.label)}
                </span>
            </div>

            <div style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius-sm);">
                <span style="font-size: 0.85rem; color: var(--text-muted);">Tracking Number</span>
                <div style="font-family: monospace; font-weight: 700; font-size: 1.1rem; color: var(--primary-deep); margin-top: 0.25rem;">
                    ${escapeHtml(delivery.trackingNo || "Will be available upon shipment")}
                </div>
            </div>

            <div>
                <span style="font-size: 0.85rem; color: var(--text-muted);">Delivery Address</span>
                <p style="font-weight: 500; margin-top: 0.25rem;">${escapeHtml(delivery.deliveryAddress)}</p>
            </div>

            <div>
                <span style="font-size: 0.85rem; color: var(--text-muted);">Scheduled / Delivered Date</span>
                <p style="font-weight: 600; color: var(--primary-blue); margin-top: 0.25rem;">${escapeHtml(formattedDate)}</p>
            </div>

            <div>
                <span style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Ordered Fish Items</span>
                ${renderDeliveryItemsPreview(delivery.order.items, delivery.order.id)}
            </div>

            <div>
                <span style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Delivery Progress</span>
                ${renderDeliveryTimeline(delivery.deliveryStatus)}
            </div>
        </div>
    `;

    document.getElementById("modalCopyBtn").onclick = () => copyTrackingNumber(delivery.trackingNo);
    document.getElementById("modalViewOrderBtn").href = `order-details.html?id=${encodeURIComponent(delivery.order.id)}`;

    document.getElementById("deliveryModal").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeDeliveryModal() {
    document.getElementById("deliveryModal").style.display = "none";
    document.body.style.overflow = "auto";
}

async function updateCartBadge() {
    try {
        let count = 0;
        if (USE_MOCK_DATA) {
            count = 3; // Mock cart badge count
        } else {
            // TODO: Replace with real Spring Boot REST API endpoint
            // GET /api/cart
            const res = await apiRequest("/cart");
            count = res.itemCount || res.items?.length || 0;
        }
        const badge = document.getElementById("cartBadge");
        if (badge) badge.textContent = count;
    } catch (err) {
        console.error("Failed to fetch cart count", err);
    }
}

function showLoading() {
    document.getElementById("loadingState").style.display = "block";
    document.getElementById("deliveriesList").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("noResultsState").style.display = "none";
    document.getElementById("errorState").style.display = "none";
    document.getElementById("paginationContainer").style.display = "none";
}

function showError(message) {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("deliveriesList").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("noResultsState").style.display = "none";
    document.getElementById("errorState").style.display = "block";
    document.getElementById("paginationContainer").style.display = "none";
    document.getElementById("errorMessage").textContent = message;
}

function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "fa-circle-check";
    if (type === "error") icon = "fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    if (!dateString) return "Date unavailable";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return new Intl.DateTimeFormat('en-LK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    } catch (e) {
        return dateString;
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}