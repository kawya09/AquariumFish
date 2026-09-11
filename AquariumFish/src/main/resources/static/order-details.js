/**
 * Aquarium Fish - Order Details Controller
 * Handles loading, rendering, status management, and interaction
 * for single customer orders.
 */

// API Configuration Constants
const API_BASE_URL = 'http://localhost:8080/api';
const USE_MOCK_DATA = true; // Toggle to false when backend Spring Boot API is available

// Status Pipeline Configuration
const ORDER_STATUS_CONFIG = {
    PENDING: { label: 'Pending', step: 1, icon: 'fa-clock' },
    CONFIRMED: { label: 'Confirmed', step: 2, icon: 'fa-circle-check' },
    PROCESSING: { label: 'Processing', step: 3, icon: 'fa-gears' },
    SHIPPED: { label: 'Shipped', step: 4, icon: 'fa-truck-fast' },
    DELIVERED: { label: 'Delivered', step: 5, icon: 'fa-box-open' },
    COMPLETED: { label: 'Completed', step: 5, icon: 'fa-circle-check' },
    CANCELLED: { label: 'Cancelled', step: -1, icon: 'fa-circle-xmark' }
};

// Global Order State Variable
let currentOrderData = null;

// Initialize Page Controller when DOM is Ready
document.addEventListener('DOMContentLoaded', () => {
    initializeOrderDetails();
});

/**
 * Main Initialization Pipeline
 */
function initializeOrderDetails() {
    initializeNavbar();
    initializeMobileMenu();
    checkAuthentication();

    const orderId = getOrderIdFromUrl();
    if (!orderId) {
        showNotFoundState('Order Identifier Missing', 'We couldn\'t identify the order you are looking for because no order ID was provided in the URL.');
        return;
    }

    loadOrder(orderId);
}

/**
 * Ensures user is authenticated locally prior to API fetch
 */
function checkAuthentication() {
    const token = localStorage.getItem('token');
    const orderId = getOrderIdFromUrl();

    // TODO: Frontend check for demo purposes. Real security enforced on Spring Boot API.
    if (!token && !USE_MOCK_DATA) {
        const redirectUrl = orderId ? `order-details.html?id=${encodeURIComponent(orderId)}` : 'orders.html';
        window.location.href = `login.html?redirect=${encodeURIComponent(redirectUrl)}`;
    }
}

/**
 * Extracts and validates URL query parameter 'id'
 */
function getOrderIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id || id.trim() === '' || isNaN(id)) {
        return null;
    }
    return id.trim();
}

/**
 * Main Data Dispatcher
 */
async function loadOrder(orderId) {
    showLoadingState();

    if (USE_MOCK_DATA) {
        setTimeout(() => {
            const mockData = loadMockOrder(orderId);
            if (mockData) {
                currentOrderData = mockData;
                renderOrderDetails(mockData);
            } else {
                showNotFoundState('Order Not Found', `We couldn't find an order matching ID #${orderId}.`);
            }
        }, 600); // Simulate network latency
        return;
    }

    try {
        const orderData = await fetchOrderFromAPI(orderId);
        currentOrderData = orderData;
        renderOrderDetails(orderData);
    } catch (error) {
        handleApiError(error);
    }
}

/**
 * Fetch Order details from Spring Boot Backend
 * TODO: Replace endpoint path with actual backend mapping if needed
 */
async function fetchOrderFromAPI(orderId) {
    const token = localStorage.getItem('token');

    // TODO: Backend must verify authenticated customer ownership of requested orderId
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || 'API Error');
        error.status = response.status;
        throw error;
    }

    return await response.json();
}

/**
 * Main Render Controller
 */
function renderOrderDetails(order) {
    hideAllStates();

    // Set Page & Breadcrumb Title
    document.title = `Order #${order.id} - Aquarium Fish`;
    document.getElementById('breadcrumbCurrent').textContent = `Order #${order.id}`;

    // Render Sub-components safely
    renderOrderHeader(order);
    renderOrderStatus(order.orderStatus);
    renderOrderProgress(order.orderStatus);
    renderOrderItems(order.orderItems || []);
    renderCustomerInformation(order.customer);
    renderDeliveryInformation(order.delivery);
    renderPaymentInformation(order.payment);
    renderOrderSummary(order);
    renderActionButtons(order);

    // Show Main Content
    document.getElementById('orderDetailsContent').classList.remove('hidden');

    // Setup Action Listeners
    setupEventListeners(order);
}

/**
 * Render Header Info
 */
function renderOrderHeader(order) {
    document.getElementById('orderTitle').textContent = `Order #${order.id}`;
    document.getElementById('orderPlacedDate').textContent = formatDate(order.orderDate, true);
    document.getElementById('headerTotalAmount').textContent = formatCurrency(order.totalAmount);
}

/**
 * Render Status Banner
 */
function renderOrderStatus(status) {
    const banner = document.getElementById('orderStatusBanner');
    const badge = document.getElementById('statusBannerBadge');
    const message = document.getElementById('statusBannerMessage');
    const iconWrapper = document.getElementById('statusBannerIcon');

    const cleanStatus = (status || 'PENDING').toUpperCase();
    const statusClass = getOrderStatusClass(cleanStatus);

    banner.className = `order-status-banner ${statusClass}`;
    badge.textContent = formatOrderStatus(cleanStatus);
    iconWrapper.innerHTML = `<i class="fa-solid ${getOrderStatusIcon(cleanStatus)}"></i>`;

    switch (cleanStatus) {
        case 'PENDING':
            message.textContent = 'Your order has been received and is waiting for confirmation.';
            break;
        case 'CONFIRMED':
            message.textContent = 'Your order has been confirmed and is being prepped for packing.';
            break;
        case 'PROCESSING':
            message.textContent = 'Our aquarists are carefully inspecting and packaging your fish.';
            break;
        case 'SHIPPED':
            message.textContent = 'Your order is on its way to your destination.';
            break;
        case 'DELIVERED':
        case 'COMPLETED':
            message.textContent = 'Your order was successfully delivered and fulfilled.';
            break;
        case 'CANCELLED':
            message.textContent = 'This order was cancelled and will not be processed further.';
            break;
        default:
            message.textContent = 'Order status details available below.';
    }
}

/**
 * Render Tracker Stepper
 */
function renderOrderProgress(status) {
    const trackerContainer = document.getElementById('progressTracker');
    trackerContainer.innerHTML = '';

    const cleanStatus = (status || 'PENDING').toUpperCase();

    if (cleanStatus === 'CANCELLED') {
        trackerContainer.innerHTML = `
            <div class="step-item completed">
                <div class="step-node"><i class="fa-solid fa-check"></i></div>
                <div class="step-label">Order Placed</div>
            </div>
            <div class="step-item cancelled">
                <div class="step-node"><i class="fa-solid fa-xmark"></i></div>
                <div class="step-label">Order Cancelled</div>
            </div>
        `;
        return;
    }

    const steps = [
        { key: 'PENDING', label: 'Placed' },
        { key: 'CONFIRMED', label: 'Confirmed' },
        { key: 'PROCESSING', label: 'Processing' },
        { key: 'SHIPPED', label: 'Shipped' },
        { key: 'DELIVERED', label: 'Delivered' }
    ];

    const currentStepIndex = ORDER_STATUS_CONFIG[cleanStatus] ? ORDER_STATUS_CONFIG[cleanStatus].step : 1;

    steps.forEach((step, index) => {
        const stepNum = index + 1;
        const stepDiv = document.createElement('div');

        let stateClass = '';
        let iconContent = stepNum;

        if (stepNum < currentStepIndex) {
            stateClass = 'completed';
            iconContent = '<i class="fa-solid fa-check"></i>';
        } else if (stepNum === currentStepIndex) {
            stateClass = 'current';
            iconContent = `<i class="fa-solid ${getOrderStatusIcon(step.key)}"></i>`;
        }

        stepDiv.className = `step-item ${stateClass}`;
        stepDiv.innerHTML = `
            <div class="step-node">${iconContent}</div>
            <div class="step-label">${step.label}</div>
        `;
        trackerContainer.appendChild(stepDiv);
    });
}

/**
 * Render Order Items Section
 */
function renderOrderItems(items) {
    const container = document.getElementById('orderItemsList');
    const countTag = document.getElementById('itemCountTag');
    container.innerHTML = '';

    countTag.textContent = `${items.length} ${items.length === 1 ? 'Item' : 'Items'}`;

    if (!items || items.length === 0) {
        container.innerHTML = '<p class="text-muted">No items found in this order.</p>';
        return;
    }

    items.forEach(item => {
        const fish = item.fish || {};
        const primaryImage = getPrimaryFishImage(fish);

        // Retain historical unit price from Order_Item (Backend authoritative)
        const unitPrice = item.unitPrice || 0;
        const subtotal = item.subtotal || (unitPrice * (item.quantity || 1));

        const itemEl = document.createElement('div');
        itemEl.className = 'order-item-card';
        itemEl.innerHTML = `
            <div class="item-img-wrapper">
                <img src="${primaryImage}" alt="${escapeHtml(fish.fishName || 'Aquarium Fish')}" class="item-img" loading="lazy" onerror="this.src='assets/images/fish-placeholder.jpg'">
            </div>
            <div class="item-details">
                <div class="item-name">${escapeHtml(fish.fishName || 'Unknown Fish')}</div>
                <div class="item-meta">
                    <span><strong>Category:</strong> ${escapeHtml(fish.category?.categoryName || 'N/A')}</span>
                    <span><strong>Breed:</strong> ${escapeHtml(fish.breed?.breedName || 'N/A')}</span>
                    <span><strong>Size:</strong> ${escapeHtml(fish.size?.sizeName || 'N/A')}</span>
                    <span><strong>Color:</strong> ${escapeHtml(fish.color?.colorName || 'N/A')}</span>
                </div>
                <div class="item-pricing-mobile">
                    <span>Qty: ${item.quantity || 1} × ${formatCurrency(unitPrice)}</span> = <strong>${formatCurrency(subtotal)}</strong>
                </div>
                <div class="item-actions">
                    <a href="fish-details.html?id=${fish.id || ''}" class="btn btn-sm btn-outline">
                        <i class="fa-solid fa-eye"></i> View Fish
                    </a>
                </div>
            </div>
            <div class="item-pricing-desktop">
                <span class="item-unit-price">${formatCurrency(unitPrice)} × ${item.quantity || 1}</span>
                <span class="item-subtotal">${formatCurrency(subtotal)}</span>
            </div>
        `;
        container.appendChild(itemEl);
    });
}

/**
 * Primary Fish Image Helper
 */
function getPrimaryFishImage(fish) {
    if (!fish || !fish.fishImages || !Array.isArray(fish.fishImages) || fish.fishImages.length === 0) {
        return 'assets/images/fish-placeholder.jpg';
    }

    const primaryObj = fish.fishImages.find(img => img.isPrimary === true);
    if (primaryObj && primaryObj.imageUrl) {
        return primaryObj.imageUrl;
    }

    return fish.fishImages[0].imageUrl || 'assets/images/fish-placeholder.jpg';
}

/**
 * Render Delivery Block
 */
function renderDeliveryInformation(delivery) {
    const container = document.getElementById('deliveryInfoContent');
    const badge = document.getElementById('deliveryStatusBadge');
    const footer = document.getElementById('deliveryCardFooter');

    if (!delivery) {
        container.innerHTML = '<p class="text-muted">Delivery information will be available once your order is processed.</p>';
        badge.className = 'status-badge delivery-pending';
        badge.textContent = 'Pending';
        footer.classList.add('hidden');
        return;
    }

    const statusClass = getDeliveryStatusClass(delivery.deliveryStatus);
    badge.className = `status-badge ${statusClass}`;
    badge.textContent = formatDeliveryStatus(delivery.deliveryStatus);

    container.innerHTML = `
        <div class="info-group">
            <span class="info-label">Delivery Address</span>
            <span class="info-value">${escapeHtml(delivery.deliveryAddress || 'Not specified')}</span>
        </div>
        <div class="info-group">
            <span class="info-label">Estimated / Delivery Date</span>
            <span class="info-value">${formatDate(delivery.deliveryDate) || 'Pending'}</span>
        </div>
        <div class="info-group">
            <span class="info-label">Tracking Number</span>
            <span class="info-value">${escapeHtml(delivery.trackingNo || 'Tracking number not available yet.')}</span>
        </div>
    `;

    if (isOrderTrackable(delivery)) {
        footer.classList.remove('hidden');
    } else {
        footer.classList.add('hidden');
    }
}

/**
 * Render Payment Block
 */
function renderPaymentInformation(payment) {
    const container = document.getElementById('paymentInfoContent');
    const badge = document.getElementById('paymentStatusBadge');

    if (!payment) {
        container.innerHTML = '<p class="text-muted">Payment details unavailable.</p>';
        badge.className = 'status-badge payment-pending';
        badge.textContent = 'Pending';
        return;
    }

    const statusClass = getPaymentStatusClass(payment.paymentStatus);
    badge.className = `status-badge ${statusClass}`;
    badge.textContent = formatPaymentStatus(payment.paymentStatus);

    container.innerHTML = `
        <div class="info-group">
            <span class="info-label">Payment Method</span>
            <span class="info-value">${formatPaymentMethod(payment.paymentMethod)}</span>
        </div>
        <div class="info-group">
            <span class="info-label">Payment Date</span>
            <span class="info-value">${formatDate(payment.paymentDate, true) || 'N/A'}</span>
        </div>
        <div class="info-group">
            <span class="info-label">Amount Paid</span>
            <span class="info-value">${formatCurrency(payment.amount)}</span>
        </div>
    `;
}

/**
 * Render Customer Info
 */
function renderCustomerInformation(customer) {
    const container = document.getElementById('customerInfoContent');

    if (!customer) {
        container.innerHTML = '<p class="text-muted">Customer details not provided.</p>';
        return;
    }

    container.innerHTML = `
        <div class="info-group">
            <span class="info-label">Customer Name</span>
            <span class="info-value">${escapeHtml((customer.firstName || '') + ' ' + (customer.lastName || '')).trim() || 'N/A'}</span>
        </div>
        <div class="info-group">
            <span class="info-label">Phone Number</span>
            <span class="info-value">${escapeHtml(customer.phone || 'N/A')}</span>
        </div>
        <div class="info-group">
            <span class="info-label">Address</span>
            <span class="info-value">${escapeHtml(customer.address || 'N/A')}</span>
        </div>
    `;
}

/**
 * Render Financial Summary Card (Backend Authoritative)
 */
function renderOrderSummary(order) {
    // Total calculation strictly uses backend values
    const items = order.orderItems || [];
    let calculatedSubtotal = 0;
    items.forEach(item => {
        calculatedSubtotal += (item.subtotal || ((item.unitPrice || 0) * (item.quantity || 1)));
    });

    const total = order.totalAmount || calculatedSubtotal;
    const deliveryFee = 0; // Backend calculated default
    const discount = 0;

    document.getElementById('summarySubtotal').textContent = formatCurrency(calculatedSubtotal);
    document.getElementById('summaryDelivery').textContent = deliveryFee > 0 ? formatCurrency(deliveryFee) : 'FREE';

    const discountRow = document.getElementById('summaryDiscountRow');
    if (discount > 0) {
        discountRow.classList.remove('hidden');
        document.getElementById('summaryDiscount').textContent = `- ${formatCurrency(discount)}`;
    } else {
        discountRow.classList.add('hidden');
    }

    document.getElementById('summaryTotal').textContent = formatCurrency(total);
}

/**
 * Context-Sensitive Action Buttons Logic
 */
function renderActionButtons(order) {
    const cancelBtn = document.getElementById('cancelOrderBtn');
    const reorderBtn = document.getElementById('reorderBtn');

    if (isOrderCancellable(order.orderStatus)) {
        cancelBtn.classList.remove('hidden');
    } else {
        cancelBtn.classList.add('hidden');
    }

    if (isOrderReorderable(order.orderStatus)) {
        reorderBtn.classList.remove('hidden');
    } else {
        reorderBtn.classList.add('hidden');
    }
}

/**
 * Setup Dynamic Event Listeners
 */
function setupEventListeners(order) {
    // Print Listener
    document.getElementById('printOrderBtn').onclick = () => window.print();

    // Cancel Listeners
    const cancelBtn = document.getElementById('cancelOrderBtn');
    if (cancelBtn) cancelBtn.onclick = () => openCancelModal(order.id);

    document.getElementById('closeModalBtn').onclick = closeCancelModal;
    document.getElementById('keepOrderBtn').onclick = closeCancelModal;
    document.getElementById('confirmCancelBtn').onclick = () => confirmCancelOrder(order.id);

    // Track Delivery Listener
    const trackBtn = document.getElementById('trackDeliveryBtn');
    if (trackBtn) {
        trackBtn.onclick = () => trackDelivery(order.id, order.delivery);
    }

    // Reorder Listener
    const reorderBtn = document.getElementById('reorderBtn');
    if (reorderBtn) {
        reorderBtn.onclick = () => reorderOrder(order.id);
    }
}

/**
 * Order Cancellation Logic
 */
async function confirmCancelOrder(orderId) {
    const confirmBtn = document.getElementById('confirmCancelBtn');
    const spinner = document.getElementById('cancelSpinner');
    const btnText = confirmBtn.querySelector('.btn-text');

    confirmBtn.disabled = true;
    spinner.classList.remove('hidden');
    btnText.textContent = 'Cancelling...';

    if (USE_MOCK_DATA) {
        setTimeout(() => {
            closeCancelModal();
            showToast('Order cancelled successfully.', 'success');

            // Mutate local mock state for UI reflection
            currentOrderData.orderStatus = 'CANCELLED';
            renderOrderDetails(currentOrderData);

            confirmBtn.disabled = false;
            spinner.classList.add('hidden');
            btnText.textContent = 'Confirm Cancel';
        }, 800);
        return;
    }

    try {
        const token = localStorage.getItem('token');
        // TODO: Replace with Spring Boot endpoint mapping
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to cancel order.');
        }

        closeCancelModal();
        showToast('Order cancelled successfully.', 'success');
        loadOrder(orderId); // Reload from server
    } catch (err) {
        showToast(err.message || 'Unable to cancel order. Contact support.', 'error');
    } finally {
        confirmBtn.disabled = false;
        spinner.classList.add('hidden');
        btnText.textContent = 'Confirm Cancel';
    }
}

/**
 * Reorder Functionality
 */
async function reorderOrder(orderId) {
    // TODO: Send order ID to backend. Backend checks live inventory & adds current fish to cart.
    showToast('Reorder is currently unavailable or items added to cart.', 'info');

    /* Expected Production Implementation:
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/reorder`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(response.ok) window.location.href = 'cart.html';
    } catch(err) { ... }
    */
}

/**
 * Delivery Tracking Navigation
 */
function trackDelivery(orderId, delivery) {
    if (!delivery || !delivery.trackingNo) {
        showToast('Tracking information is not available yet.', 'info');
        return;
    }
    window.location.href = `delivery.html?orderId=${encodeURIComponent(orderId)}`;
}

/**
 * Helper Eligibility Checkers
 */
function isOrderCancellable(status) {
    const s = (status || '').toUpperCase();
    return s === 'PENDING' || s === 'CONFIRMED';
}

function isOrderReorderable(status) {
    const s = (status || '').toUpperCase();
    return s === 'DELIVERED' || s === 'COMPLETED';
}

function isOrderTrackable(delivery) {
    return delivery && delivery.trackingNo && delivery.trackingNo.trim() !== '';
}

/**
 * UI State Displays
 */
function showLoadingState() {
    hideAllStates();
    document.getElementById('loadingSkeleton').classList.remove('hidden');
}

function hideAllStates() {
    document.getElementById('loadingSkeleton').classList.add('hidden');
    document.getElementById('stateContainer').classList.add('hidden');
    document.getElementById('orderDetailsContent').classList.add('hidden');
}

function showNotFoundState(title, message) {
    hideAllStates();
    const container = document.getElementById('stateContainer');
    document.getElementById('stateTitle').textContent = title;
    document.getElementById('stateMessage').textContent = message;
    document.getElementById('stateIcon').innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    container.classList.remove('hidden');
}

function handleApiError(error) {
    hideAllStates();
    const container = document.getElementById('stateContainer');
    const titleEl = document.getElementById('stateTitle');
    const msgEl = document.getElementById('stateMessage');
    const actionsEl = document.getElementById('stateActions');

    if (error.status === 401) {
        const orderId = getOrderIdFromUrl();
        window.location.href = `login.html?redirect=${encodeURIComponent(`order-details.html?id=${orderId}`)}`;
        return;
    } else if (error.status === 403) {
        titleEl.textContent = 'Access Denied';
        msgEl.textContent = 'You do not have permission to view this order.';
    } else if (error.status === 404) {
        titleEl.textContent = 'Order Not Found';
        msgEl.textContent = 'We couldn\'t find the order you requested.';
    } else {
        titleEl.textContent = 'Unable to Load Order';
        msgEl.textContent = 'Something went wrong while loading your order. Please try again later.';
    }

    actionsEl.innerHTML = `
        <button class="btn btn-primary" onclick="location.reload()"><i class="fa-solid fa-rotate-right"></i> Try Again</button>
        <a href="orders.html" class="btn btn-outline">Back to Orders</a>
    `;

    container.classList.remove('hidden');
}

/**
 * Modal Handling
 */
function openCancelModal(orderId) {
    document.getElementById('modalOrderRef').textContent = `Order #${orderId}`;
    document.getElementById('cancelModal').classList.remove('hidden');
    document.addEventListener('keydown', handleModalKeyDown);
}

function closeCancelModal() {
    document.getElementById('cancelModal').classList.add('hidden');
    document.removeEventListener('keydown', handleModalKeyDown);
}

function handleModalKeyDown(e) {
    if (e.key === 'Escape') closeCancelModal();
}

/**
 * Toast System
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <span><i class="fa-solid ${icon}"></i> ${escapeHtml(message)}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 4000);
}

/**
 * Formatters & Helpers
 */
function formatCurrency(amount) {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(val);
}

function formatDate(dateString, includeTime = false) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.hour12 = true;
    }

    return new Intl.DateTimeFormat('en-GB', options).format(date);
}

function formatOrderStatus(status) {
    const key = (status || '').toUpperCase();
    return ORDER_STATUS_CONFIG[key] ? ORDER_STATUS_CONFIG[key].label : status;
}

function formatDeliveryStatus(status) {
    if (!status) return 'Pending';
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function formatPaymentStatus(status) {
    if (!status) return 'Pending';
    return status.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function formatPaymentMethod(method) {
    if (!method) return 'N/A';
    switch (method.toUpperCase()) {
        case 'CARD': return 'Credit / Debit Card';
        case 'CASH_ON_DELIVERY': return 'Cash on Delivery';
        case 'BANK_TRANSFER': return 'Bank Transfer';
        default: return method;
    }
}

function getOrderStatusClass(status) {
    return `status-${(status || 'pending').toLowerCase()}`;
}

function getDeliveryStatusClass(status) {
    return `delivery-${(status || 'pending').toLowerCase()}`;
}

function getPaymentStatusClass(status) {
    return `payment-${(status || 'pending').toLowerCase()}`;
}

function getOrderStatusIcon(status) {
    const key = (status || '').toUpperCase();
    return ORDER_STATUS_CONFIG[key] ? ORDER_STATUS_CONFIG[key].icon : 'fa-circle-info';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Navigation & Menu Controls
 */
function initializeNavbar() {
    const userBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userBtn && userDropdown) {
        userBtn.onclick = (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        };

        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('token');
            showToast('Logged out successfully', 'info');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
        };
    }

    updateCartCount();
}

function initializeMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const links = document.getElementById('navLinks');

    if (toggle && links) {
        toggle.onclick = () => {
            links.classList.toggle('show');
        };
    }
}

/**
 * Cart Quantity Badge Updater
 */
async function updateCartCount() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;

    if (USE_MOCK_DATA) {
        badge.textContent = '3';
        return;
    }

    try {
        const token = localStorage.getItem('token');
        // TODO: Replace with Spring Boot endpoint mapping GET /api/cart
        const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const cartData = await response.json();
            // Total sum of all item quantities
            const totalQty = (cartData.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
            badge.textContent = totalQty;
        }
    } catch (e) {
        badge.textContent = '0';
    }
}

/**
 * Demo Mock Order Data Generator
 * DEMO DATA ONLY - Replaced when Spring Boot API connected
 */
function loadMockOrder(orderId) {
    if (orderId === '9999') return null; // Force Not Found for testing

    return {
        id: parseInt(orderId) || 1025,
        orderDate: "2026-08-12T10:30:00",
        totalAmount: 9000.00,
        orderStatus: "DELIVERED",

        customer: {
            id: 5,
            firstName: "John",
            lastName: "Perera",
            phone: "0712345678",
            address: "123 Example Road, Colombo, Sri Lanka"
        },

        orderItems: [
            {
                id: 101,
                quantity: 2,
                unitPrice: 2500.00,
                subtotal: 5000.00,
                fish: {
                    id: 15,
                    fishName: "Halfmoon Betta Fish",
                    description: "Beautiful freshwater aquarium fish.",
                    price: 2800.00, // Demonstrates historical price protection (unitPrice is 2500)
                    category: { id: 1, categoryName: "Betta" },
                    breed: { id: 1, breedName: "Halfmoon" },
                    size: { id: 1, sizeName: "Small" },
                    color: { id: 1, colorName: "Red Cyan" },
                    fishImages: [
                        { id: 1, imageUrl: "assets/images/betta.jpg", isPrimary: true }
                    ]
                }
            },
            {
                id: 102,
                quantity: 2,
                unitPrice: 2000.00,
                subtotal: 4000.00,
                fish: {
                    id: 22,
                    fishName: "Fancy Guppy Set",
                    description: "Vibrant tropical freshwater fish.",
                    price: 2000.00,
                    category: { id: 2, categoryName: "Guppy" },
                    breed: { id: 4, breedName: "Dragon Eye" },
                    size: { id: 2, sizeName: "Medium" },
                    color: { id: 3, colorName: "Multicolor" },
                    fishImages: [
                        { id: 2, imageUrl: "assets/images/guppy.jpg", isPrimary: true }
                    ]
                }
            }
        ],

        payment: {
            id: 10,
            paymentMethod: "CARD",
            paymentDate: "2026-08-12T10:35:00",
            amount: 9000.00,
            paymentStatus: "PAID"
        },

        delivery: {
            id: 20,
            deliveryAddress: "123 Example Road, Colombo, Sri Lanka",
            deliveryDate: "2026-08-18",
            deliveryStatus: "DELIVERED",
            trackingNo: "TRK123456"
        }
    };
}