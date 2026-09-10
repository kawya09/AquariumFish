/**
 * AQUARIUM FISH E-COMMERCE - AUTHENTICATION MODULE
 * Handlers for form validation, Spring Boot REST API connection, and Role Redirection.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize form controls
    initPasswordToggle();
    initLoginForm();
});

/* ==========================================================================
   SPRING BOOT REST API CONFIGURATION
   ========================================================================== */

// TODO: Update this URL according to your Spring Boot backend address
const API_URL = "/api/auth/login";

/* ==========================================================================
   FORM CONTROLS & VALIDATION LOGIC
   ========================================================================== */

/**
 * Toggles password visibility between masked and plain-text
 */
function initPasswordToggle() {
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggle-password-icon');

    if (!toggleBtn || !passwordInput) return;

    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';

        // Toggle type attribute
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

        // Update ARIA icon & label state
        toggleBtn.setAttribute(
            'aria-label',
            isPassword ? 'Hide password' : 'Show password as plain text'
        );

        toggleIcon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    });
}

/**
 * Submits and processes authentication request
 */
function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset error UI states
        clearErrors();

        // Extract input values
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberMeInput = document.getElementById('remember-me');

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeInput.checked;

        // Client-side validation checks
        let isValid = true;

        if (!username) {
            showFieldError('username', 'Username or email is required.');
            isValid = false;
        } else if (username.includes('@') && !validateEmail(username)) {
            showFieldError('username', 'Please enter a valid email address.');
            isValid = false;
        }

        if (!password) {
            showFieldError('password', 'Password is required.');
            isValid = false;
        } else if (password.length < 6) {
            showFieldError('password', 'Password must be at least 6 characters.');
            isValid = false;
        }

        if (!isValid) return;

        // Trigger processing state UI
        setLoadingState(true);

        /*
          SECURITY NOTE:
          - Raw passwords are NEVER cached or saved in localStorage/sessionStorage.
          - Client-side validation is solely for user feedback.
          - Password verification MUST be handled securely on the Spring Boot backend
            using BCrypt/Argon2 password hashing.
        */
        const payload = {
            username: username,
            password: password
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();

                // Handle token and authentication persistence
                handleSuccessfulLogin(data, rememberMe);
            } else {
                // Handle failed authentication HTTP status codes (e.g. 401, 403, 404)
                handleFailedLogin(response.status);
            }
        } catch (networkError) {
            console.error('API connection failed:', networkError);
            showAlert('Unable to connect to server. Please check your network connection.');
        } finally {
            setLoadingState(false);
        }
    });
}

/**
 * Validates Email Format
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Display helper for field-specific validation errors
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`${fieldId}-error`);

    if (field && errorSpan) {
        const group = field.closest('.form-group');
        if (group) group.classList.add('has-error');

        errorSpan.textContent = message;
        errorSpan.classList.remove('hidden');
    }
}

/**
 * Display helper for main alert box
 */
function showAlert(message) {
    const alertBanner = document.getElementById('alert-banner');
    const alertMsg = document.getElementById('alert-message');

    if (alertBanner && alertMsg) {
        alertMsg.textContent = message;
        alertBanner.classList.remove('hidden');
    }
}

/**
 * Clear existing error UI elements
 */
function clearErrors() {
    document.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));
    document.querySelectorAll('.error-text').forEach(span => span.classList.add('hidden'));

    const alertBanner = document.getElementById('alert-banner');
    if (alertBanner) alertBanner.classList.add('hidden');
}

/**
 * Controls login button state during REST API calls
 */
function setLoadingState(isLoading) {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    if (isLoading) {
        submitBtn.disabled = true;
        btnText.textContent = 'Signing in...';
        btnSpinner.classList.remove('hidden');
    } else {
        submitBtn.disabled = false;
        btnText.textContent = 'Sign In';
        btnSpinner.classList.add('hidden');
    }
}

/* ==========================================================================
   AUTHENTICATION STORAGE & ROLE-BASED REDIRECTION
   ========================================================================== */

/**
 * Saves non-sensitive session claims and redirects user based on authority
 */
function handleSuccessfulLogin(data, rememberMe) {
    /*
      EXPECTED SPRING BOOT RESPONSE FORMAT:
      {
        "token": "eyJhbGciOiJIUzI1NiJ9...",
        "userId": 1,
        "username": "johndoe",
        "role": "CUSTOMER" // Options: "ADMIN", "SELLER", "CUSTOMER"
      }
    */

    // Determine storage target based on "Remember Me" choice
    const storage = rememberMe ? localStorage : sessionStorage;

    // Clear previous tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Store authorization details (Never store raw passwords)
    if (data.token) storage.setItem('token', data.token);
    if (data.userId) storage.setItem('userId', data.userId);
    if (data.username) storage.setItem('username', data.username);
    if (data.role) storage.setItem('role', data.role);

    // Execute Role-Based Redirection
    redirectUserByRole(data.role);
}

/**
 * Maps Backend Roles to specific Frontend Routes
 */
function redirectUserByRole(role) {
    // TODO: Update these Role Names and Paths if your Spring Boot Security authorities differ
    const userRole = role ? role.toUpperCase() : 'CUSTOMER';

    switch (userRole) {
        case 'ADMIN':
        case 'ROLE_ADMIN':
            window.location.href = 'admin/admin-dashboard.html';
            break;

        case 'SELLER':
        case 'ROLE_SELLER':
            window.location.href = 'seller/seller-dashboard.html';
            break;

        case 'CUSTOMER':
        case 'ROLE_CUSTOMER':
        default:
            window.location.href = 'index.html';
            break;
    }
}

/**
 * Converts HTTP error codes into user-friendly notifications
 */
function handleFailedLogin(status) {
    switch (status) {
        case 401:
            showAlert('Invalid username or password.');
            break;
        case 403:
            showAlert('Your account has been disabled. Please contact support.');
            break;
        case 404:
            showAlert('Account not found.');
            break;
        case 500:
        default:
            showAlert('An unexpected server error occurred. Please try again later.');
            break;
    }
}