/**
 * AQUARIUM FISH E-COMMERCE - CUSTOMER REGISTRATION MODULE
 * Handles input validation, password strength analysis, and Spring Boot REST API registration.
 *
 * SECURITY ARCHITECTURE NOTES:
 * 1. Client-Side Validation is implemented strictly for User Experience (UX) and basic sanitization.
 * 2. Real validation & security MUST be enforced by the Spring Boot backend service.
 * 3. Passwords are sent via JSON payload over HTTPS and MUST be securely hashed (e.g. BCrypt) on the backend.
 * 4. Front-end code MUST NOT assign role IDs. The backend will automatically bind the new account to the CUSTOMER role.
 * 5. Neither raw passwords nor tokens are saved in client storage during registration.
 */

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggles();
    initPasswordStrengthMeter();
    initRegisterForm();
});

/* ==========================================================================
   SPRING BOOT REST API CONFIGURATION
   ========================================================================== */

// TODO: Update this endpoint to match your Spring Boot backend REST controller
const API_URL = "/api/auth/register";

/* ==========================================================================
   UI UTILITIES & TOGGLES
   ========================================================================== */

/**
 * Initializes toggle actions for Password and Confirm Password fields
 */
function initPasswordToggles() {
    setupToggle('toggle-password', 'password', 'toggle-password-icon');
    setupToggle('toggle-confirm-password', 'confirmPassword', 'toggle-confirm-password-icon');
}

function setupToggle(btnId, inputId, iconId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (!btn || !input || !icon) return;

    btn.addEventListener('click', () => {
        const isPassword = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPassword ? 'text' : 'password');
        btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password in plain text');
        icon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    });
}

/**
 * Dynamic Password Strength Visualizer
 */
function initPasswordStrengthMeter() {
    const passwordInput = document.getElementById('password');
    const fill = document.getElementById('strength-meter-fill');
    const label = document.getElementById('strength-text');

    if (!passwordInput || !fill || !label) return;

    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        const score = calculateStrength(val);

        // Reset visual classes
        fill.className = 'strength-fill';

        if (val.length === 0) {
            label.textContent = 'Password strength: Empty';
            return;
        }

        if (score < 3) {
            fill.classList.add('strength-weak');
            label.textContent = 'Password strength: Weak';
        } else if (score === 3 || score === 4) {
            fill.classList.add('strength-medium');
            label.textContent = 'Password strength: Medium';
        } else {
            fill.classList.add('strength-strong');
            label.textContent = 'Password strength: Strong';
        }
    });
}

/**
 * Calculate Password Score (0-5)
 */
function calculateStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

/* ==========================================================================
   FORM VALIDATION & REGISTRATION API SUBMISSION
   ========================================================================== */

function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        // Extract form fields
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        let isValid = true;

        // 1. First Name Validation
        if (!firstName) {
            showFieldError('firstName', 'First name is required.');
            isValid = false;
        } else if (firstName.length < 2) {
            showFieldError('firstName', 'First name must be at least 2 characters.');
            isValid = false;
        }

        // 2. Last Name Validation
        if (!lastName) {
            showFieldError('lastName', 'Last name is required.');
            isValid = false;
        } else if (lastName.length < 2) {
            showFieldError('lastName', 'Last name must be at least 2 characters.');
            isValid = false;
        }

        // 3. Username Validation
        const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
        if (!username) {
            showFieldError('username', 'Username is required.');
            isValid = false;
        } else if (username.length < 3) {
            showFieldError('username', 'Username must be at least 3 characters.');
            isValid = false;
        } else if (!usernameRegex.test(username)) {
            showFieldError('username', 'Username can only contain letters, numbers, underscores, dots, and hyphens.');
            isValid = false;
        }

        // 4. Email Validation
        if (!email) {
            showFieldError('email', 'Email address is required.');
            isValid = false;
        } else if (!validateEmail(email)) {
            showFieldError('email', 'Please enter a valid email address.');
            isValid = false;
        }

        // 5. Phone Validation (Sri Lankan formats allowed)
        if (!phone) {
            showFieldError('phone', 'Phone number is required.');
            isValid = false;
        } else if (!validateSriLankanPhone(phone)) {
            showFieldError('phone', 'Please enter a valid Sri Lankan phone number (e.g., 0712345678 or +94712345678).');
            isValid = false;
        }

        // 6. Address Validation
        if (!address) {
            showFieldError('address', 'Delivery address is required.');
            isValid = false;
        } else if (address.length < 5) {
            showFieldError('address', 'Please provide a complete address.');
            isValid = false;
        }

        // 7. Password Criteria Validation
        const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!password) {
            showFieldError('password', 'Password is required.');
            isValid = false;
        } else if (password.length < 8) {
            showFieldError('password', 'Password must be at least 8 characters long.');
            isValid = false;
        } else if (!passwordComplexityRegex.test(password)) {
            showFieldError('password', 'Password must include at least one uppercase letter, one lowercase letter, and one number.');
            isValid = false;
        }

        // 8. Confirm Password Validation
        if (!confirmPassword) {
            showFieldError('confirmPassword', 'Please confirm your password.');
            isValid = false;
        } else if (password !== confirmPassword) {
            showFieldError('confirmPassword', 'Passwords do not match.');
            isValid = false;
        }

        // 9. Terms Acceptance
        if (!terms) {
            showFieldError('terms', 'You must agree to the Terms & Conditions and Privacy Policy.');
            isValid = false;
        }

        if (!isValid) return;

        // Trigger UI loading state
        setLoadingState(true);

        /*
          PAYLOAD STRUCTURAL MAPPING FOR SPRING BOOT:
          The payload matches attributes across User and Customer entities:
          - User: username, password, email
          - Customer: firstName, lastName, phone, address
          The backend automatically maps this DTO and sets the default role to CUSTOMER.
        */
        const registrationPayload = {
            username: username,
            password: password,
            email: email,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            address: address
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(registrationPayload)
            });

            if (response.ok) {
                // Render success state and redirect user to login
                showAlert('Account created successfully! Redirecting to login...', 'success');

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } else {
                const errorData = await response.json().catch(() => null);
                handleApiError(response.status, errorData);
            }

        } catch (networkError) {
            console.error('Registration network error:', networkError);
            showAlert('Unable to create your account due to a connection issue. Please check your network.', 'error');
        } finally {
            setLoadingState(false);
        }
    });
}

/* ==========================================================================
   VALIDATION HELPERS
   ========================================================================== */

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validates Sri Lankan Phone Numbers
 * Accepts:
 * - 10-digit local format: 07XXXXXXXX (e.g., 0712345678, 0771234567)
 * - International format: +947XXXXXXXX or 947XXXXXXXX
 */
function validateSriLankanPhone(phone) {
    const cleaned = phone.replace(/[\s-]/g, '');
    const slPhoneRegex = /^(?:0|(?:\+?94))?7[0-46-8]\d{7}$/;
    return slPhoneRegex.test(cleaned);
}

/* ==========================================================================
   UI ERROR AND ALERT MANAGERS
   ========================================================================== */

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

function showAlert(message, type = 'error') {
    const alertBanner = document.getElementById('alert-banner');
    const alertMsg = document.getElementById('alert-message');
    const alertIcon = document.getElementById('alert-icon');

    if (alertBanner && alertMsg) {
        alertMsg.textContent = message;

        // Reset alert styles
        alertBanner.className = `alert-banner alert-${type}`;

        if (type === 'success') {
            alertIcon.className = 'fa-solid fa-circle-check';
        } else {
            alertIcon.className = 'fa-solid fa-circle-exclamation';
        }

        alertBanner.classList.remove('hidden');
        alertBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function clearErrors() {
    document.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));
    document.querySelectorAll('.error-text').forEach(span => span.classList.add('hidden'));

    const alertBanner = document.getElementById('alert-banner');
    if (alertBanner) alertBanner.classList.add('hidden');
}

function setLoadingState(isLoading) {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    if (isLoading) {
        submitBtn.disabled = true;
        btnText.textContent = 'Creating Account...';
        btnSpinner.classList.remove('hidden');
    } else {
        submitBtn.disabled = false;
        btnText.textContent = 'Create Account';
        btnSpinner.classList.add('hidden');
    }
}

/**
 * Maps Backend Status Codes & Messages into User-Friendly Alerts
 */
function handleApiError(status, errorData) {
    // If backend returned specific message (e.g., duplicate username or email)
    if (errorData && errorData.message) {
        if (errorData.message.toLowerCase().includes('username')) {
            showFieldError('username', 'This username is already taken.');
            showAlert('This username is already taken. Please choose another.', 'error');
            return;
        }
        if (errorData.message.toLowerCase().includes('email')) {
            showFieldError('email', 'An account with this email already exists.');
            showAlert('An account with this email already exists.', 'error');
            return;
        }
    }

    switch (status) {
        case 400:
            showAlert('Invalid account information provided. Please check your details.', 'error');
            break;
        case 409:
            showAlert('Username or email already exists in our system.', 'error');
            break;
        case 500:
        default:
            showAlert('Unable to create your account. Please try again later.', 'error');
            break;
    }
}