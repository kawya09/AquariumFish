/**
 * ============================================================================
 * Aquarium Fish Spring Boot E-Commerce - Main Shared JavaScript Layer
 * js/main.js
 * ============================================================================
 */

(function(window, document) {
    'use strict';

    // 1. Configuration
    const APP_CONFIG = {
        API_BASE_URL: "http://localhost:8080/api",
        // USE_MOCK_DATA = true is for frontend demonstration.
        // When connecting the Spring Boot backend, change to: false
        USE_MOCK_DATA: true,
        CURRENCY: "LKR",
        LOCALE: "en-LK",
        CART_STORAGE_KEY: "aquarium_fish_cart",
        TOKEN_STORAGE_KEY: "aquarium_fish_token",
        USER_STORAGE_KEY: "aquarium_fish_user",
        DEBUG: false
    };

    // 2. Namespace Initialization
    const AquariumFish = {
        config: APP_CONFIG,
        storage: {},
        utils: {},
        api: {},
        auth: {},
        ui: {}
    };

    // 3. Storage Helpers
    AquariumFish.storage = {
        get(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                return null;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                return false;
            }
        },
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        },
        sessionGet(key) {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                return null;
            }
        },
        sessionSet(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                return false;
            }
        },
        sessionRemove(key) {
            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    // 4. URL Helpers
    AquariumFish.utils.getApiUrl = function(endpoint) {
        const base = APP_CONFIG.API_BASE_URL.replace(/\/+$/, '');
        const path = endpoint.replace(/^\/+/, '');
        return `${base}/${path}`;
    };

    AquariumFish.utils.getQueryParam = function(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    };

    AquariumFish.utils.getQueryParams = function() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    };

    AquariumFish.utils.setQueryParam = function(name, value) {
        const url = new URL(window.location.href);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    };

    AquariumFish.utils.removeQueryParam = function(name) {
        const url = new URL(window.location.href);
        url.searchParams.delete(name);
        window.history.replaceState({}, '', url);
    };

    AquariumFish.utils.isSafeInternalPath = function(path) {
        if (!path || typeof path !== 'string') return false;
        if (path.startsWith('javascript:') || path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
            return false;
        }
        return path.startsWith('/');
    };

    // 5. DOM Utilities
    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

    AquariumFish.utils.$ = $;
    AquariumFish.utils.$$ = $$;

    AquariumFish.utils.debounce = function(callback, delay = 300) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => callback.apply(this, args), delay);
        };
    };

    AquariumFish.utils.throttle = function(callback, delay = 200) {
        let lastTime = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastTime >= delay) {
                lastTime = now;
                callback.apply(this, args);
            }
        };
    };

    AquariumFish.utils.safeJsonParse = function(value, fallback = null) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return fallback;
        }
    };

    // 6. Formatting Utilities
    AquariumFish.utils.formatCurrency = function(amount) {
        const num = Number(amount);
        if (isNaN(num)) return `LKR 0.00`;
        try {
            return new Intl.NumberFormat(APP_CONFIG.LOCALE, {
                style: "currency",
                currency: APP_CONFIG.CURRENCY
            }).format(num);
        } catch (e) {
            return `LKR ${num.toFixed(2)}`;
        }
    };

    AquariumFish.utils.formatNumber = function(value) {
        const num = Number(value);
        if (isNaN(num)) return '0';
        try {
            return new Intl.NumberFormat(APP_CONFIG.LOCALE).format(num);
        } catch (e) {
            return String(num);
        }
    };

    AquariumFish.utils.formatDate = function(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return String(dateStr);
        try {
            return new Intl.DateTimeFormat(APP_CONFIG.LOCALE, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }).format(date);
        } catch (e) {
            return date.toISOString().split('T')[0];
        }
    };

    AquariumFish.utils.formatDateTime = function(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return String(dateStr);
        try {
            return new Intl.DateTimeFormat(APP_CONFIG.LOCALE, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return date.toISOString();
        }
    };

    AquariumFish.utils.formatRelativeDate = function(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return String(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return AquariumFish.utils.formatDate(dateStr);
    };

    // 7. Security Utilities
    AquariumFish.utils.escapeHtml = function(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    AquariumFish.utils.getSafeImageUrl = function(imageUrl, fallback = "assets/images/fish-placeholder.jpg") {
        if (!imageUrl || typeof imageUrl !== 'string') return fallback;
        const trimmed = imageUrl.trim();
        if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
            return fallback;
        }
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
            return trimmed;
        }
        return fallback;
    };

    AquariumFish.utils.initImageFallbacks = function() {
        document.addEventListener('error', function(event) {
            const target = event.target;
            if (target && target.tagName === 'IMG') {
                if (target.dataset.fallbackApplied) return;
                target.dataset.fallbackApplied = 'true';
                target.src = "assets/images/fish-placeholder.jpg";
            }
        }, true);
    };

    // 8. Authentication Utilities
    AquariumFish.auth.getAuthToken = function() {
        return AquariumFish.storage.get(APP_CONFIG.TOKEN_STORAGE_KEY);
    };

    AquariumFish.auth.saveAuthToken = function(token) {
        AquariumFish.storage.set(APP_CONFIG.TOKEN_STORAGE_KEY, token);
    };

    AquariumFish.auth.clearAuthToken = function() {
        AquariumFish.storage.remove(APP_CONFIG.TOKEN_STORAGE_KEY);
    };

    AquariumFish.auth.getCurrentUser = function() {
        const user = AquariumFish.storage.get(APP_CONFIG.USER_STORAGE_KEY);
        if (!user || typeof user !== 'object') return null;
        return {
            id: user.id || null,
            username: user.username || '',
            email: user.email || '',
            role: AquariumFish.auth.normalizeRole(user.role),
            status: user.status || 'ACTIVE',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            shopName: user.shopName || ''
        };
    };

    AquariumFish.auth.saveCurrentUser = function(user) {
        if (!user) return;
        const sanitized = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: AquariumFish.auth.normalizeRole(user.role),
            status: user.status,
            firstName: user.firstName,
            lastName: user.lastName,
            shopName: user.shopName
        };
        AquariumFish.storage.set(APP_CONFIG.USER_STORAGE_KEY, sanitized);
        window.dispatchEvent(new CustomEvent("auth:updated"));
    };

    AquariumFish.auth.clearCurrentUser = function() {
        AquariumFish.storage.remove(APP_CONFIG.USER_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent("auth:updated"));
    };

    AquariumFish.auth.isAuthenticated = function() {
        return !!AquariumFish.auth.getAuthToken() && !!AquariumFish.auth.getCurrentUser();
    };

    AquariumFish.auth.normalizeRole = function(role) {
        if (!role || typeof role !== 'string') return 'CUSTOMER';
        const upper = role.toUpperCase().trim();
        if (upper.includes('ADMIN')) return 'ADMIN';
        if (upper.includes('SELLER')) return 'SELLER';
        return 'CUSTOMER';
    };

    AquariumFish.auth.getCurrentUserRole = function() {
        const user = AquariumFish.auth.getCurrentUser();
        return user ? user.role : 'GUEST';
    };

    AquariumFish.auth.hasRole = function(role) {
        const currentRole = AquariumFish.auth.getCurrentUserRole();
        return currentRole === AquariumFish.auth.normalizeRole(role);
    };

    AquariumFish.auth.hasAnyRole = function(roles) {
        if (!Array.isArray(roles)) return false;
        return roles.some(r => AquariumFish.auth.hasRole(r));
    };

    AquariumFish.auth.isCustomer = function() {
        return AquariumFish.auth.hasRole('CUSTOMER');
    };

    AquariumFish.auth.isSeller = function() {
        return AquariumFish.auth.hasRole('SELLER');
    };

    AquariumFish.auth.isAdmin = function() {
        return AquariumFish.auth.hasRole('ADMIN');
    };

    AquariumFish.auth.logoutUser = function() {
        AquariumFish.auth.clearAuthToken();
        AquariumFish.auth.clearCurrentUser();
        AquariumFish.storage.remove(APP_CONFIG.CART_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent("cart:updated"));

        // Determine correct login path based on depth
        const isInNested = window.location.pathname.includes('/seller/') || window.location.pathname.includes('/admin/');
        const loginPath = isInNested ? '../login.html' : 'login.html';
        window.location.href = `${loginPath}?logout=true`;
    };

    // 9. Page Protection & Navigation Redirection
    AquariumFish.auth.redirectToLogin = function() {
        const currentPath = window.location.pathname + window.location.search;
        const isInNested = window.location.pathname.includes('/seller/') || window.location.pathname.includes('/admin/');
        const loginPath = isInNested ? '../login.html' : 'login.html';
        const encoded = encodeURIComponent(currentPath);
        window.location.href = `${loginPath}?redirect=${encoded}`;
    };

    AquariumFish.auth.requireAuthentication = function() {
        if (!AquariumFish.auth.isAuthenticated()) {
            AquariumFish.auth.redirectToLogin();
            return false;
        }
        return true;
    };

    AquariumFish.auth.requireRole = function(role) {
        if (!AquariumFish.auth.requireAuthentication()) return false;
        if (!AquariumFish.auth.hasRole(role)) {
            const isInNested = window.location.pathname.includes('/seller/') || window.location.pathname.includes('/admin/');
            window.location.href = isInNested ? '../index.html' : 'index.html';
            return false;
        }
        return true;
    };

    AquariumFish.auth.requireAnyRole = function(roles) {
        if (!AquariumFish.auth.requireAuthentication()) return false;
        if (!AquariumFish.auth.hasAnyRole(roles)) {
            const isInNested = window.location.pathname.includes('/seller/') || window.location.pathname.includes('/admin/');
            window.location.href = isInNested ? '../index.html' : 'index.html';
            return false;
        }
        return true;
    };

    // 10. API Helper
    AquariumFish.auth.getAuthHeaders = function() {
        const token = AquariumFish.auth.getAuthToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    AquariumFish.api.request = async function(endpoint, options = {}) {
        const url = AquariumFish.utils.getApiUrl(endpoint);
        const method = (options.method || 'GET').toUpperCase();

        const headers = {
            ...AquariumFish.auth.getAuthHeaders(),
            ...(options.headers || {})
        };

        const config = {
            method,
            headers
        };

        if (options.body && method !== 'GET' && method !== 'HEAD') {
            config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        }

        const timeoutMs = options.timeout || 15000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        config.signal = controller.signal;

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            if (response.status === 401) {
                AquariumFish.auth.clearAuthToken();
                AquariumFish.auth.clearCurrentUser();
                if (!window.location.pathname.includes('login.html')) {
                    AquariumFish.auth.redirectToLogin();
                }
                throw new Error("Your session has expired. Please log in again.");
            }

            if (response.status === 403) {
                throw new Error("You do not have permission to perform this action.");
            }

            const contentType = response.headers.get("content-type");
            let data = null;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMsg = (typeof data === 'object' && data !== null && (data.message || data.error))
                    || (typeof data === 'string' && data.length > 0 ? data : `Request failed with status ${response.status}`);
                const err = new Error(errorMsg);
                err.status = response.status;
                err.data = data;
                throw err;
            }

            return {
                status: response.status,
                ok: response.ok,
                data: data
            };

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error("The request timed out. Please check your connection and try again.");
            }
            if (!error.status) {
                throw new Error("Unable to connect to the server. Please check your internet connection and try again.");
            }
            throw error;
        }
    };

    // 11. UI & Toast Notification System
    AquariumFish.ui.showToast = function(message, type = "info", duration = 3500) {
        let container = $('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; max-width: 350px;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let bg = '#333';
        if (type === 'success') bg = '#10b981';
        else if (type === 'error') bg = '#ef4444';
        else if (type === 'warning') bg = '#f59e0b';
        else if (type === 'info') bg = '#3b82f6';

        toast.style.cssText = `background: ${bg}; color: #fff; padding: 12px 16px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 0.9rem; opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease; transform: translateY(20px); display: flex; align-items: center; justify-content: space-between; gap: 10px; pointer-events: auto;`;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');

        const textSpan = document.createElement('span');
        textSpan.textContent = message;
        toast.appendChild(textSpan);

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = 'background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; padding: 0; line-height: 1;';
        closeBtn.onclick = () => removeToast(toast);
        toast.appendChild(closeBtn);

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        const timer = setTimeout(() => {
            removeToast(toast);
        }, duration);

        function removeToast(t) {
            clearTimeout(timer);
            t.style.opacity = '0';
            t.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (t.parentElement) t.parentElement.removeChild(t);
            }, 300);
        }
    };

    // 12. Modal Helpers
    AquariumFish.ui.initModals = function() {
        document.addEventListener('click', function(e) {
            const openTrigger = e.target.closest('[data-modal-open]');
            if (openTrigger) {
                const modalId = openTrigger.getAttribute('data-modal-open');
                const modal = $(`#${modalId}`) || $(`[data-modal="${modalId}"]`);
                if (modal) AquariumFish.ui.openModal(modal);
            }

            const closeTrigger = e.target.closest('[data-modal-close]') || e.target.closest('.modal-overlay');
            if (closeTrigger && (e.target === closeTrigger || closeTrigger.hasAttribute('data-modal-close'))) {
                const modal = e.target.closest('.modal') || $('.modal.is-open, .modal.open');
                if (modal) AquariumFish.ui.closeModal(modal);
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const openModal = $('.modal.is-open, .modal.open');
                if (openModal) AquariumFish.ui.closeModal(openModal);
            }
        });
    };

    AquariumFish.ui.openModal = function(modal) {
        if (!modal) return;
        modal.classList.add('is-open', 'open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    AquariumFish.ui.closeModal = function(modal) {
        if (!modal) return;
        modal.classList.remove('is-open', 'open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    // 13. Loading Helpers
    AquariumFish.ui.setLoading = function(element, isLoading) {
        if (!element) return;
        if (isLoading) {
            element.classList.add('is-loading', 'loading');
            element.setAttribute('aria-busy', 'true');
        } else {
            element.classList.remove('is-loading', 'loading');
            element.removeAttribute('aria-busy');
        }
    };

    AquariumFish.ui.setButtonLoading = function(button, isLoading, loadingText = "Loading...") {
        if (!button) return;
        if (isLoading) {
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.innerHTML;
            }
            button.disabled = true;
            button.innerHTML = `<span class="spinner" style="display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:6px;vertical-align:middle;"></span>${loadingText}`;
        } else {
            button.disabled = false;
            if (button.dataset.originalText) {
                button.innerHTML = button.dataset.originalText;
                delete button.dataset.originalText;
            }
        }
    };

    // 14. Navbar & Mobile Menu Coordination
    AquariumFish.ui.initNavbar = function() {
        const toggleBtn = $('.navbar-toggle, .mobile-menu-toggle');
        const mobileMenu = $('.mobile-menu, .nav-links');

        if (toggleBtn && mobileMenu) {
            toggleBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const isOpen = mobileMenu.classList.toggle('is-open') || mobileMenu.classList.toggle('open');
                toggleBtn.setAttribute('aria-expanded', isOpen);
            });

            document.addEventListener('click', function(e) {
                if (!mobileMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
                    mobileMenu.classList.remove('is-open', 'open');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    mobileMenu.classList.remove('is-open', 'open');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Account Dropdown
        const accountToggle = $('.account-toggle');
        const accountDropdown = $('.account-dropdown');

        if (accountToggle && accountDropdown) {
            accountToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                const isOpen = accountDropdown.classList.toggle('is-open') || accountDropdown.classList.toggle('open');
                accountToggle.setAttribute('aria-expanded', isOpen);
            });

            document.addEventListener('click', function(e) {
                if (!accountDropdown.contains(e.target) && !accountToggle.contains(e.target)) {
                    accountDropdown.classList.remove('is-open', 'open');
                    accountToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Logout Triggers
        document.addEventListener('click', function(e) {
            const logoutTrigger = e.target.closest('[data-logout]');
            if (logoutTrigger) {
                e.preventDefault();
                AquariumFish.auth.logoutUser();
            }
        });

        AquariumFish.ui.updateAuthNavigation();
    };

    AquariumFish.ui.updateAuthNavigation = function() {
        const isAuth = AquariumFish.auth.isAuthenticated();
        const user = AquariumFish.auth.getCurrentUser();
        const role = user ? user.role : 'GUEST';

        $$('[data-auth-only]').forEach(el => {
            el.style.display = isAuth ? '' : 'none';
        });

        $$('[data-guest-only]').forEach(el => {
            el.style.display = isAuth ? 'none' : '';
        });

        $$('[data-role]').forEach(el => {
            const allowedRoles = el.getAttribute('data-role').split(',').map(r => r.trim().toUpperCase());
            if (isAuth && allowedRoles.includes(role)) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });

        if (isAuth && user) {
            $$('[data-user-name]').forEach(el => {
                el.textContent = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username;
            });
            $$('[data-user-email]').forEach(el => {
                el.textContent = user.email;
            });
        }
    };

    AquariumFish.ui.setActiveNavigation = function() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        $$('.nav-links a, .navbar a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPath)) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    };

    // 15. Cart Badge & Count Management
    AquariumFish.utils.getCartItemCount = function(cart) {
        if (!cart) return 0;
        if (Array.isArray(cart)) {
            return cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
        }
        if (cart.items && Array.isArray(cart.items)) {
            return cart.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
        }
        return 0;
    };

    AquariumFish.ui.updateCartBadge = async function() {
        const badges = $$('.cart-count, .cart-badge, [data-cart-count]');
        if (badges.length === 0) return;

        let totalCount = 0;

        if (APP_CONFIG.USE_MOCK_DATA || !AquariumFish.auth.isAuthenticated()) {
            const localCart = AquariumFish.storage.get(APP_CONFIG.CART_STORAGE_KEY);
            totalCount = AquariumFish.utils.getCartItemCount(localCart);
        } else {
            try {
                const response = await AquariumFish.api.request('/cart');
                totalCount = AquariumFish.utils.getCartItemCount(response.data);
            } catch (e) {
                const localCart = AquariumFish.storage.get(APP_CONFIG.CART_STORAGE_KEY);
                totalCount = AquariumFish.utils.getCartItemCount(localCart);
            }
        }

        badges.forEach(badge => {
            badge.textContent = totalCount;
            badge.style.display = totalCount > 0 ? 'inline-block' : '';
        });
    };

    // 16. Form Utilities
    AquariumFish.utils.serializeForm = function(form) {
        if (!form || !(form instanceof HTMLFormElement)) return {};
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    };

    AquariumFish.utils.clearForm = function(form) {
        if (form && form instanceof HTMLFormElement) {
            form.reset();
        }
    };

    AquariumFish.utils.setFormValues = function(form, data) {
        if (!form || !data) return;
        for (const [key, value] of Object.entries(data)) {
            const field = form.elements[key];
            if (field) {
                field.value = value !== null && value !== undefined ? value : '';
            }
        }
    };

    // 17. Validation Helpers
    AquariumFish.utils.isRequired = function(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        return true;
    };

    AquariumFish.utils.isValidEmail = function(email) {
        if (!email || typeof email !== 'string') return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.trim());
    };

    AquariumFish.utils.isValidPhone = function(phone) {
        if (!phone || typeof phone !== 'string') return false;
        const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
        return /^\d{9,12}$/.test(cleaned);
    };

    AquariumFish.utils.isStrongPassword = function(password) {
        if (!password || typeof password !== 'string') return false;
        return password.length >= 6;
    };

    // 18. Status & Rating Helpers
    AquariumFish.utils.formatStatusLabel = function(status) {
        if (!status) return '';
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };

    AquariumFish.utils.getStatusClass = function(status) {
        if (!status) return 'status-default';
        const upper = status.toUpperCase();
        if (['DELIVERED', 'PAID', 'ACTIVE', 'CONFIRMED'].includes(upper)) return 'status-success';
        if (['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(upper)) return 'status-warning';
        if (['CANCELLED', 'FAILED', 'INACTIVE', 'OUT_OF_STOCK'].includes(upper)) return 'status-danger';
        return 'status-default';
    };

    AquariumFish.utils.normalizeRating = function(rating) {
        const num = Number(rating);
        if (isNaN(num)) return 5;
        return Math.max(1, Math.min(5, Math.round(num)));
    };

    AquariumFish.utils.getRatingStars = function(rating) {
        const norm = AquariumFish.utils.normalizeRating(rating);
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= norm ? '★' : '☆';
        }
        return stars;
    };

    // 19. Global Event Listeners & Initialization
    window.addEventListener('cart:updated', () => {
        AquariumFish.ui.updateCartBadge();
    });

    window.addEventListener('auth:updated', () => {
        AquariumFish.ui.updateAuthNavigation();
    });

    document.addEventListener("DOMContentLoaded", () => {
        AquariumFish.utils.initImageFallbacks();
        AquariumFish.ui.initNavbar();
        AquariumFish.ui.initModals();
        AquariumFish.ui.setActiveNavigation();
        AquariumFish.ui.updateCartBadge();
    });

    // Expose Global Namespace
    window.AquariumFish = AquariumFish;

})(window, document);