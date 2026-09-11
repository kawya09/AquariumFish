/**
 * Aquarium Fish - Customer Profile Module
 * Handlers for Profile View/Edit, Password Security, Modals, and API Interoperability.
 */

// Global Configuration
const API_BASE_URL = 'http://localhost:8080/api';
const USE_MOCK_DATA = true; // Toggle to false when connected to real Spring Boot Backend

// Global Profile State Variables
let currentProfileData = null;
let isEditMode = false;
let hasUnsavedChanges = false;

// DEMO DATA ONLY - Used when USE_MOCK_DATA is true
const MOCK_PROFILE_DATA = {
    "id": 5,
    "firstName": "John",
    "lastName": "Perera",
    "phone": "0712345678",
    "address": "123 Example Road, Colombo, Sri Lanka",
    "user": {
        "id": 20,
        "username": "johnperera",
        "email": "john@example.com",
        "status": "ACTIVE",
        "role": {
            "id": 1,
            "roleName": "CUSTOMER"
        }
    },
    "statistics": {
        "totalOrders": 12,
        "completedOrders": 8,
        "pendingOrders": 2,
        "reviewCount": 5
    },
    "recentOrders": [
        { "id": 1025, "date": "2026-08-12", "status": "DELIVERED", "total": 9000.00 },
        { "id": 1021, "date": "2026-07-28", "status": "DELIVERED", "total": 4500.00 },
        { "id": 1018, "date": "2026-06-15", "status": "PENDING", "total": 12300.00 }
    ]
};

// Initialize Application on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNavbar();
    checkAuthentication();
    initializeProfile();
    initializePasswordForm();
    initializeLogout();
    initializeDeleteAccount();
    initializeUnsavedChangesWarning();
    updateCartCount();
});

/* ==========================================================================
   1. Authentication & API Fetching
   ========================================================================== */

function checkAuthentication() {
    const token = localStorage.getItem('token');
    // Basic frontend protection check
    if (!token && !USE_MOCK_DATA) {
        window.location.href = 'login.html?redirect=profile.html';
    }
}

async function initializeProfile() {
    showLoadingState();
    try {
        if (USE_MOCK_DATA) {
            // Simulate API network latency
            await new Promise(resolve => setTimeout(resolve, 600));
            currentProfileData = MOCK_PROFILE_DATA;
        } else {
            currentProfileData = await fetchProfileFromAPI();
        }

        renderProfile(currentProfileData);
        showContentState();
    } catch (error) {
        console.error('Error fetching profile:', error);
        showErrorState(error.message || 'Unable to load profile.');
    }
}

async function fetchProfileFromAPI() {
    // TODO: Replace with actual Spring Boot profile endpoint.
    // TODO: Backend must determine the authenticated customer identity.
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/customers/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html?redirect=profile.html';
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
    }

    return await response.json();
}

/* ==========================================================================
   2. Render Functions
   ========================================================================== */

function renderProfile(data) {
    if (!data) return;

    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const email = data.user?.email || '—';
    const status = data.user?.status || 'ACTIVE';
    const roleName = data.user?.role?.roleName || 'CUSTOMER';

    // Header Details
    document.getElementById('headerFullName').textContent = `${firstName} ${lastName}`.trim() || 'Valued Customer';
    document.getElementById('headerEmail').textContent = email;
    document.getElementById('userAvatar').textContent = getUserInitials(firstName, lastName);

    // Status Badges
    renderAccountStatus(status);
    renderAccountRole(roleName);

    // Populate Info Form Fields
    document.getElementById('firstName').value = firstName;
    document.getElementById('lastName').value = lastName;
    document.getElementById('email').value = email;
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('address').value = data.address || '';

    // Render Stats & Recent Orders
    renderStatistics(data.statistics);
    renderRecentOrders(data.recentOrders || []);
}

function getUserInitials(firstName, lastName) {
    const f = firstName ? firstName.charAt(0) : '';
    const l = lastName ? lastName.charAt(0) : '';
    return (f + l).toUpperCase() || 'CU';
}

function renderAccountStatus(status) {
    const statusBadge = document.getElementById('headerStatusBadge');
    const avatarBadge = document.getElementById('avatarStatusBadge');

    statusBadge.textContent = status;

    if (status === 'ACTIVE') {
        statusBadge.className = 'badge badge-status';
        avatarBadge.style.backgroundColor = 'var(--success-green)';
    } else {
        statusBadge.className = 'badge badge-danger';
        avatarBadge.style.backgroundColor = 'var(--danger-red)';
    }
}

function renderAccountRole(role) {
    const roleBadge = document.getElementById('headerRoleBadge');
    roleBadge.innerHTML = `<i class="fa-solid fa-user-shield"></i> ${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}`;
}

function renderStatistics(stats) {
    // TODO: Replace demo statistics with real Spring Boot API stats endpoint response if handled separately.
    document.getElementById('statTotalOrders').textContent = stats?.totalOrders ?? 0;
    document.getElementById('statCompletedOrders').textContent = stats?.completedOrders ?? 0;
    document.getElementById('statPendingOrders').textContent = stats?.pendingOrders ?? 0;
    document.getElementById('statReviews').textContent = stats?.reviewCount ?? 0;
}

function renderRecentOrders(orders) {
    const container = document.getElementById('recentOrdersContainer');

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-box-open empty-state-icon"></i>
                <h3>No orders yet</h3>
                <p>Start exploring our aquarium fish collection and place your first order.</p>
                <a href="fish.html" class="btn btn-primary btn-sm" style="margin-top:10px;">Shop Fish</a>
            </div>
        `;
        return;
    }

    let html = `
        <div class="recent-orders-table-wrapper">
            <table class="recent-orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
    `;

    orders.forEach(order => {
        html += `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${formatDate(order.date)}</td>
                <td><span class="order-status-pill status-${order.status}">${order.status}</span></td>
                <td>${formatCurrency(order.total)}</td>
                <td><a href="order-details.html?id=${order.id}" class="btn btn-link">Details</a></td>
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

/* ==========================================================================
   3. Edit & Save Profile Information Form Logic
   ========================================================================== */

const editProfileBtn = document.getElementById('editProfileBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const profileForm = document.getElementById('profileForm');
const formActions = document.getElementById('formActions');

editProfileBtn.addEventListener('click', enterEditMode);
cancelEditBtn.addEventListener('click', cancelEdit);

function enterEditMode() {
    isEditMode = true;
    toggleFormFields(false); // Enable fields
    editProfileBtn.style.display = 'none';
    formActions.style.display = 'flex';
}

function exitEditMode() {
    isEditMode = false;
    hasUnsavedChanges = false;
    toggleFormFields(true); // Disable fields
    editProfileBtn.style.display = 'inline-flex';
    formActions.style.display = 'none';
    clearFormErrors();
}

function cancelEdit() {
    // Revert values to current data
    renderProfile(currentProfileData);
    exitEditMode();
    showToast('Info', 'No changes were made.');
}

function toggleFormFields(disabled) {
    document.getElementById('firstName').disabled = disabled;
    document.getElementById('lastName').disabled = disabled;
    document.getElementById('phone').disabled = disabled;
    document.getElementById('address').disabled = disabled;
    // Note: Email remains read-only as specified
}

profileForm.addEventListener('input', () => {
    if (isEditMode) {
        hasUnsavedChanges = true;
    }
});

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    const saveBtn = document.getElementById('saveProfileBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const spinner = saveBtn.querySelector('.spinner');

    saveBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';

    const updatedPayload = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        email: document.getElementById('email').value.trim()
    };

    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 800));
            currentProfileData.firstName = updatedPayload.firstName;
            currentProfileData.lastName = updatedPayload.lastName;
            currentProfileData.phone = updatedPayload.phone;
            currentProfileData.address = updatedPayload.address;
        } else {
            // TODO: Replace with Spring Boot PUT API call.
            // TODO: Backend must verify authenticated customer modifying their own profile.
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/customers/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedPayload)
            });

            if (!response.ok) throw new Error('Failed to update profile on backend.');
            currentProfileData = await response.json();
        }

        renderProfile(currentProfileData);
        exitEditMode();
        showToast('Success', 'Profile updated successfully.');
    } catch (err) {
        console.error('Profile save error:', err);
        showToast('Error', 'Unable to update your profile.');
    } finally {
        saveBtn.disabled = false;
        btnText.style.display = 'inline-block';
        spinner.style.display = 'none';
    }
});

function validateProfileForm() {
    clearFormErrors();
    let isValid = true;

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!firstName) {
        showFieldError('firstNameError', 'First name is required.');
        isValid = false;
    }

    if (!lastName) {
        showFieldError('lastNameError', 'Last name is required.');
        isValid = false;
    }

    if (!phone) {
        showFieldError('phoneError', 'Phone number is required.');
        isValid = false;
    } else if (!validatePhone(phone)) {
        showFieldError('phoneError', 'Enter a valid Sri Lankan phone format (e.g. 0712345678 or +94712345678).');
        isValid = false;
    }

    if (!address) {
        showFieldError('addressError', 'Delivery address is required.');
        isValid = false;
    }

    return isValid;
}

function validatePhone(phone) {
    const sriLankanPhoneRegex = /^(?:\+94|0)7\d{8}$/;
    return sriLankanPhoneRegex.test(phone);
}

/* ==========================================================================
   4. Password Change Form Logic & Strength
   ========================================================================== */

function initializePasswordForm() {
    const passwordForm = document.getElementById('passwordForm');
    const newPasswordInput = document.getElementById('newPassword');

    // Password Visibility Toggle Buttons
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fa-regular fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fa-regular fa-eye';
            }
        });
    });

    // Password Strength Meter Listener
    newPasswordInput.addEventListener('input', (e) => {
        updatePasswordStrength(e.target.value);
    });

    passwordForm.addEventListener('submit', handlePasswordChangeSubmit);
}

function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const score = calculatePasswordStrength(password);

    if (!password) {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = '#e2e8f0';
        strengthText.textContent = 'Strength: None';
        return;
    }

    switch (score) {
        case 1:
            strengthBar.style.width = '25%';
            strengthBar.style.backgroundColor = 'var(--danger-red)';
            strengthText.textContent = 'Strength: Weak';
            break;
        case 2:
            strengthBar.style.width = '50%';
            strengthBar.style.backgroundColor = 'var(--warning-amber)';
            strengthText.textContent = 'Strength: Fair';
            break;
        case 3:
            strengthBar.style.width = '75%';
            strengthBar.style.backgroundColor = '#3b82f6';
            strengthText.textContent = 'Strength: Good';
            break;
        case 4:
            strengthBar.style.width = '100%';
            strengthBar.style.backgroundColor = 'var(--success-green)';
            strengthText.textContent = 'Strength: Strong';
            break;
    }
}

function calculatePasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

async function handlePasswordChangeSubmit(e) {
    e.preventDefault();
    clearFormErrors();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    let isValid = true;

    if (!currentPassword) {
        showFieldError('currentPasswordError', 'Current password is required.');
        isValid = false;
    }

    if (!newPassword) {
        showFieldError('newPasswordError', 'New password is required.');
        isValid = false;
    } else if (newPassword.length < 8) {
        showFieldError('newPasswordError', 'Password must be at least 8 characters long.');
        isValid = false;
    }

    if (newPassword !== confirmNewPassword) {
        showFieldError('confirmNewPasswordError', 'New passwords do not match.');
        isValid = false;
    }

    if (!isValid) return;

    const changeBtn = document.getElementById('changePasswordBtn');
    const btnText = changeBtn.querySelector('.btn-text');
    const spinner = changeBtn.querySelector('.spinner');

    changeBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';

    try {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 800));
        } else {
            // TODO: PUT /api/auth/change-password endpoint.
            // TODO: Backend must hash new password securely and verify current password.
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            if (response.status === 400) {
                showFieldError('currentPasswordError', 'Your current password is incorrect.');
                throw new Error('Current password incorrect.');
            }

            if (!response.ok) throw new Error('Unable to change password right now.');
        }

        document.getElementById('passwordForm').reset();
        updatePasswordStrength('');
        showToast('Success', 'Password changed successfully.');
    } catch (err) {
        console.error('Password change error:', err);
        if (err.message !== 'Current password incorrect.') {
            showToast('Error', 'Unable to change your password right now. Please try again.');
        }
    } finally {
        changeBtn.disabled = false;
        btnText.style.display = 'inline-block';
        spinner.style.display = 'none';
    }
}

/* ==========================================================================
   5. Logout & Account Deletion Modals
   ========================================================================== */

function initializeLogout() {
    const logoutModal = document.getElementById('logoutModal');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const closeBtns = document.querySelectorAll('.closeLogoutModalBtn');

    const openModal = () => logoutModal.classList.add('show');
    const closeModal = () => logoutModal.classList.remove('show');

    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', openModal);
    if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', openModal);
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    confirmLogoutBtn.addEventListener('click', logout);

    // ESC Key to close modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && logoutModal.classList.contains('show')) closeModal();
    });
}

function logout() {
    // TODO: If backend logout token revocation endpoint exists, call it here.
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    showToast('Success', 'Logged out successfully.');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

function initializeDeleteAccount() {
    const deleteModal = document.getElementById('deleteAccountModal');
    const openBtn = document.getElementById('openDeleteAccountModalBtn');
    const confirmBtn = document.getElementById('confirmDeleteAccountBtn');
    const closeBtns = document.querySelectorAll('.closeDeleteModalBtn');

    const openModal = () => deleteModal.classList.add('show');
    const closeModal = () => deleteModal.classList.remove('show');

    if (openBtn) openBtn.addEventListener('click', openModal);
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    confirmBtn.addEventListener('click', async () => {
        closeModal();
        showToast('Info', 'Account deletion request received. Contact support to proceed.');
        // TODO: Future API Implementation: DELETE /api/customers/me
    });
}

/* ==========================================================================
   6. UI Utilities, Toast, & Navigation
   ========================================================================== */

function initializeNavbar() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });
    }
}

function initializeUnsavedChangesWarning() {
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}

function updateCartCount() {
    // TODO: GET /api/cart endpoint integration
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        cartBadge.textContent = '5'; // Demo cart item count
    }
}

function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type.toLowerCase()}`;

    let icon = 'fa-circle-info';
    if (type === 'Success') icon = 'fa-circle-check';
    if (type === 'Error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function showFieldError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) errorEl.textContent = message;
}

function clearFormErrors() {
    document.querySelectorAll('.error-text').forEach(el => el.textContent = '');
}

function showLoadingState() {
    document.getElementById('profileLoading').style.display = 'block';
    document.getElementById('profileContainer').style.display = 'none';
    document.getElementById('profileError').style.display = 'none';
}

function showContentState() {
    document.getElementById('profileLoading').style.display = 'none';
    document.getElementById('profileContainer').style.display = 'block';
    document.getElementById('profileError').style.display = 'none';
}

function showErrorState(msg) {
    document.getElementById('profileLoading').style.display = 'none';
    document.getElementById('profileContainer').style.display = 'none';
    const errorCard = document.getElementById('profileError');
    document.getElementById('errorMessage').textContent = msg;
    errorCard.style.display = 'block';

    document.getElementById('retryFetchBtn').onclick = () => initializeProfile();
}

function formatCurrency(amount) {
    return `LKR ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}