/**
 * AQUIARIUM FISH E-COMMERCE - SELLER PROFILE MODULE
 * -----------------------------------------------------------------------------
 * File: js/seller-profile.js
 * Relative Root Path: ../
 * Handles seller profile data retrieval, editing, validation, modal security controls,
 * password updates, and responsiveness.
 */

// Global Configuration Flags
const USE_MOCK_DATA = true; // DEMO ONLY: Set to false to connect to real Spring Boot REST API
const API_BASE_URL = 'http://localhost:8080/api';

// State Management
let currentSellerData = null;
let isEditModeActive = false;

// DOM Content Loaded Entry Point
document.addEventListener('DOMContentLoaded', () => {
    initializeSellerProfile();
});

/**
 * Main Initialization Controller
 */
function initializeSellerProfile() {
    setupNavigationAndSidebar();
    setupDropdownMenus();
    setupEventListeners();

    // Check local authentication state prior to backend operations
    if (checkAuthentication()) {
        loadSellerProfile();
    }
}

/* ==========================================================================
   AUTHENTICATION & AUTHORIZATION
   ========================================================================== */

/**
 * Checks authentication status on page load.
 * Redirects unauthenticated users to login with return path.
 */
function checkAuthentication() {
    const token = localStorage.getItem('token');

    if (!token && !USE_MOCK_DATA) {
        const returnUrl = encodeURIComponent('seller/seller-profile.html');
        window.location.href = `../login.html?redirect=${returnUrl}`;
        return false;
    }
    return true;
}

/**
 * Verifies role authorization for seller pages.
 */
function checkSellerRole(userRole) {
    if (!userRole) return false;
    const normalizedRole = userRole.toUpperCase();
    return normalizedRole === 'SELLER' || normalizedRole === 'ROLE_SELLER';
}

/* ==========================================================================
   DATA FETCHING & STATE MANAGEMENT
   ========================================================================== */

/**
 * Main profile loader switcher based on execution mode.
 */
async function loadSellerProfile() {
    showLoadingState();

    if (USE_MOCK_DATA) {
        // Simulate network latency for realistic UX preview
        setTimeout(() => {
            currentSellerData = getMockSellerProfile();
            renderAllProfileData(currentSellerData);
            document.getElementById('mockDataIndicator').classList.remove('hidden');
        }, 600);
    } else {
        try {
            const data = await fetchSellerProfile();
            currentSellerData = data;

            // Validate Role
            const userRole = data?.user?.role?.roleName || data?.user?.role;
            if (!checkSellerRole(userRole)) {
                showToast('Access denied. Seller role required.', 'error');
                setTimeout(() => { window.location.href = '../index.html'; }, 2000);
                return;
            }

            renderAllProfileData(data);
        } catch (error) {
            console.error('Profile loading error:', error);
            showErrorState(error.message);
        }
    }
}

/**
 * Fetches real Seller entity and associated User details from REST API.
 * TODO: Replace endpoint strings with exact Spring Boot controller mapping.
 */
async function fetchSellerProfile() {
    const token = localStorage.getItem('token');

    // Endpoint TODO: Default assumes GET /api/sellers/me or GET /api/seller/profile
    const response = await fetch(`${API_BASE_URL}/sellers/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '../login.html?redirect=seller/seller-profile.html';
        throw new Error('Session expired. Please log in again.');
    }

    if (response.status === 403) {
        throw new Error('You do not have permission to view this seller profile.');
    }

    if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
    }

    return await response.json();
}

/**
 * DEMO ONLY: Provides structured fallback mock data matching backend JPA relationships.
 */
function getMockSellerProfile() {
    return {
        id: 12,
        shopName: "Ocean Paradise",
        phone: "0712345678",
        address: "123 Marine Road, Colombo 03",
        user: {
            id: 25,
            username: "ocean_seller",
            email: "seller@example.com",
            status: "ACTIVE",
            role: {
                id: 2,
                roleName: "SELLER"
            }
        },
        statistics: {
            totalFish: 38,
            activeListings: 24,
            totalOrders: 112,
            completedOrders: 96
        },
        performance: {
            averageRating: 4.8,
            fulfillmentRate: 98,
            activeProducts: 24,
            completedOrders: 96
        },
        recentActivity: [
            {
                id: 1,
                icon: "fa-box",
                text: "Received new order #ORD-8821 for Discus Fish Pair",
                timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
            },
            {
                id: 2,
                icon: "fa-warehouse",
                text: "Stock updated for Neon Tetra (Batch 402)",
                timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
            },
            {
                id: 3,
                icon: "fa-pen-to-square",
                text: "Shop contact details updated",
                timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
            }
        ]
    };
}

/* ==========================================================================
   UI RENDERING FUNCTIONS
   ========================================================================== */

/**
 * Master render orchestrator.
 */
function renderAllProfileData(data) {
    hideLoadingState();

    // Safely extract entity structures
    const seller = data || {};
    const user = seller.user || {};
    const roleObj = user.role;
    const roleName = (typeof roleObj === 'object' && roleObj !== null) ? roleObj.roleName : (roleObj || 'SELLER');
    const status = user.status || 'ACTIVE';

    // 1. Top Header & Hero Avatar Details
    updateHeaderSellerInfo(seller.shopName, seller.shopName);
    renderProfileHeader(seller, user, roleName, status);

    // 2. Form & Readonly Account Details
    renderShopInformation(seller);
    renderAccountInformation(seller, user, roleName, status);

    // 3. Completeness Calculation
    renderCompletenessWidget(seller, user);

    // 4. Statistics & Dashboard Widgets
    renderStatistics(seller.statistics);
    renderPerformance(seller.performance);
    renderRecentActivity(seller.recentActivity);
}

function renderProfileHeader(seller, user, roleName, status) {
    const shopName = seller.shopName || 'Unnamed Shop';
    const initials = getSellerInitials(shopName);

    document.getElementById('heroAvatar').textContent = initials;
    document.getElementById('heroShopName').textContent = shopName;
    document.getElementById('heroEmail').textContent = user.email || 'Not provided';
    document.getElementById('heroRole').textContent = roleName;
    document.getElementById('heroSellerId').textContent = seller.id || '--';

    // Status Badges
    const statusBadge = document.getElementById('topStatusBadge');
    const statusDot = document.getElementById('heroStatusDot');

    statusBadge.className = 'badge-status';

    switch (status.toUpperCase()) {
        case 'ACTIVE':
            statusBadge.classList.add('status-active');
            statusBadge.innerHTML = '<i class="fa-solid fa-circle"></i> Active';
            statusDot.style.backgroundColor = 'var(--status-active)';
            break;
        case 'INACTIVE':
            statusBadge.classList.add('status-inactive');
            statusBadge.innerHTML = '<i class="fa-solid fa-circle"></i> Inactive';
            statusDot.style.backgroundColor = 'var(--status-inactive)';
            break;
        case 'SUSPENDED':
        case 'BLOCKED':
            statusBadge.classList.add('status-blocked');
            statusBadge.innerHTML = `<i class="fa-solid fa-circle"></i> ${escapeHtml(status)}`;
            statusDot.style.backgroundColor = 'var(--status-blocked)';
            break;
        default:
            statusBadge.classList.add('status-inactive');
            statusBadge.innerHTML = `<i class="fa-solid fa-circle"></i> ${escapeHtml(status)}`;
            statusDot.style.backgroundColor = 'var(--text-dim)';
    }
}

function renderShopInformation(seller) {
    document.getElementById('inputShopName').value = seller.shopName || '';
    document.getElementById('inputPhone').value = seller.phone || '';
    document.getElementById('inputAddress').value = seller.address || '';
}

function renderAccountInformation(seller, user, roleName, status) {
    document.getElementById('displayUsername').textContent = user.username || 'N/A';
    document.getElementById('displayEmail').textContent = user.email || 'N/A';
    document.getElementById('displayRole').textContent = roleName;
    document.getElementById('displaySellerId').textContent = seller.id || 'N/A';

    const statusElem = document.getElementById('displayStatus');
    statusElem.textContent = status;
    statusElem.className = 'badge-status-text';
    if (status.toUpperCase() === 'ACTIVE') statusElem.classList.add('text-success');
}

function renderCompletenessWidget(seller, user) {
    const fields = [
        seller.shopName,
        seller.phone,
        seller.address,
        user.email,
        user.username
    ];

    const filledFields = fields.filter(val => val && val.toString().trim() !== '').length;
    const percentage = Math.round((filledFields / fields.length) * 100);

    document.getElementById('completenessPercentage').textContent = `${percentage}%`;
    document.getElementById('completenessBar').style.width = `${percentage}%`;

    const hintElem = document.getElementById('completenessHint');
    if (percentage === 100) {
        hintElem.textContent = 'Great job! Your seller profile is fully complete.';
    } else {
        hintElem.textContent = 'Add missing phone or address details to reach 100%.';
    }
}

function renderStatistics(stats) {
    const defaultStats = stats || { totalFish: 0, activeListings: 0, totalOrders: 0, completedOrders: 0 };
    document.getElementById('statTotalFish').textContent = defaultStats.totalFish || 0;
    document.getElementById('statActiveListings').textContent = defaultStats.activeListings || 0;
    document.getElementById('statTotalOrders').textContent = defaultStats.totalOrders || 0;
    document.getElementById('statCompletedOrders').textContent = defaultStats.completedOrders || 0;
}

function renderPerformance(perf) {
    const defaultPerf = perf || { averageRating: 0.0, fulfillmentRate: 0, activeProducts: 0, completedOrders: 0 };

    const rating = parseFloat(defaultPerf.averageRating || 0).toFixed(1);
    const fulfillment = parseInt(defaultPerf.fulfillmentRate || 0, 10);

    document.getElementById('perfRating').textContent = `${rating} ★`;
    document.getElementById('perfRatingFill').style.width = `${(rating / 5) * 100}%`;

    document.getElementById('perfFulfillment').textContent = `${fulfillment}%`;
    document.getElementById('perfFulfillmentFill').style.width = `${fulfillment}%`;

    document.getElementById('perfCompletedCount').textContent = defaultPerf.completedOrders || 0;
    document.getElementById('perfActiveProductsCount').textContent = defaultPerf.activeProducts || 0;
}

function renderRecentActivity(activities) {
    const container = document.getElementById('activityTimeline');
    const emptyState = document.getElementById('activityEmptyState');

    if (!activities || activities.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = activities.map(item => `
        <div class="timeline-item">
            <div class="timeline-icon-box">
                <i class="fa-solid ${escapeHtml(item.icon || 'fa-bell')}"></i>
            </div>
            <div class="timeline-content">
                <div class="timeline-text">${escapeHtml(item.text)}</div>
                <div class="timeline-time">${formatDateTime(item.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function updateHeaderSellerInfo(shopName, rawName) {
    const headerShopName = document.getElementById('headerShopName');
    const headerAvatar = document.getElementById('headerAvatar');
    const displayName = shopName || 'Seller Store';

    if (headerShopName) headerShopName.textContent = displayName;
    if (headerAvatar) headerAvatar.textContent = getSellerInitials(displayName);
}

/* ==========================================================================
   FORM EDITING & VALIDATION
   ========================================================================== */

function enableEditMode() {
    isEditModeActive = true;
    document.getElementById('inputShopName').removeAttribute('readonly');
    document.getElementById('inputPhone').removeAttribute('readonly');
    document.getElementById('inputAddress').removeAttribute('readonly');

    document.getElementById('shopFormActions').classList.remove('hidden');
    document.getElementById('btnEditProfile').classList.add('hidden');

    document.getElementById('inputShopName').focus();
}

function disableEditMode() {
    isEditModeActive = false;
    document.getElementById('inputShopName').setAttribute('readonly', 'true');
    document.getElementById('inputPhone').setAttribute('readonly', 'true');
    document.getElementById('inputAddress').setAttribute('readonly', 'true');

    document.getElementById('shopFormActions').classList.add('hidden');
    document.getElementById('btnEditProfile').classList.remove('hidden');

    clearValidationErrors();
}

function cancelEdit() {
    if (currentSellerData) {
        renderShopInformation(currentSellerData);
    }
    disableEditMode();
}

/**
 * Sri Lankan Phone Validation Logic
 */
function validatePhone(phoneStr) {
    if (!phoneStr) return false;
    const cleanPhone = phoneStr.trim();
    // Validates formats: 07XXXXXXXX (10 digits) or +947XXXXXXXX (12 chars)
    const slPhoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    return slPhoneRegex.test(cleanPhone);
}

function validateProfileForm(shopName, phone) {
    let isValid = true;
    clearValidationErrors();

    if (!shopName || shopName.trim() === '') {
        showFieldError('errorShopName', 'Shop name is required.');
        isValid = false;
    }

    if (!phone || phone.trim() === '') {
        showFieldError('errorPhone', 'Phone number is required.');
        isValid = false;
    } else if (!validatePhone(phone)) {
        showFieldError('errorPhone', 'Please enter a valid Sri Lankan phone number (e.g. 0712345678 or +94712345678).');
        isValid = false;
    }

    return isValid;
}

async function handleSaveProfile(e) {
    e.preventDefault();

    const shopName = document.getElementById('inputShopName').value;
    const phone = document.getElementById('inputPhone').value;
    const address = document.getElementById('inputAddress').value;

    if (!validateProfileForm(shopName, phone)) return;

    const btnSave = document.getElementById('btnSaveProfile');
    btnSave.disabled = true;
    btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    const payload = {
        shopName: shopName.trim(),
        phone: phone.trim(),
        address: address.trim()
    };

    if (USE_MOCK_DATA) {
        setTimeout(() => {
            currentSellerData.shopName = payload.shopName;
            currentSellerData.phone = payload.phone;
            currentSellerData.address = payload.address;

            renderAllProfileData(currentSellerData);
            disableEditMode();
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
            showToast('Profile updated successfully!', 'success');
        }, 800);
    } else {
        try {
            const token = localStorage.getItem('token');
            // Endpoint TODO: Replace with Spring Boot PUT endpoint e.g., PUT /api/sellers/me
            const response = await fetch(`${API_BASE_URL}/sellers/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to update profile on backend.');
            }

            const updatedSeller = await response.json();
            currentSellerData = updatedSeller;
            renderAllProfileData(currentSellerData);
            disableEditMode();
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            showToast(err.message || 'Unable to update profile', 'error');
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
        }
    }
}

/* ==========================================================================
   PASSWORD MODAL & STRENGTH METER
   ========================================================================== */

function openChangePasswordModal() {
    document.getElementById('formChangePassword').reset();
    clearValidationErrors();
    updatePasswordStrength('');
    document.getElementById('modalChangePassword').classList.remove('hidden');
    document.getElementById('inputCurrentPassword').focus();
}

function closeChangePasswordModal() {
    document.getElementById('modalChangePassword').classList.add('hidden');
}

function handlePasswordStrengthInput(e) {
    const value = e.target.value;
    updatePasswordStrength(value);
}

function updatePasswordStrength(password) {
    const bar = document.getElementById('pwStrengthBar');
    const text = document.getElementById('pwStrengthText');

    if (!password) {
        bar.style.width = '0%';
        bar.style.backgroundColor = 'transparent';
        text.textContent = 'Strength: Too short';
        return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
        case 1:
            bar.style.width = '25%';
            bar.style.backgroundColor = '#ef4444';
            text.textContent = 'Strength: Weak';
            break;
        case 2:
            bar.style.width = '50%';
            bar.style.backgroundColor = '#f59e0b';
            text.textContent = 'Strength: Fair';
            break;
        case 3:
            bar.style.width = '75%';
            bar.style.backgroundColor = '#38bdf8';
            text.textContent = 'Strength: Good';
            break;
        case 4:
            bar.style.width = '100%';
            bar.style.backgroundColor = '#10b981';
            text.textContent = 'Strength: Strong';
            break;
        default:
            bar.style.width = '10%';
            bar.style.backgroundColor = '#ef4444';
            text.textContent = 'Strength: Weak';
    }
}

async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    clearValidationErrors();

    const currentPw = document.getElementById('inputCurrentPassword').value;
    const newPw = document.getElementById('inputNewPassword').value;
    const confirmPw = document.getElementById('inputConfirmPassword').value;

    let isValid = true;

    if (!currentPw) {
        showFieldError('errorCurrentPassword', 'Current password is required.');
        isValid = false;
    }

    if (!newPw || newPw.length < 8) {
        showFieldError('errorNewPassword', 'New password must be at least 8 characters long.');
        isValid = false;
    } else if (newPw === currentPw) {
        showFieldError('errorNewPassword', 'New password cannot be identical to current password.');
        isValid = false;
    }

    if (newPw !== confirmPw) {
        showFieldError('errorConfirmPassword', 'Passwords do not match.');
        isValid = false;
    }

    if (!isValid) return;

    const btnSubmit = document.getElementById('btnSubmitPassword');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

    const payload = {
        currentPassword: currentPw,
        newPassword: newPw
    };

    if (USE_MOCK_DATA) {
        setTimeout(() => {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Update Password';
            closeChangePasswordModal();
            showToast('Password updated successfully!', 'success');
        }, 800);
    } else {
        try {
            const token = localStorage.getItem('token');
            // Endpoint TODO: Replace with Spring Boot endpoint PUT/POST /api/auth/change-password
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Current password was incorrect.');
            }

            closeChangePasswordModal();
            showToast('Password changed successfully!', 'success');
        } catch (err) {
            showFieldError('errorCurrentPassword', err.message);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Update Password';
        }
    }
}

/* ==========================================================================
   LOGOUT & DEACTIVATION
   ========================================================================== */

function openLogoutModal() {
    document.getElementById('modalLogout').classList.remove('hidden');
}

function closeLogoutModal() {
    document.getElementById('modalLogout').classList.add('hidden');
}

function executeLogout() {
    // Clear seller auth variables without destroying unrelated customer data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    showToast('Logged out successfully.', 'success');
    setTimeout(() => {
        window.location.href = '../login.html';
    }, 500);
}

function openDeactivationModal() {
    const sellerId = currentSellerData?.id || '--';
    document.getElementById('deactSellerId').textContent = sellerId;
    document.getElementById('modalDeactivation').classList.remove('hidden');
}

function closeDeactivationModal() {
    document.getElementById('modalDeactivation').classList.add('hidden');
}

/* ==========================================================================
   EVENT LISTENERS & NAVIGATION
   ========================================================================== */

function setupEventListeners() {
    // Edit Form Actions
    document.getElementById('btnEditProfile').addEventListener('click', enableEditMode);
    document.getElementById('btnCancelEdit').addEventListener('click', cancelEdit);
    document.getElementById('shopInfoForm').addEventListener('submit', handleSaveProfile);

    // Change Password Modal
    document.getElementById('btnOpenChangePassword').addEventListener('click', openChangePasswordModal);
    document.getElementById('btnClosePasswordModal').addEventListener('click', closeChangePasswordModal);
    document.getElementById('btnCancelPasswordModal').addEventListener('click', closeChangePasswordModal);
    document.getElementById('formChangePassword').addEventListener('submit', handleChangePasswordSubmit);
    document.getElementById('inputNewPassword').addEventListener('input', handlePasswordStrengthInput);

    // Password Visibility Toggles
    document.querySelectorAll('.btn-toggle-pw').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            const inputElem = document.getElementById(targetId);
            const icon = e.currentTarget.querySelector('i');

            if (inputElem.type === 'password') {
                inputElem.type = 'text';
                icon.className = 'fa-regular fa-eye-slash';
            } else {
                inputElem.type = 'password';
                icon.className = 'fa-regular fa-eye';
            }
        });
    });

    // Logout Handlers
    document.getElementById('btnSidebarLogout').addEventListener('click', openLogoutModal);
    document.getElementById('btnDropdownLogout').addEventListener('click', openLogoutModal);
    document.getElementById('btnCancelLogout').addEventListener('click', closeLogoutModal);
    document.getElementById('btnConfirmLogout').addEventListener('click', executeLogout);

    // Deactivation Handlers
    document.getElementById('btnRequestDeactivation').addEventListener('click', openDeactivationModal);
    document.getElementById('btnCloseDeactModal').addEventListener('click', closeDeactivationModal);
    document.getElementById('btnOkDeactivation').addEventListener('click', closeDeactivationModal);

    // Retry Load
    document.getElementById('btnRetryLoad').addEventListener('click', loadSellerProfile);

    // Keyboard Accessibility (ESC key to close active modal)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeChangePasswordModal();
            closeLogoutModal();
            closeDeactivationModal();
        }
    });
}

function setupNavigationAndSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const btnHamburger = document.getElementById('btnHamburger');
    const btnCloseSidebar = document.getElementById('btnCloseSidebar');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }

    if (btnHamburger) btnHamburger.addEventListener('click', openSidebar);
    if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
}

function setupDropdownMenus() {
    const btnUserMenu = document.getElementById('btnUserMenu');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    if (btnUserMenu && userDropdownMenu) {
        btnUserMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = btnUserMenu.getAttribute('aria-expanded') === 'true';
            btnUserMenu.setAttribute('aria-expanded', !isExpanded);
            userDropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            userDropdownMenu.classList.remove('show');
            btnUserMenu.setAttribute('aria-expanded', 'false');
        });
    }
}

/* ==========================================================================
   UI UTILITY FUNCTIONS
   ========================================================================== */

function showLoadingState() {
    document.getElementById('profileSkeleton').classList.remove('hidden');
    document.getElementById('profileContainer').classList.add('hidden');
    document.getElementById('profileErrorCard').classList.add('hidden');
}

function hideLoadingState() {
    document.getElementById('profileSkeleton').classList.add('hidden');
    document.getElementById('profileContainer').classList.remove('hidden');
}

function showErrorState(message) {
    document.getElementById('profileSkeleton').classList.add('hidden');
    document.getElementById('profileContainer').classList.add('hidden');
    document.getElementById('profileErrorCard').classList.remove('hidden');
    document.getElementById('errorCardMessage').textContent = message || 'A server error occurred.';
}

function showFieldError(elementId, message) {
    const elem = document.getElementById(elementId);
    if (elem) elem.textContent = message;
}

function clearValidationErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconClass = type === 'success' ? 'fa-circle-check text-success' :
        type === 'error' ? 'fa-circle-xmark text-danger' : 'fa-circle-info';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(0.5rem)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function getSellerInitials(shopName) {
    if (!shopName) return 'AO';
    const words = shopName.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return shopName.substring(0, 2).toUpperCase();
}

function formatDateTime(isoString) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-LK', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    } catch (e) {
        return isoString;
    }
}

/**
 * XSS Prevention helper for dynamic user input strings.
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&rawgt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}