/**
 * js/seller.js
 * Complete production-ready shared Seller module and utilities for Aquarium Fish e-commerce.
 */

(function () {
    'use strict';

    // ==========================================
    // 5. API CONFIGURATION
    // ==========================================
    const API_BASE_URL = "http://localhost:8080/api";
    const USE_MOCK_DATA = true; // Set to false for real Spring Boot backend integration
    const LOW_STOCK_THRESHOLD = 5;

    // ==========================================
    // 9. SELLER STATE
    // ==========================================
    const sellerState = {
        seller: null,
        user: null,
        authenticated: false,
        authorized: false,
        loading: false,
        error: null
    };

    // ==========================================
    // 38 & 39 & 40. MOCK DATA SETUP
    // ==========================================
    const MOCK_SELLER_DATA = {
        id: 7,
        shopName: "Oceanic Aquatics",
        phone: "0771234567",
        address: "Colombo, Sri Lanka",
        user: {
            id: 20,
            username: "oceanic_aquatics",
            email: "seller@example.com",
            status: "ACTIVE",
            role: "SELLER"
        }
    };

    const MOCK_FISH_DATA = [
        {
            id: 101,
            fishName: "Neon Tetra",
            description: "Bright blue and red schooling fish.",
            price: 350.00,
            stockQty: 4, // Low stock test
            seller: { id: 7, shopName: "Oceanic Aquatics" },
            category: { id: 1, name: "Freshwater" },
            breed: { id: 1, name: "Tetra" },
            size: { id: 1, name: "Small" },
            color: { id: 1, name: "Blue/Red" },
            images: [{ id: 1, imageUrl: "https://via.placeholder.com/150", isPrimary: true }]
        },
        {
            id: 102,
            fishName: "Siamese Fighting Fish (Betta)",
            description: "Vibrant coloration and flowing fins.",
            price: 1500.00,
            stockQty: 12,
            seller: { id: 7, shopName: "Oceanic Aquatics" },
            category: { id: 1, name: "Freshwater" },
            breed: { id: 2, name: "Betta" },
            size: { id: 2, name: "Medium" },
            color: { id: 2, name: "Red" },
            images: [{ id: 2, imageUrl: "https://via.placeholder.com/150", isPrimary: true }]
        }
    ];

    const MOCK_ORDERS_DATA = [
        {
            id: 1001,
            orderDate: "2026-09-10T11:00:00Z",
            status: "PROCESSING",
            items: [
                { fishId: 101, fishName: "Neon Tetra", quantity: 2, price: 350.00, sellerId: 7 },
                { fishId: 999, fishName: "Other Seller Fish", quantity: 1, price: 5000.00, sellerId: 9 }
            ]
        }
    ];

    // ==========================================
    // 8 & 48. AUTH.JS INTEGRATION & HELPERS
    // ==========================================
    function getAuthToken() {
        if (window.AquariumFish && window.AquariumFish.auth) {
            if (typeof window.AquariumFish.auth.getToken === "function") {
                return window.AquariumFish.auth.getToken();
            }
            if (typeof window.AquariumFish.auth.getAuthToken === "function") {
                return window.AquariumFish.auth.getAuthToken();
            }
        }
        return localStorage.getItem("token") || localStorage.getItem("authToken") || sessionStorage.getItem("token");
    }

    function isAuthenticated() {
        if (window.AquariumFish && window.AquariumFish.auth) {
            if (typeof window.AquariumFish.auth.isAuthenticated === "function") {
                return window.AquariumFish.auth.isAuthenticated();
            }
        }
        return !!getAuthToken();
    }

    function getCurrentUser() {
        if (window.AquariumFish && window.AquariumFish.auth) {
            if (typeof window.AquariumFish.auth.getCurrentUser === "function") {
                return window.AquariumFish.auth.getCurrentUser();
            }
        }
        return null;
    }

    function getCurrentRole() {
        if (window.AquariumFish && window.AquariumFish.auth) {
            if (typeof window.AquariumFish.auth.getCurrentRole === "function") {
                return window.AquariumFish.auth.getCurrentRole();
            }
        }
        const user = getCurrentUser();
        return user ? user.role : null;
    }

    function logoutSeller() {
        if (window.AquariumFish && window.AquariumFish.auth && typeof window.AquariumFish.auth.logout === "function") {
            window.AquariumFish.auth.logout();
            return;
        }
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        sessionStorage.clear();
        window.location.href = "../login.html";
    }

    // ==========================================
    // 7. SELLER-ONLY ACCESS GUARD
    // ==========================================
    function requireSellerAuth() {
        if (!isAuthenticated()) {
            window.location.href = "../login.html";
            return false;
        }
        const role = getCurrentRole();
        if (role && role !== "SELLER" && role !== "ADMIN") {
            window.location.href = "../index.html";
            return false;
        }
        sellerState.authenticated = true;
        sellerState.authorized = true;
        return true;
    }

    // ==========================================
    // 12. API REQUEST HELPER
    // ==========================================
    async function apiRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = { ...options.headers };

        if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        const token = getAuthToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
            credentials: "include"
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                logoutSeller();
                throw { status: 401, message: "Your session has expired. Please sign in again." };
            }

            let data = null;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            }

            if (!response.ok) {
                const errorMessage = getApiErrorMessage(response, data);
                throw { status: response.status, message: errorMessage, data };
            }

            return data;
        } catch (error) {
            if (error.name === "AbortError") {
                throw error;
            }
            if (!error.status) {
                throw { status: 0, message: "The server is temporarily unavailable. Please try again later." };
            }
            throw error;
        }
    }

    // ==========================================
    // 36 & 37. API ERROR HANDLING
    // ==========================================
    function getApiErrorMessage(response, data) {
        if (data) {
            if (typeof data.message === "string" && data.message.trim() !== "") return data.message;
            if (typeof data.error === "string" && data.error.trim() !== "") return data.error;
            if (data.errors && typeof data.errors === "object") {
                const firstKey = Object.keys(data.errors)[0];
                if (firstKey && data.errors[firstKey]) return `${firstKey}: ${data.errors[firstKey]}`;
            }
        }

        switch (response.status) {
            case 400: return "Invalid request. Please check your input.";
            case 401: return "Your session has expired. Please sign in again.";
            case 403: return "You do not have permission to perform this action.";
            case 404: return "The requested seller resource could not be found.";
            case 409: return "This seller resource has changed or conflicts with another update.";
            case 422: return "Validation failed. Please verify your data.";
            case 500:
            case 503: return "The server is temporarily unavailable. Please try again later.";
            default: return `Unexpected error occurred (Status: ${response.status})`;
        }
    }

    // ==========================================
    // 14 & 15. NORMALIZATION HELPERS
    // ==========================================
    function normalizeSeller(raw) {
        if (!raw) return null;
        let s = raw.seller || raw.data?.seller || raw.data || raw;
        let u = raw.user || s.user || raw.data?.user || {};

        return {
            id: s.id || s.sellerId || null,
            shopName: s.shopName || s.storeName || s.shop_name || "Unknown Shop",
            phone: s.phone || "",
            address: s.address || "",
            username: u.username || s.username || "",
            email: u.email || s.email || "",
            status: u.status || s.status || "ACTIVE",
            role: u.role || s.role || "SELLER"
        };
    }

    function extractArray(data, keys = ["content", "data", "items", "fish", "orders"]) {
        if (Array.isArray(data)) return data;
        if (!data || typeof data !== "object") return [];

        for (const key of keys) {
            if (Array.isArray(data[key])) return data[key];
        }

        return [];
    }

    function normalizeId(value) {
        if (value === null || value === undefined) return null;
        return String(value);
    }

    // ==========================================
    // 16 & 17. OWNERSHIP & FISH HELPERS
    // ==========================================
    function getFishSellerId(fish) {
        if (!fish) return null;
        if (fish.seller && fish.seller.id) return normalizeId(fish.seller.id);
        if (fish.sellerId) return normalizeId(fish.sellerId);
        if (fish.seller && fish.seller.sellerId) return normalizeId(fish.seller.sellerId);
        return null;
    }

    function isOwnFish(fish) {
        if (!sellerState.seller || !sellerState.seller.id) return false;
        const fishSellerId = getFishSellerId(fish);
        if (!fishSellerId) return false;
        return String(fishSellerId) === String(sellerState.seller.id);
    }

    // ==========================================
    // 10 & 43 & 44. SELLER PROFILE API METHODS
    // ==========================================
    async function getProfile() {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 200));
            sellerState.seller = normalizeSeller(MOCK_SELLER_DATA);
            sellerState.user = MOCK_SELLER_DATA.user;
            return sellerState.seller;
        }

        // TODO: Confirm the exact Spring Boot endpoint with the backend. Preferred: GET /api/sellers/me
        try {
            const res = await apiRequest("/sellers/me");
            sellerState.seller = normalizeSeller(res);
            return sellerState.seller;
        } catch (err) {
            if (err.status === 404) {
                const res = await apiRequest("/seller/profile");
                sellerState.seller = normalizeSeller(res);
                return sellerState.seller;
            }
            throw err;
        }
    }

    async function refreshProfile() {
        return await getProfile();
    }

    async function updateProfile(payload) {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 300));
            MOCK_SELLER_DATA.shopName = payload.shopName || MOCK_SELLER_DATA.shopName;
            MOCK_SELLER_DATA.phone = payload.phone !== undefined ? payload.phone : MOCK_SELLER_DATA.phone;
            MOCK_SELLER_DATA.address = payload.address !== undefined ? payload.address : MOCK_SELLER_DATA.address;
            sellerState.seller = normalizeSeller(MOCK_SELLER_DATA);
            return sellerState.seller;
        }

        // TODO: Confirm the exact Spring Boot endpoint with the backend. Preferred: PUT /api/sellers/me
        try {
            const res = await apiRequest("/sellers/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            sellerState.seller = normalizeSeller(res);
            return sellerState.seller;
        } catch (err) {
            if (err.status === 404) {
                const res = await apiRequest("/seller/profile", {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
                sellerState.seller = normalizeSeller(res);
                return sellerState.seller;
            }
            throw err;
        }
    }

    // ==========================================
    // 18 & 19 & 20 & 21. FISH API METHODS
    // ==========================================
    async function getMyFish() {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 250));
            return MOCK_FISH_DATA;
        }

        // TODO: Confirm Spring Boot endpoint. Preferred: GET /api/fish/my-fish or GET /api/sellers/me/fish
        try {
            const res = await apiRequest("/fish/my-fish");
            return extractArray(res);
        } catch (err) {
            if (err.status === 404) {
                const res = await apiRequest("/sellers/me/fish");
                return extractArray(res);
            }
            throw err;
        }
    }

    async function getFishById(id) {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 150));
            const fish = MOCK_FISH_DATA.find(f => String(f.id) === String(id));
            if (!fish) throw { status: 404, message: "Fish not found" };
            return fish;
        }

        // TODO: Confirm endpoint: GET /api/fish/{id}
        return await apiRequest(`/fish/${encodeURIComponent(id)}`);
    }

    async function createFish(payload) {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 300));
            const newFish = { id: Date.now(), ...payload, seller: { id: 7 } };
            MOCK_FISH_DATA.push(newFish);
            return newFish;
        }

        // TODO: Confirm endpoint: POST /api/fish
        return await apiRequest("/fish", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    }

    async function updateFish(id, payload) {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 300));
            const index = MOCK_FISH_DATA.findIndex(f => String(f.id) === String(id));
            if (index === -1) throw { status: 404, message: "Fish not found" };
            MOCK_FISH_DATA[index] = { ...MOCK_FISH_DATA[index], ...payload };
            return MOCK_FISH_DATA[index];
        }

        // TODO: Confirm endpoint: PUT /api/fish/{id}
        return await apiRequest(`/fish/${encodeURIComponent(id)}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
    }

    async function deleteFish(id) {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 200));
            const index = MOCK_FISH_DATA.findIndex(f => String(f.id) === String(id));
            if (index !== -1) MOCK_FISH_DATA.splice(index, 1);
            return { success: true };
        }

        // TODO: Confirm endpoint: DELETE /api/fish/{id}
        return await apiRequest(`/fish/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });
    }

    // ==========================================
    // 22 & 23 & 24. FISH IMAGE METHODS & VALIDATION
    // ==========================================
    function validateFishImage(file) {
        if (!file) return "No file selected.";
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return "Invalid file type. Only JPEG, PNG, and WEBP are supported.";
        }
        const maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.size > maxSize) {
            return "File size exceeds the 5MB limit.";
        }
        return null;
    }

    async function getFishImages(fishId) {
        if (USE_MOCK_DATA) {
            const fish = MOCK_FISH_DATA.find(f => String(f.id) === String(fishId));
            return fish ? fish.images || [] : [];
        }
        // TODO: Confirm endpoint: GET /api/fish/{fishId}/images
        const res = await apiRequest(`/fish/${encodeURIComponent(fishId)}/images`);
        return extractArray(res);
    }

    async function uploadFishImages(fishId, formData) {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 400));
            return { success: true };
        }
        // TODO: Confirm endpoint: POST /api/fish/{fishId}/images
        return await apiRequest(`/fish/${encodeURIComponent(fishId)}/images`, {
            method: "POST",
            body: formData
        });
    }

    async function deleteFishImage(imageId) {
        if (USE_MOCK_DATA) return { success: true };
        // TODO: Confirm endpoint: DELETE /api/fish-images/{imageId}
        return await apiRequest(`/fish-images/${encodeURIComponent(imageId)}`, {
            method: "DELETE"
        });
    }

    async function setPrimaryFishImage(imageId) {
        if (USE_MOCK_DATA) return { success: true };
        // TODO: Confirm endpoint: PATCH /api/fish-images/{imageId}/primary
        return await apiRequest(`/fish-images/${encodeURIComponent(imageId)}/primary`, {
            method: "PATCH"
        });
    }

    // ==========================================
    // 25 & 26. SELLER ORDERS
    // ==========================================
    async function getSellerOrders() {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 200));
            return MOCK_ORDERS_DATA;
        }
        // TODO: Confirm endpoint: GET /api/seller/orders or GET /api/orders/seller
        try {
            const res = await apiRequest("/seller/orders");
            return extractArray(res);
        } catch (err) {
            if (err.status === 404) {
                const res = await apiRequest("/orders/seller");
                return extractArray(res);
            }
            throw err;
        }
    }

    // ==========================================
    // 27 & 28. SELLER STOCK & UPDATE
    // ==========================================
    async function getSellerStock() {
        if (USE_MOCK_DATA) {
            return await getMyFish();
        }
        // TODO: Confirm endpoint: GET /api/seller/stock
        try {
            const res = await apiRequest("/seller/stock");
            return extractArray(res);
        } catch (err) {
            if (err.status === 404) {
                return await getMyFish();
            }
            throw err;
        }
    }

    async function updateFishStock(fishId, stockQty) {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 200));
            const fish = MOCK_FISH_DATA.find(f => String(f.id) === String(fishId));
            if (fish) fish.stockQty = stockQty;
            return fish;
        }
        // TODO: Confirm endpoint: PATCH /api/fish/{fishId}/stock
        return await apiRequest(`/fish/${encodeURIComponent(fishId)}/stock`, {
            method: "PATCH",
            body: JSON.stringify({ stockQty })
        });
    }

    // ==========================================
    // 29. DASHBOARD STATS
    // ==========================================
    async function getDashboardStats() {
        if (USE_MOCK_DATA) {
            await new Promise(r => setTimeout(r, 150));
            const fishList = MOCK_FISH_DATA;
            const lowStockCount = fishList.filter(f => f.stockQty > 0 && f.stockQty <= LOW_STOCK_THRESHOLD).length;
            const outOfStockCount = fishList.filter(f => f.stockQty === 0).length;
            return {
                totalFish: fishList.length,
                lowStock: lowStockCount,
                outOfStock: outOfStockCount,
                totalOrders: MOCK_ORDERS_DATA.length,
                sellerRevenue: 3500.00
            };
        }
        // TODO: Confirm endpoint: GET /api/seller/dashboard
        return await apiRequest("/seller/dashboard");
    }

    // ==========================================
    // 30 & 31 & 32 & 64 & 66 & 67. FORMATTING & UTILITIES
    // ==========================================
    function formatCurrency(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) return "Rs. 0.00";
        try {
            return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
        } catch (e) {
            return `Rs. ${Number(amount).toFixed(2)}`;
        }
    }

    function formatStatus(status) {
        if (!status) return "";
        return status.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    function getStockStatus(stockQty) {
        const qty = Number(stockQty);
        if (isNaN(qty) || qty <= 0) return "OUT_OF_STOCK";
        if (qty <= LOW_STOCK_THRESHOLD) return "LOW_STOCK";
        return "IN_STOCK";
    }

    function formatDate(value) {
        if (!value) return "N/A";
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            return "N/A";
        }
    }

    function getInitials(name) {
        if (!name || typeof name !== "string") return "SE";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    function normalizeSearchText(value) {
        if (value === null || value === undefined) return "";
        return String(value).trim().toLowerCase();
    }

    function escapeHtml(value) {
        if (value === null || value === undefined) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getSafeImageUrl(url, fallback = "https://via.placeholder.com/150") {
        if (!url || typeof url !== "string") return fallback;
        const lower = url.trim().toLowerCase();
        if (lower.startsWith("javascript:") || lower.startsWith("data:")) return fallback;
        if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("/")) {
            return url;
        }
        return fallback;
    }

    function debounce(fn, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // ==========================================
    // 70. STATE WRAPPER (NO DIRECT EXPOSURE)
    // ==========================================
    function getSellerState() {
        return { ...sellerState };
    }

    // ==========================================
    // 69. PUBLIC API EXPOSURE
    // ==========================================
    window.AquariumFish = window.AquariumFish || {};
    window.AquariumFish.seller = {
        getProfile,
        refreshProfile,
        updateProfile,
        getMyFish,
        getFishById,
        createFish,
        updateFish,
        deleteFish,
        getFishImages,
        uploadFishImages,
        deleteFishImage,
        setPrimaryFishImage,
        getSellerOrders,
        getSellerStock,
        updateFishStock,
        getDashboardStats,
        requireSellerAuth,
        isOwnFish,
        formatCurrency,
        formatDate,
        formatStatus,
        getStockStatus,
        escapeHtml,
        getSafeImageUrl,
        debounce,
        getSellerState,
        validateFishImage,
        getInitials,
        normalizeSearchText
    };

})();