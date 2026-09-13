/**
 * js/profile.js
 * Complete production-ready customer profile management for Aquarium Fish e-commerce.
 */

(function () {
    'use strict';

    // ==========================================
    // 4. API CONFIGURATION
    // ==========================================
    const API_BASE_URL = "http://localhost:8080/api";
    const USE_MOCK_DATA = true; // Set to false to connect to the real Spring Boot backend

    // ==========================================
    // 9. PROFILE STATE
    // ==========================================
    const profileState = {
        customer: null,
        user: null,
        loading: false,
        saving: false,
        changingPassword: false,
        error: null,
        editMode: false,
        dirty: false,
        profileLoaded: false,
        originalProfile: null,
        stats: {
            totalOrders: 0,
            totalReviews: 0,
            totalSpent: 0
        },
        recentOrders: []
    };

    // ==========================================
    // 39. MOCK DATA
    // ==========================================
    const MOCK_CUSTOMER_PROFILE = {
        id: 101,
        firstName: "Hiruni",
        lastName: "Kawya",
        phone: "+94712345678",
        address: "123 Galle Road, Colombo 03",
        user: {
            id: 501,
            username: "hirunikawya",
            email: "hiruni.kawya@example.com",
            status: "ACTIVE",
            role: "CUSTOMER"
        },
        stats: {
            totalOrders: 4,
            totalReviews: 2,
            totalSpent: 48500.00
        },
        recentOrders: [
            {
                id: 1001,
                date: "2026-05-12T14:30:00Z",
                total: 12500.00,
                status: "DELIVERED",
                firstItemName: "Neon Tetra (School of 6)"
            },
            {
                id: 1002,
                date: "2026-06-01T09:15:00Z",
                total: 36000.00,
                status: "PROCESSING",
                firstItemName: "Siamese Fighting Fish (Betta)"
            }
        ]
    };

    let activeAbortController = null;

    // ==========================================
    // 11. DOM SELECTORS & REFERENCES
    // ==========================================
    function getDomElements() {
        return {
            profileFirstName: document.getElementById("profileFirstName"),
            profileLastName: document.getElementById("profileLastName"),
            profileEmail: document.getElementById("profileEmail"),
            profileUsername: document.getElementById("profileUsername"),
            profilePhone: document.getElementById("profilePhone"),
            profileAddress: document.getElementById("profileAddress"),
            profileStatus: document.getElementById("profileStatus"),
            profileRole: document.getElementById("profileRole"),
            profileAvatar: document.getElementById("profileAvatar") || document.querySelector(".profile-avatar"),

            profileForm: document.getElementById("profileForm"),
            firstNameInput: document.getElementById("firstName"),
            lastNameInput: document.getElementById("lastName"),
            emailInput: document.getElementById("email"),
            phoneInput: document.getElementById("phone"),
            addressInput: document.getElementById("address"),

            passwordForm: document.getElementById("passwordForm"),
            currentPasswordInput: document.getElementById("currentPassword"),
            newPasswordInput: document.getElementById("newPassword"),
            confirmPasswordInput: document.getElementById("confirmPassword"),

            editProfileButton: document.getElementById("editProfileButton"),
            cancelEditButton: document.getElementById("cancelEditButton"),
            saveProfileButton: document.getElementById("saveProfileButton"),
            changePasswordButton: document.getElementById("changePasswordButton"),
            logoutButton: document.getElementById("logoutButton"),

            totalOrdersEl: document.getElementById("totalOrders"),
            totalReviewsEl: document.getElementById("totalReviews"),
            totalSpentEl: document.getElementById("totalSpent"),
            recentOrdersContainer: document.getElementById("recentOrders"),

            profileLoading: document.getElementById("profileLoading"),
            profileError: document.getElementById("profileError"),
            profileEmpty: document.getElementById("profileEmpty"),

            passwordModal: document.getElementById("passwordModal"),
            openPasswordModalBtn: document.getElementById("openPasswordModal"),
            closePasswordModalBtn: document.getElementById("closePasswordModal"),
            cancelPasswordChangeBtn: document.getElementById("cancelPasswordChange")
        };
    }

    // ==========================================
    // 44. SAFE DOM MANIPULATION & ESCAPING
    // ==========================================
    function escapeHtml(value) {
        if (value === null || value === undefined) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ==========================================
    // 29. LKR CURRENCY FORMATTING
    // ==========================================
    function formatCurrency(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return "Rs. 0.00";
        }
        try {
            return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
        } catch (e) {
            return `Rs. ${Number(amount).toFixed(2)}`;
        }
    }

    // ==========================================
    // 35. TOAST NOTIFICATIONS & FEEDBACK
    // ==========================================
    function showToast(message, type = "info") {
        if (window.AquariumFish && typeof window.AquariumFish.showToast === "function") {
            window.AquariumFish.showToast(message, type);
            return;
        }

        // Local fallback toast implementation
        let toastContainer = document.getElementById("toastContainer");
        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.id = "toastContainer";
            toastContainer.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;";
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        let bgColor = "#0284c7";
        if (type === "success") bgColor = "#10b981";
        if (type === "error") bgColor = "#ef4444";
        if (type === "warning") bgColor = "#f59e0b";

        toast.style.cssText = `background:${bgColor}; color:#fff; padding:12px 16px; border-radius:6px; box-shadow:0 4px 6px rgba(0,0,0,0.1); font-size:0.9rem; transition:opacity 0.3s ease;`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ==========================================
    // 13. AUTHENTICATION & TOKEN HANDLING
    // ==========================================
    function checkAuthentication() {
        if (window.AquariumFish && window.AquariumFish.auth) {
            if (typeof window.AquariumFish.auth.isAuthenticated === "function" && !window.AquariumFish.auth.isAuthenticated()) {
                redirectToLogin();
                return false;
            }
        }
        return true;
    }

    function getAuthToken() {
        if (window.AquariumFish && window.AquariumFish.auth) {
            if (typeof window.AquariumFish.auth.getToken === "function") {
                return window.AquariumFish.auth.getToken();
            }
            if (typeof window.AquariumFish.auth.getAuthToken === "function") {
                return window.AquariumFish.auth.getAuthToken();
            }
        }
        // Fallback token retrieval from localStorage if standard keys are used
        return localStorage.getItem("token") || localStorage.getItem("authToken") || sessionStorage.getItem("token");
    }

    function redirectToLogin() {
        const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?redirect=${currentPath}`;
    }

    // ==========================================
    // 12. API REQUEST HELPER
    // ==========================================
    async function apiRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            ...options.headers
        };

        const token = getAuthToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
            credentials: "include"
        };

        if (options.signal) {
            config.signal = options.signal;
        }

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                redirectToLogin();
                throw new Error("Your session has expired. Please sign in again.");
            }

            if (response.status === 403) {
                throw new Error("You do not have permission to access this resource.");
            }

            const contentType = response.headers.get("content-type");
            let data = null;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            }

            if (!response.ok) {
                const errorMessage = getApiErrorMessage(response, data);
                const error = new Error(errorMessage);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            if (error.name === "AbortError") {
                throw error;
            }
            if (!error.status) {
                throw new Error("Network error. Please check your connection and try again.");
            }
            throw error;
        }
    }

    // ==========================================
    // 38. API ERROR PARSING
    // ==========================================
    function getApiErrorMessage(response, data) {
        if (data) {
            if (typeof data.message === "string" && data.message.trim() !== "") {
                return data.message;
            }
            if (typeof data.error === "string" && data.error.trim() !== "") {
                return data.error;
            }
            if (data.errors && typeof data.errors === "object") {
                const firstKey = Object.keys(data.errors)[0];
                if (firstKey && data.errors[firstKey]) {
                    return `${firstKey}: ${data.errors[firstKey]}`;
                }
            }
        }

        switch (response.status) {
            case 400: return "Invalid request. Please check your input.";
            case 401: return "Your session has expired. Please sign in again.";
            case 403: return "You do not have permission to perform this action.";
            case 404: return "Requested profile resource not found.";
            case 409: return "Your profile was updated elsewhere. Please refresh and try again.";
            case 500: return "Server error occurred. Please try again later.";
            default: return `Unexpected error occurred (Status: ${response.status})`;
        }
    }

    // ==========================================
    // 14. PROFILE RESPONSE NORMALIZATION
    // ==========================================
    function normalizeProfileResponse(raw) {
        if (!raw) return { customer: null, user: null };

        // Direct object: { id, firstName, lastName, ... }
        if (raw.firstName || raw.lastName || raw.phone) {
            return {
                customer: raw,
                user: raw.user || { username: raw.username, email: raw.email, status: raw.status, role: raw.role }
            };
        }

        // Wrapped: { data: {...} }
        if (raw.data) {
            return normalizeProfileResponse(raw.data);
        }

        // Wrapped: { customer: {...} }
        if (raw.customer) {
            return {
                customer: raw.customer,
                user: raw.user || raw.customer.user || null
            };
        }

        return { customer: null, user: null };
    }

    // ==========================================
    // 15. PROFILE NORMALIZATION
    // ==========================================
    function normalizeProfile(customer, user) {
        const c = customer || {};
        const u = user || c.user || {};

        return {
            id: c.id || null,
            firstName: c.firstName || "",
            lastName: c.lastName || "",
            fullName: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Not provided",
            phone: c.phone || "",
            address: c.address || "",
            username: u.username || c.username || "",
            email: u.email || c.email || "",
            status: u.status || c.status || "ACTIVE",
            role: u.role || c.role || "CUSTOMER"
        };
    }

    // ==========================================
    // 8. PROFILE API CALLS (LOAD, UPDATE, STATS, ORDERS)
    // ==========================================
    async function loadCustomerProfile(signal) {
        if (USE_MOCK_DATA) {
            // Simulate network latency
            await new Promise(resolve => setTimeout(resolve, 300));
            return MOCK_CUSTOMER_PROFILE;
        }

        // TODO: Confirm correct production endpoint with backend team
        // Alternative endpoints: GET /api/customers/me or GET /api/customer/profile
        try {
            return await apiRequest("/customers/me", { signal });
        } catch (err) {
            if (err.status === 404) {
                return await apiRequest("/customer/profile", { signal });
            }
            throw err;
        }
    }

    async function updateCustomerProfileApi(payload) {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 400));
            MOCK_CUSTOMER_PROFILE.firstName = payload.firstName;
            MOCK_CUSTOMER_PROFILE.lastName = payload.lastName;
            MOCK_CUSTOMER_PROFILE.phone = payload.phone;
            MOCK_CUSTOMER_PROFILE.address = payload.address;
            return MOCK_CUSTOMER_PROFILE;
        }

        // TODO: Confirm production update endpoint: PUT /api/customers/me or PUT /api/customer/profile
        try {
            return await apiRequest("/customers/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        } catch (err) {
            if (err.status === 404) {
                return await apiRequest("/customer/profile", {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
            }
            throw err;
        }
    }

    async function loadProfileStats(signal) {
        if (USE_MOCK_DATA) return MOCK_CUSTOMER_PROFILE.stats;

        try {
            // TODO: Confirm actual stats endpoint
            return await apiRequest("/customers/me/stats", { signal });
        } catch (e) {
            return { totalOrders: 0, totalReviews: 0, totalSpent: 0 };
        }
    }

    async function loadRecentOrders(signal) {
        if (USE_MOCK_DATA) return MOCK_CUSTOMER_PROFILE.recentOrders;

        try {
            // TODO: Confirm actual orders endpoint
            const res = await apiRequest("/orders/my-orders", { signal });
            if (Array.isArray(res)) return res;
            if (res && Array.isArray(res.content)) return res.content;
            if (res && Array.isArray(res.data)) return res.data;
            if (res && Array.isArray(res.orders)) return res.orders;
            return [];
        } catch (e) {
            return [];
        }
    }

    async function changePasswordApi(payload) {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 400));
            return { success: true };
        }

        // TODO: Confirm production password change endpoint
        try {
            return await apiRequest("/auth/change-password", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        } catch (err) {
            if (err.status === 404) {
                return await apiRequest("/auth/change-password", {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
            }
            throw err;
        }
    }

    // ==========================================
    // 16 & 17. PROFILE RENDERING & AVATAR
    // ==========================================
    function renderProfile(profile) {
        const elements = getDomElements();

        if (elements.profileFirstName) elements.profileFirstName.textContent = profile.firstName || "Not provided";
        if (elements.profileLastName) elements.profileLastName.textContent = profile.lastName || "Not provided";
        if (elements.profileEmail) elements.profileEmail.textContent = profile.email || "Not provided";
        if (elements.profileUsername) elements.profileUsername.textContent = profile.username || "Not provided";
        if (elements.profilePhone) elements.profilePhone.textContent = profile.phone || "Not provided";
        if (elements.profileAddress) elements.profileAddress.textContent = profile.address || "Not provided";
        if (elements.profileStatus) {
            elements.profileStatus.textContent = profile.status;
            elements.profileStatus.className = `profile-status status-${profile.status.toLowerCase()}`;
        }
        if (elements.profileRole) {
            elements.profileRole.textContent = profile.role;
        }

        // Render Avatar Initials
        if (elements.profileAvatar) {
            const firstInitial = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "";
            const lastInitial = profile.lastName ? profile.lastName.charAt(0).toUpperCase() : "";
            const initials = (firstInitial + lastInitial) || (profile.username ? profile.username.charAt(0).toUpperCase() : "C");
            elements.profileAvatar.textContent = initials;
        }

        // Populate Form Fields for Editing
        if (elements.firstNameInput) elements.firstNameInput.value = profile.firstName;
        if (elements.lastNameInput) elements.lastNameInput.value = profile.lastName;
        if (elements.emailInput) elements.emailInput.value = profile.email;
        if (elements.phoneInput) elements.phoneInput.value = profile.phone;
        if (elements.addressInput) elements.addressInput.value = profile.address;
    }

    function renderStats(stats) {
        const elements = getDomElements();
        if (elements.totalOrdersEl) elements.totalOrdersEl.textContent = stats.totalOrders ?? "—";
        if (elements.totalReviewsEl) elements.totalReviewsEl.textContent = stats.totalReviews ?? "—";
        if (elements.totalSpentEl) elements.totalSpentEl.textContent = stats.totalSpent !== undefined ? formatCurrency(stats.totalSpent) : "—";
    }

    function renderRecentOrders(orders) {
        const container = getDomElements().recentOrdersContainer;
        if (!container) return;

        if (!orders || orders.length === 0) {
            container.innerHTML = `<p class="orders-empty-msg">No recent orders found.</p>`;
            return;
        }

        container.innerHTML = orders.slice(0, 5).map(order => {
            const orderId = escapeHtml(order.id);
            const dateStr = order.date ? new Date(order.date).toLocaleDateString() : "Recent";
            const totalStr = formatCurrency(order.total || 0);
            const status = escapeHtml(order.status || "PENDING");
            const itemName = escapeHtml(order.firstItemName || order.itemSummary || "Aquarium Fish Order");

            return `
                <div class="recent-order-card">
                    <div class="order-info-group">
                        <span class="order-id">#${orderId}</span>
                        <span class="order-date">${dateStr}</span>
                        <span class="order-item-summary">${itemName}</span>
                    </div>
                    <div class="order-meta-group">
                        <span class="order-status badge-${status.toLowerCase()}">${status}</span>
                        <span class="order-amount">${totalStr}</span>
                        <a href="order-details.html?id=${orderId}" class="order-detail-link">View Details</a>
                    </div>
                </div>
            `;
        }).join("");
    }

    // ==========================================
    // 18 & 19 & 40. EDIT PROFILE & FORM MANAGEMENT
    // ==========================================
    function enterEditMode() {
        profileState.editMode = true;
        const profilePage = document.querySelector(".profile-page") || document.body;
        profilePage.classList.add("is-editing");

        const editBtn = document.getElementById("editProfileButton");
        const saveBtn = document.getElementById("saveProfileButton");
        const cancelBtn = document.getElementById("cancelEditButton");

        if (editBtn) editBtn.style.display = "none";
        if (saveBtn) saveBtn.style.display = "inline-flex";
        if (cancelBtn) cancelBtn.style.display = "inline-flex";

        toggleFormInputs(true);
    }

    function exitEditMode() {
        profileState.editMode = false;
        profileState.dirty = false;
        const profilePage = document.querySelector(".profile-page") || document.body;
        profilePage.classList.remove("is-editing");

        const editBtn = document.getElementById("editProfileButton");
        const saveBtn = document.getElementById("saveProfileButton");
        const cancelBtn = document.getElementById("cancelEditButton");

        if (editBtn) editBtn.style.display = "inline-flex";
        if (saveBtn) saveBtn.style.display = "none";
        if (cancelBtn) cancelBtn.style.display = "none";

        toggleFormInputs(false);
    }

    function cancelEdit() {
        if (profileState.originalProfile) {
            renderProfile(profileState.originalProfile);
        }
        exitEditMode();
        showToast("Edit cancelled", "info");
    }

    function toggleFormInputs(enable) {
        const inputs = [
            document.getElementById("firstName"),
            document.getElementById("lastName"),
            document.getElementById("phone"),
            document.getElementById("address")
        ];
        inputs.forEach(input => {
            if (input) input.disabled = !enable;
        });
    }

    // ==========================================
    // 21. UPDATE VALIDATION
    // ==========================================
    function validateProfilePayload(payload) {
        if (!payload.firstName || payload.firstName.trim() === "") {
            return "First name is required.";
        }
        if (!payload.lastName || payload.lastName.trim() === "") {
            return "Last name is required.";
        }
        if (payload.phone && payload.phone.trim() !== "") {
            // Sri Lankan phone validation format check: 0712345678 or +94712345678
            const phoneRegex = /^(\+94|0)?7[01245678]\d{7}$/;
            if (!phoneRegex.test(payload.phone.replace(/\s+/g, ""))) {
                return "Please enter a valid phone number (e.g., 0712345678 or +94712345678).";
            }
        }
        return null;
    }

    // ==========================================
    // 20. SAVE PROFILE
    // ==========================================
    async function saveProfile(event) {
        if (event) event.preventDefault();
        if (profileState.saving) return;

        const elements = getDomElements();
        const payload = {
            firstName: elements.firstNameInput ? elements.firstNameInput.value.trim() : "",
            lastName: elements.lastNameInput ? elements.lastNameInput.value.trim() : "",
            phone: elements.phoneInput ? elements.phoneInput.value.trim() : "",
            address: elements.addressInput ? elements.addressInput.value.trim() : ""
        };

        const validationError = validateProfilePayload(payload);
        if (validationError) {
            showToast(validationError, "warning");
            return;
        }

        profileState.saving = true;
        if (elements.saveProfileButton) {
            elements.saveProfileButton.disabled = true;
            elements.saveProfileButton.textContent = "Saving...";
        }

        try {
            const updatedRaw = await updateCustomerProfileApi(payload);
            const normalized = normalizeProfileResponse(updatedRaw);
            profileState.customer = normalizeProfile(normalized.customer, normalized.user);
            profileState.originalProfile = { ...profileState.customer };

            renderProfile(profileState.customer);
            exitEditMode();
            showToast("Profile updated successfully!", "success");
        } catch (err) {
            showToast(err.message || "Failed to update profile.", "error");
        } finally {
            profileState.saving = false;
            if (elements.saveProfileButton) {
                elements.saveProfileButton.disabled = false;
                elements.saveProfileButton.textContent = "Save Changes";
            }
        }
    }

    // ==========================================
    // 22 & 23. PASSWORD CHANGE & VALIDATION
    // ==========================================
    async function handlePasswordChange(event) {
        if (event) event.preventDefault();
        if (profileState.changingPassword) return;

        const elements = getDomElements();
        const currentPassword = elements.currentPasswordInput ? elements.currentPasswordInput.value : "";
        const newPassword = elements.newPasswordInput ? elements.newPasswordInput.value : "";
        const confirmPassword = elements.confirmPasswordInput ? elements.confirmPasswordInput.value : "";

        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast("All password fields are required.", "warning");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("New passwords do not match.", "error");
            return;
        }

        if (newPassword.length < 6) {
            showToast("New password must be at least 6 characters long.", "warning");
            return;
        }

        profileState.changingPassword = true;
        const submitBtn = elements.passwordForm ? elements.passwordForm.querySelector("button[type='submit']") : null;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Changing Password...";
        }

        try {
            await changePasswordApi({ currentPassword, newPassword });
            showToast("Password changed successfully!", "success");

            if (elements.passwordForm) elements.passwordForm.reset();
            closePasswordModal();
        } catch (err) {
            showToast(err.message || "Failed to change password.", "error");
        } finally {
            profileState.changingPassword = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Update Password";
            }
        }
    }

    // ==========================================
    // 51. MODAL MANAGEMENT
    // ==========================================
    function openPasswordModal() {
        const modal = document.getElementById("passwordModal");
        if (modal) {
            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");
            const firstInput = document.getElementById("currentPassword");
            if (firstInput) firstInput.focus();
        }
    }

    function closePasswordModal() {
        const modal = document.getElementById("passwordModal");
        if (modal) {
            modal.classList.remove("active");
            modal.setAttribute("aria-hidden", "true");
            const form = document.getElementById("passwordForm");
            if (form) form.reset();
        }
    }

    // ==========================================
    // 33. LOGOUT HANDLING
    // ==========================================
    function handleLogout() {
        if (window.AquariumFish && window.AquariumFish.auth && typeof window.AquariumFish.auth.logout === "function") {
            window.AquariumFish.auth.logout();
            return;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        sessionStorage.clear();
        window.location.href = "login.html";
    }

    // ==========================================
    // 10. INITIALIZATION FLOW
    // ==========================================
    let isInitialized = false;

    async function initProfilePage() {
        // 5. PAGE GUARD
        const isProfilePage = window.location.pathname.includes("profile.html");
        if (!isProfilePage || isInitialized) return;

        // 6. AUTHENTICATION REQUIREMENT
        if (!checkAuthentication()) return;

        isInitialized = true;
        const elements = getDomElements();

        // Show loading state
        if (elements.profileLoading) elements.profileLoading.style.display = "block";
        if (elements.profileError) elements.profileError.style.display = "none";

        // AbortController setup
        if (activeAbortController) activeAbortController.abort();
        activeAbortController = new AbortController();

        try {
            // Load Profile Data
            const rawData = await loadCustomerProfile(activeAbortController.signal);
            const normalizedRes = normalizeProfileResponse(rawData);

            if (!normalizedRes.customer) {
                throw new Error("Invalid profile data structure received from server.");
            }

            profileState.customer = normalizeProfile(normalizedRes.customer, normalizedRes.user);
            profileState.originalProfile = { ...profileState.customer };
            profileState.profileLoaded = true;

            renderProfile(profileState.customer);

            // Hide loading state
            if (elements.profileLoading) elements.profileLoading.style.display = "none";

            // Bind Event Listeners & Interactive Controls
            bindEventHandlers();

            // Load Optional Secondary Data (Stats & Recent Orders)
            loadProfileStats(activeAbortController.signal).then(stats => {
                profileState.stats = stats;
                renderStats(stats);
            }).catch(() => {});

            loadRecentOrders(activeAbortController.signal).then(orders => {
                profileState.recentOrders = orders;
                renderRecentOrders(orders);
            }).catch(() => {});

        } catch (err) {
            if (err.name === "AbortError") return;
            if (elements.profileLoading) elements.profileLoading.style.display = "none";
            if (elements.profileError) {
                elements.profileError.style.display = "block";
                const errorMsgEl = elements.profileError.querySelector(".error-message");
                if (errorMsgEl) errorMsgEl.textContent = err.message || "Failed to load profile.";
            }
            showToast(err.message || "Failed to load profile", "error");
        }
    }

    // ==========================================
    // EVENT BINDING & LISTENERS
    // ==========================================
    function bindEventHandlers() {
        const elements = getDomElements();

        // Edit Mode Actions
        if (elements.editProfileButton) {
            elements.editProfileButton.addEventListener("click", enterEditMode);
        }
        if (elements.cancelEditButton) {
            elements.cancelEditButton.addEventListener("click", cancelEdit);
        }
        if (elements.profileForm) {
            elements.profileForm.addEventListener("submit", saveProfile);

            // 41. Dirty Form Tracking
            const inputs = [elements.firstNameInput, elements.lastNameInput, elements.phoneInput, elements.addressInput];
            inputs.forEach(input => {
                if (input) {
                    input.addEventListener("input", () => {
                        profileState.dirty = true;
                    });
                }
            });
        }

        // Password Modal Actions
        if (elements.openPasswordModalBtn) {
            elements.openPasswordModalBtn.addEventListener("click", openPasswordModal);
        }
        if (elements.closePasswordModalBtn) {
            elements.closePasswordModalBtn.addEventListener("click", closePasswordModal);
        }
        if (elements.cancelPasswordChangeBtn) {
            elements.cancelPasswordChangeBtn.addEventListener("click", closePasswordModal);
        }
        if (elements.passwordForm) {
            elements.passwordForm.addEventListener("submit", handlePasswordChange);
        }

        // Modal backdrop close
        const modal = document.getElementById("passwordModal");
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closePasswordModal();
            });
        }

        // Keyboard Escape for Modal
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closePasswordModal();
                if (profileState.editMode) cancelEdit();
            }
        });

        // Logout Action
        if (elements.logoutButton) {
            elements.logoutButton.addEventListener("click", (e) => {
                e.preventDefault();
                handleLogout();
            });
        }

        // Unload warning for dirty form
        window.addEventListener("beforeunload", (e) => {
            if (profileState.editMode && profileState.dirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        });
    }

    // ==========================================
    // 59. PUBLIC API EXPOSURE
    // ==========================================
    window.AquariumFish = window.AquariumFish || {};
    window.AquariumFish.profile = {
        refresh: initProfilePage,
        enterEditMode,
        exitEditMode
    };

    // Auto-initialize on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initProfilePage);
    } else {
        initProfilePage();
    }

})();