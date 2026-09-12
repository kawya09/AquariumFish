/**
 * js/auth.js
 * Shared authentication and authorization frontend module for the Aquarium Fish application.
 */

(function () {
    if (window.__aquariumFishAuthInitialized) {
        return;
    }
    window.__aquariumFishAuthInitialized = true;

    // Fallback global namespace if main.js is missing or not fully loaded
    window.AquariumFish = window.AquariumFish || {};

    // Fallback configuration
    const fallbackConfig = {
        API_BASE_URL: "http://localhost:8080/api",
        USE_MOCK_DATA: true,
        TOKEN_STORAGE_KEY: "aquarium_fish_token",
        USER_STORAGE_KEY: "aquarium_fish_user"
    };

    function getConfig() {
        return window.AquariumFish.config || window.APP_CONFIG || fallbackConfig;
    }

    // Defensive helper to safely access local/session storage
    function safeStorageGet(key) {
        try {
            return localStorage.getItem(key) || sessionStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function safeStorageSet(key, value, persistent = true) {
        try {
            if (persistent) {
                localStorage.setItem(key, value);
            } else {
                sessionStorage.setItem(key, value);
            }
        } catch (e) {
            // Storage quota or private browsing error handled gracefully
        }
    }

    function safeStorageRemove(key) {
        try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        } catch (e) {
            // Handled gracefully
        }
    }

    // Role and Status Normalization
    function normalizeRole(role) {
        if (!role) return null;
        const clean = String(role).toUpperCase().replace(/^ROLE_/, "");
        if (["CUSTOMER", "SELLER", "ADMIN"].includes(clean)) {
            return clean;
        }
        return null;
    }

    function normalizeStatus(status) {
        if (!status) return null;
        return String(status).toUpperCase();
    }

    function normalizeUser(user) {
        if (!user || typeof user !== "object") return null;
        return {
            id: user.id || user.userId || null,
            username: user.username || "",
            email: user.email || "",
            status: normalizeStatus(user.status || "ACTIVE"),
            role: normalizeRole(user.role || (user.roles && user.roles[0]) || "CUSTOMER"),
            firstName: user.firstName || user.customer?.firstName || "",
            lastName: user.lastName || user.customer?.lastName || "",
            shopName: user.shopName || user.seller?.shopName || "",
            adminName: user.adminName || user.admin?.adminName || "",
            phone: user.phone || user.customer?.phone || user.seller?.phone || "",
            address: user.address || user.customer?.address || user.seller?.address || ""
        };
    }

    // State Management
    let currentUser = null;
    let authToken = null;

    function restoreAuthState() {
        const config = getConfig();
        const storedToken = safeStorageGet(config.TOKEN_STORAGE_KEY);
        const storedUserJson = safeStorageGet(config.USER_STORAGE_KEY);

        if (storedToken) {
            authToken = storedToken;
        }

        if (storedUserJson) {
            try {
                const parsed = JSON.parse(storedUserJson);
                currentUser = normalizeUser(parsed);
            } catch (e) {
                currentUser = null;
                safeStorageRemove(config.USER_STORAGE_KEY);
            }
        }
    }

    function isAuthenticated() {
        return Boolean(authToken && currentUser);
    }

    function getCurrentUser() {
        return currentUser;
    }

    function getCurrentUserRole() {
        return currentUser ? currentUser.role : null;
    }

    function hasRole(role) {
        const normalized = normalizeRole(role);
        if (!normalized || !currentUser) return false;
        return currentUser.role === normalized;
    }

    function hasAnyRole(roles) {
        if (!Array.isArray(roles) || !currentUser) return false;
        return roles.some(r => hasRole(r));
    }

    function isCustomer() {
        return hasRole("CUSTOMER");
    }

    function isSeller() {
        return hasRole("SELLER");
    }

    function isAdmin() {
        return hasRole("ADMIN");
    }

    function getDisplayName(userObj) {
        const u = userObj || currentUser;
        if (!u) return "Guest";
        if (u.role === "SELLER" && u.shopName) return u.shopName;
        if (u.role === "ADMIN" && u.adminName) return u.adminName;
        if (u.firstName || u.lastName) {
            return `${u.firstName || ""} ${u.lastName || ""}`.trim();
        }
        return u.username || "User";
    }

    function getInitials(userObj) {
        const name = getDisplayName(userObj);
        if (!name || name === "Guest") return "U";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    function clearAuthState() {
        const config = getConfig();
        authToken = null;
        currentUser = null;
        safeStorageRemove(config.TOKEN_STORAGE_KEY);
        safeStorageRemove(config.USER_STORAGE_KEY);
    }

    // API Request helper integration fallback
    async function executeApiRequest(endpoint, options = {}) {
        const config = getConfig();
        const url = `${config.API_BASE_URL}${endpoint}`;

        if (typeof window.AquariumFish.apiRequest === "function") {
            return window.AquariumFish.apiRequest(endpoint, options);
        }

        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        const contentType = response.headers.get("content-type");
        let data = null;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const errorObj = new Error(typeof data === "string" ? data : (data.message || data.error || "API request failed"));
            errorObj.status = response.status;
            errorObj.response = data;
            throw errorObj;
        }

        return data;
    }

    // Login Function
    async function login(credentials, options = {}) {
        const config = getConfig();
        const username = credentials.username || credentials.email;
        const password = credentials.password;

        if (!username || !password) {
            throw new Error("Username and password are required.");
        }

        if (config.USE_MOCK_DATA) {
            // Mock authentication mode handling
            await new Promise(resolve => setTimeout(resolve, 500));
            let mockUser = {
                id: 1,
                username: username,
                email: username.includes("@") ? username : `${username}@example.com`,
                status: "ACTIVE",
                role: "CUSTOMER",
                firstName: "Demo",
                lastName: "User"
            };

            if (username.toLowerCase().includes("admin")) {
                mockUser.role = "ADMIN";
                mockUser.adminName = "Admin User";
            } else if (username.toLowerCase().includes("seller")) {
                mockUser.role = "SELLER";
                mockUser.shopName = "Demo Aquarium Shop";
            }

            authToken = "mock-jwt-token-" + Date.now();
            currentUser = normalizeUser(mockUser);

            const remember = options.rememberMe || false;
            safeStorageSet(config.TOKEN_STORAGE_KEY, authToken, remember);
            safeStorageSet(config.USER_STORAGE_KEY, JSON.stringify(currentUser), remember);

            window.dispatchEvent(new CustomEvent("auth:updated"));
            window.dispatchEvent(new CustomEvent("auth:login", { detail: currentUser }));
            return currentUser;
        }

        // TODO: Confirm the final Spring Boot login endpoint and DTO.
        const response = await executeApiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password })
        });

        // Normalize response structures (token / accessToken / user)
        const token = response.token || response.accessToken;
        const rawUser = response.user || response;

        if (!token) {
            throw new Error("Authentication response did not contain a valid token.");
        }

        authToken = token;
        currentUser = normalizeUser(rawUser);

        if (currentUser && currentUser.status === "INACTIVE" || currentUser?.status === "SUSPENDED" || currentUser?.status === "BLOCKED") {
            clearAuthState();
            throw new Error("Your account is not active.");
        }

        const remember = options.rememberMe || false;
        safeStorageSet(config.TOKEN_STORAGE_KEY, authToken, remember);
        safeStorageSet(config.USER_STORAGE_KEY, JSON.stringify(currentUser), remember);

        window.dispatchEvent(new CustomEvent("auth:updated"));
        window.dispatchEvent(new CustomEvent("auth:login", { detail: currentUser }));
        return currentUser;
    }

    // Logout Function
    async function logout(options = {}) {
        const config = getConfig();
        try {
            if (!config.USE_MOCK_DATA) {
                // TODO: Enable backend logout/revocation when supported by the Spring Boot API.
                await executeApiRequest("/auth/logout", { method: "POST" }).catch(() => {});
            }
        } catch (e) {
            // Ignore backend failure on logout
        }

        clearAuthState();
        window.dispatchEvent(new CustomEvent("auth:updated"));
        window.dispatchEvent(new CustomEvent("auth:logout"));

        const redirectUrl = options.redirect || "login.html";
        window.location.href = redirectUrl;
    }

    // Register Customer Function
    async function registerCustomer(data, options = {}) {
        const config = getConfig();

        if (!data.firstName || !data.lastName || !data.username || !data.email || !data.password) {
            throw new Error("Please fill in all required registration fields.");
        }

        if (data.password !== data.confirmPassword) {
            throw new Error("Passwords do not match.");
        }

        if (config.USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 600));
            return {
                success: true,
                message: "Demo registration completed locally."
            };
        }

        // TODO: Confirm the final Spring Boot register endpoint and DTO.
        const payload = {
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            email: data.email,
            phone: data.phone || "",
            address: data.address || "",
            password: data.password
        };

        const response = await executeApiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        return response;
    }

    // Session Refresh / Current User Fetch
    async function refreshCurrentUser() {
        const config = getConfig();
        if (!authToken) return null;

        if (config.USE_MOCK_DATA) {
            return currentUser;
        }

        try {
            // TODO: Confirm the final authenticated-user endpoint.
            const response = await executeApiRequest("/auth/me", { method: "GET" });
            const rawUser = response.user || response;
            currentUser = normalizeUser(rawUser);
            safeStorageSet(config.USER_STORAGE_KEY, JSON.stringify(currentUser), true);
            return currentUser;
        } catch (err) {
            if (err.status === 401) {
                clearAuthState();
                window.dispatchEvent(new CustomEvent("auth:updated"));
            }
            return null;
        }
    }

    // Safe Redirect Verification
    function isSafeRedirect(path) {
        if (!path || typeof path !== "string") return false;
        if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("//") || path.startsWith("javascript:") || path.startsWith("data:")) {
            return false;
        }
        return true;
    }

    function getRedirectUrl(defaultUrl = "index.html") {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get("redirect");
        if (redirectParam && isSafeRedirect(redirectParam)) {
            return redirectParam;
        }
        return defaultUrl;
    }

    // Role-based Redirect Logic
    function getDashboardRouteForRole(role) {
        const r = normalizeRole(role);
        if (r === "ADMIN") return "admin/admin-dashboard.html";
        if (r === "SELLER") return "seller/seller-dashboard.html";
        return "index.html";
    }

    // Page Protection Helpers
    function canAccessRole(requiredRole) {
        return hasRole(requiredRole);
    }

    function canAccessAnyRole(requiredRoles) {
        return hasAnyRole(requiredRoles);
    }

    function requireAuth() {
        if (!isAuthenticated()) {
            const currentPath = encodeURIComponent(window.location.pathname.split("/").pop() || "index.html");
            window.location.href = `login.html?redirect=${currentPath}`;
            return false;
        }
        return true;
    }

    function requireGuest() {
        if (isAuthenticated()) {
            window.location.href = getDashboardRouteForRole(getCurrentUserRole());
            return false;
        }
        return true;
    }

    function requireRole(role) {
        if (!requireAuth()) return false;
        if (!hasRole(role)) {
            showSafeToast("You do not have permission to access this page.");
            setTimeout(() => {
                window.location.href = getDashboardRouteForRole(getCurrentUserRole());
            }, 1000);
            return false;
        }
        return true;
    }

    function requireAnyRole(roles) {
        if (!requireAuth()) return false;
        if (!hasAnyRole(roles)) {
            showSafeToast("You do not have permission to access this page.");
            setTimeout(() => {
                window.location.href = getDashboardRouteForRole(getCurrentUserRole());
            }, 1000);
            return false;
        }
        return true;
    }

    // Route Protection Execution Based on Page Name
    function checkPageAccess() {
        const path = window.location.pathname.toLowerCase();

        const isLoginPage = path.includes("login.html");
        const isRegisterPage = path.includes("register.html");

        if (isLoginPage || isRegisterPage) {
            requireGuest();
            return;
        }

        const isAdminRoute = path.includes("/admin/") || path.endsWith("admin-dashboard.html");
        const isSellerRoute = path.includes("/seller/") || path.endsWith("seller-dashboard.html");

        const customerProtectedRoutes = [
            "cart.html", "checkout.html", "payment.html", "orders.html",
            "order-details.html", "delivery.html", "deliveries.html", "profile.html", "reviews.html"
        ];
        const isCustomerProtectedRoute = customerProtectedRoutes.some(r => path.includes(r));

        if (isAdminRoute) {
            requireRole("ADMIN");
        } else if (isSellerRoute) {
            requireRole("SELLER");
        } else if (isCustomerProtectedRoute) {
            requireAuth();
        }
    }

    // Toast Utility Fallback
    function showSafeToast(message, type = "info") {
        if (typeof window.AquariumFish.showToast === "function") {
            window.AquariumFish.showToast(message, type);
            return;
        }
        // Minimal fallback notification banner
        let container = document.getElementById("authToastContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "authToastContainer";
            container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
            document.body.appendChild(container);
        }
        const toast = document.createElement("div");
        toast.style.cssText = "background: #222; color: #fff; padding: 12px 20px; border-radius: 6px; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: opacity 0.3s ease;";
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // UI Updates based on Auth State
    function updateAuthUI() {
        const authOnlyElements = document.querySelectorAll("[data-auth-only]");
        const guestOnlyElements = document.querySelectorAll("[data-guest-only]");
        const nameElements = document.querySelectorAll("[data-user-name]");
        const emailElements = document.querySelectorAll("[data-user-email]");
        const avatarElements = document.querySelectorAll("[data-user-avatar]");
        const roleElements = document.querySelectorAll("[data-role]");

        const authenticated = isAuthenticated();
        const role = getCurrentUserRole();
        const user = getCurrentUser();

        authOnlyElements.forEach(el => {
            el.style.display = authenticated ? "" : "none";
        });

        guestOnlyElements.forEach(el => {
            el.style.display = authenticated ? "none" : "";
        });

        if (authenticated && user) {
            const displayName = getDisplayName(user);
            nameElements.forEach(el => {
                el.textContent = displayName;
            });
            emailElements.forEach(el => {
                el.textContent = user.email || "";
            });
            roleElements.forEach(el => {
                el.textContent = role || "";
                if (el.getAttribute("data-role") && el.getAttribute("data-role") !== role) {
                    el.style.display = "none";
                }
            });
            avatarElements.forEach(el => {
                const initials = getInitials(user);
                if (el.tagName === "IMG") {
                    // Only use avatar if provided by backend or fallback
                    if (user.avatarUrl) {
                        el.src = user.avatarUrl;
                    }
                } else {
                    el.textContent = initials;
                }
            });
        }

        // Logout button bindings
        document.querySelectorAll("[data-logout]").forEach(btn => {
            if (!btn.__hasLogoutListener) {
                btn.__hasLogoutListener = true;
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    logout();
                });
            }
        });
    }

    // Form Initializations
    function initLoginForm() {
        const form = document.getElementById("loginForm") || document.querySelector("form[data-auth='login']");
        if (!form) return;

        const errorContainer = document.getElementById("loginError") || form.querySelector("[data-auth-error]") || form.querySelector(".form-error");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (form.classList.contains("submitting")) return;

            const usernameInput = form.querySelector("[name='username'], [name='email']");
            const passwordInput = form.querySelector("[name='password']");
            const rememberInput = form.querySelector("[name='rememberMe'], [name='remember']");
            const submitBtn = form.querySelector("button[type='submit']") || form.querySelector("input[type='submit']");

            const username = usernameInput ? usernameInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value : "";
            const rememberMe = rememberInput ? rememberInput.checked : false;

            if (errorContainer) errorContainer.textContent = "";

            if (!username || !password) {
                if (errorContainer) errorContainer.textContent = "Please enter both username/email and password.";
                else showSafeToast("Please enter both username/email and password.", "error");
                return;
            }

            form.classList.add("submitting");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.textContent;
                submitBtn.textContent = "Logging in...";
            }

            try {
                const user = await login({ username, password }, { rememberMe });
                showSafeToast("Welcome back!", "success");

                // Clear password reference safely
                if (passwordInput) passwordInput.value = "";

                const targetUrl = getRedirectUrl(getDashboardRouteForRole(user.role));
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 500);
            } catch (err) {
                const errorMsg = err.message || "Invalid username or password.";
                if (errorContainer) {
                    errorContainer.textContent = errorMsg;
                } else {
                    showSafeToast(errorMsg, "error");
                }
            } finally {
                form.classList.remove("submitting");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset.originalText || "Login";
                }
            }
        });

        // Password visibility toggles
        initPasswordToggles(form);
    }

    function initRegisterForm() {
        const form = document.getElementById("registerForm") || document.querySelector("form[data-auth='register']");
        if (!form) return;

        const errorContainer = document.getElementById("registerError") || form.querySelector("[data-auth-error]") || form.querySelector(".form-error");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (form.classList.contains("submitting")) return;

            const firstNameInput = form.querySelector("[name='firstName']");
            const lastNameInput = form.querySelector("[name='lastName']");
            const usernameInput = form.querySelector("[name='username']");
            const emailInput = form.querySelector("[name='email']");
            const phoneInput = form.querySelector("[name='phone']");
            const addressInput = form.querySelector("[name='address']");
            const passwordInput = form.querySelector("[name='password']");
            const confirmPasswordInput = form.querySelector("[name='confirmPassword']");
            const submitBtn = form.querySelector("button[type='submit']") || form.querySelector("input[type='submit']");

            const formData = {
                firstName: firstNameInput ? firstNameInput.value.trim() : "",
                lastName: lastNameInput ? lastNameInput.value.trim() : "",
                username: usernameInput ? usernameInput.value.trim() : "",
                email: emailInput ? emailInput.value.trim() : "",
                phone: phoneInput ? phoneInput.value.trim() : "",
                address: addressInput ? addressInput.value.trim() : "",
                password: passwordInput ? passwordInput.value : "",
                confirmPassword: confirmPasswordInput ? confirmPasswordInput.value : ""
            };

            if (errorContainer) errorContainer.textContent = "";

            if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
                if (errorContainer) errorContainer.textContent = "Please fill in all required fields.";
                else showSafeToast("Please fill in all required fields.", "error");
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                if (errorContainer) errorContainer.textContent = "Passwords do not match.";
                else showSafeToast("Passwords do not match.", "error");
                return;
            }

            form.classList.add("submitting");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.textContent;
                submitBtn.textContent = "Registering...";
            }

            try {
                await registerCustomer(formData);
                showSafeToast("Account created successfully. Please log in.", "success");

                if (passwordInput) passwordInput.value = "";
                if (confirmPasswordInput) confirmPasswordInput.value = "";

                setTimeout(() => {
                    window.location.href = "login.html?registered=true";
                }, 1000);
            } catch (err) {
                const errorMsg = err.message || "Registration failed. This username or email may already be registered.";
                if (errorContainer) {
                    errorContainer.textContent = errorMsg;
                } else {
                    showSafeToast(errorMsg, "error");
                }
            } finally {
                form.classList.remove("submitting");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset.originalText || "Register";
                }
            }
        });

        initPasswordToggles(form);
    }

    function initPasswordToggles(container) {
        const toggles = container.querySelectorAll("[data-password-toggle], .password-toggle");
        toggles.forEach(toggle => {
            if (toggle.__hasToggleListener) return;
            toggle.__hasToggleListener = true;
            toggle.addEventListener("click", () => {
                const targetSelector = toggle.getAttribute("data-target") || "input[name='password']";
                const passwordInput = container.querySelector(targetSelector);
                if (passwordInput) {
                    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
                    passwordInput.setAttribute("type", type);
                    toggle.setAttribute("aria-pressed", type === "text");
                }
            });
        });
    }

    // Global Event Listeners & Cross-Tab Storage Synchronization
    window.addEventListener("storage", (event) => {
        const config = getConfig();
        if (event.key === config.TOKEN_STORAGE_KEY || event.key === config.USER_STORAGE_KEY) {
            restoreAuthState();
            updateAuthUI();
        }
    });

    // Initialization Sequence on DOM Content Loaded
    function initAuthModule() {
        restoreAuthState();
        checkPageAccess();
        updateAuthUI();
        initLoginForm();
        initRegisterForm();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAuthModule);
    } else {
        initAuthModule();
    }

    // Expose Public API
    window.AquariumFish.auth = {
        login,
        logout,
        registerCustomer,
        isAuthenticated,
        getCurrentUser,
        getCurrentUserRole,
        hasRole,
        hasAnyRole,
        isCustomer,
        isSeller,
        isAdmin,
        requireAuth,
        requireRole,
        requireAnyRole,
        requireGuest,
        normalizeUser,
        normalizeRole,
        getDisplayName,
        getInitials,
        updateAuthUI,
        restoreAuthState,
        refreshCurrentUser,
        clearAuthState
    };

})();