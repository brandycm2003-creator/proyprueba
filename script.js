/*
 * NOVA - Lógica del formulario de inicio de sesión
 *
 * IMPORTANTE: las credenciales están escritas en el navegador y se comparan
 * mediante JavaScript del lado del cliente. Esta autenticación es
 * EXCLUSIVAMENTE DIDÁCTICA: no protege cuentas ni constituye un mecanismo
 * seguro de autenticación. En un sistema real, la autenticación debe
 * realizarse en un servidor, con contraseñas almacenadas de forma segura
 * (hash con salt), HTTPS y controles adicionales.
 */

"use strict";

// Credenciales ficticias para probar el comportamiento de la interfaz.
const DEMO_EMAIL = "demo@ejemplo.com";
const DEMO_PASSWORD = "Demo1234!";

// Referencias a los elementos del documento.
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberEmail = document.getElementById("rememberEmail");
const togglePasswordButton = document.getElementById("togglePassword");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formMessage = document.getElementById("formMessage");
const forgotPasswordLink = document.getElementById("forgotPassword");

const REMEMBERED_EMAIL_KEY = "novaRememberedEmail";

// Recupera únicamente el correo guardado. Nunca se guarda la contraseña.
try {
  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberEmail.checked = true;
  }
} catch (error) {
  // Si el navegador bloquea localStorage, el formulario sigue funcionando.
  console.warn("No fue posible acceder al almacenamiento local.", error);
}

/**
 * Muestra u oculta el texto de contraseña.
 * El botón cambia también su etiqueta accesible y estado aria-pressed.
 */
togglePasswordButton.addEventListener("click", () => {
  const shouldShow = passwordInput.type === "password";
  passwordInput.type = shouldShow ? "text" : "password";
  togglePasswordButton.setAttribute("aria-pressed", String(shouldShow));
  togglePasswordButton.setAttribute(
    "aria-label",
    shouldShow ? "Ocultar contraseña" : "Mostrar contraseña"
  );
});

/** Limpia el error asociado a un campo. */
function clearFieldError(input, errorElement) {
  input.classList.remove("invalid");
  input.removeAttribute("aria-invalid");
  errorElement.textContent = "";
}

/** Presenta un error específico y marca el campo como inválido. */
function showFieldError(input, errorElement, message) {
  input.classList.add("invalid");
  input.setAttribute("aria-invalid", "true");
  errorElement.textContent = message;
}

/** Comprueba el formato general de una dirección de correo. */
function isValidEmail(email) {
  // Validación sencilla para una interfaz de demostración.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailPattern.test(email);
}

/**
 * Valida los campos y devuelve true solamente si ambos son correctos.
 * Los mensajes se muestran debajo de cada campo.
 */
function validateForm() {
  let isValid = true;
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  clearFieldError(emailInput, emailError);
  clearFieldError(passwordInput, passwordError);
  hideFormMessage();

  if (!email) {
    showFieldError(emailInput, emailError, "Ingresa tu correo electrónico.");
    isValid = false;
  } else if (!isValidEmail(email)) {
    showFieldError(emailInput, emailError, "Ingresa un correo electrónico válido.");
    isValid = false;
  }

  if (!password.trim()) {
    showFieldError(passwordInput, passwordError, "Ingresa tu contraseña.");
    isValid = false;
  } else if (password.length < 8) {
    showFieldError(passwordInput, passwordError, "La contraseña debe contener al menos 8 caracteres.");
    isValid = false;
  }

  if (!isValid) {
    const firstInvalidField = form.querySelector('[aria-invalid="true"]');
    if (firstInvalidField) firstInvalidField.focus();
  }

  return isValid;
}

/** Muestra una notificación general de éxito o error. */
function showFormMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = `form-message visible ${type}`;
}

/** Oculta y limpia la notificación general. */
function hideFormMessage() {
  formMessage.textContent = "";
  formMessage.className = "form-message";
}

// Valida al enviar y cancela siempre el envío tradicional del formulario.
form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) return;

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  // La opción recordar correo almacena exclusivamente el correo electrónico.
  try {
    if (rememberEmail.checked) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, emailInput.value.trim());
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  } catch (error) {
    console.warn("No fue posible guardar la preferencia de correo.", error);
  }

  // Comprobación local simulada: NO usar este patrón en producción.
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    showFormMessage("¡Bienvenido! Has iniciado sesión correctamente en el modo demostración.", "success");
  } else {
    showFormMessage("Credenciales incorrectas. Verifica tu correo electrónico y contraseña.", "error");
  }
});

// Limpia los errores mientras la persona corrige los campos.
emailInput.addEventListener("input", () => {
  clearFieldError(emailInput, emailError);
  hideFormMessage();
});

passwordInput.addEventListener("input", () => {
  clearFieldError(passwordInput, passwordError);
  hideFormMessage();
});

// El enlace no implementa recuperación real porque no existe un servidor.
forgotPasswordLink.addEventListener("click", (event) => {
  event.preventDefault();
  showFormMessage("La recuperación de contraseña no está disponible en esta demostración.", "error");
});
