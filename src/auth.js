/**
 * Auth page entry point — Modular Firebase MV3-safe SDK
 */
import { auth } from "./firebase-init.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth/web-extension";
import { trackEvent } from "./analytics.js";

const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const toggleBtn = document.getElementById("toggleBtn");
const toggleMsg = document.getElementById("toggleMsg");
const errorMsg = document.getElementById("errorMsg");

let isSignUp = false;

const safeRedirect = (page) => {
  const isExtension = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL;
  window.location.href = isExtension ? chrome.runtime.getURL(page) : page;
};

// If already logged in, go straight to main page
onAuthStateChanged(auth, (user) => {
  if (user) {
    trackEvent("auth_session_active", { provider: user.providerData?.[0]?.providerId || "unknown" });
    safeRedirect("link_index.html");
  }
});

// Toggle between Login <-> Sign Up
toggleBtn.addEventListener("click", (e) => {
  e.preventDefault();
  isSignUp = !isSignUp;
  btnText.textContent = isSignUp ? "Sign Up" : "Log In";
  toggleMsg.textContent = isSignUp ? "Already have an account? " : "Don't have an account? ";
  toggleBtn.textContent = isSignUp ? "Log In" : "Sign Up";
  errorMsg.textContent = "";
  emailInput.value = "";
  passwordInput.value = "";
  emailInput.focus();
});

// Handle form submission
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  errorMsg.textContent = "";
  setLoading(true);

  try {
    if (isSignUp) {
      await createUserWithEmailAndPassword(auth, email, password);
      trackEvent("auth_signup_success", { method: "email" });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      trackEvent("auth_login_success", { method: "email" });
    }
    // onAuthStateChanged handles redirect
  } catch (error) {
    trackEvent("auth_login_failed", { method: "email", code: error?.code || "unknown" });
    errorMsg.textContent = getFriendlyError(error.code, error.message);
    setLoading(false);
  }
});

const googleBtn = document.getElementById("googleBtn");
const googleBtnContent = document.getElementById("googleBtnContent");
const googleBtnSpinner = document.getElementById("googleBtnSpinner");

const setGoogleLoading = (loading) => {
  googleBtn.disabled = loading;
  if (loading) {
    googleBtn.classList.add("loading");
  } else {
    googleBtn.classList.remove("loading");
  }
};

// Handle Google Sign-in using chrome.identity (MV3 compliant, no popup/redirect)
googleBtn.addEventListener("click", async () => {
  errorMsg.textContent = "";
  setGoogleLoading(true);

  if (typeof chrome !== "undefined" && chrome.identity) {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError) {
        errorMsg.textContent = "Extension Error: " + chrome.runtime.lastError.message;
        setGoogleLoading(false);
        return;
      }
      try {
        const credential = GoogleAuthProvider.credential(null, token);
        await signInWithCredential(auth, credential);
        trackEvent("auth_login_success", { method: "google" });
        // onAuthStateChanged handles redirect
      } catch (error) {
        trackEvent("auth_login_failed", { method: "google", code: error?.code || "unknown" });
        errorMsg.textContent = getFriendlyError(error.code, error.message);
        setGoogleLoading(false);
      }
    });
  } else {
    errorMsg.textContent = "Chrome Identity API not available.";
    setGoogleLoading(false);
  }
});

const setLoading = (loading) => {
  submitBtn.disabled = loading;
  if (loading) {
    submitBtn.classList.add("loading");
  } else {
    submitBtn.classList.remove("loading");
  }
};

const getFriendlyError = (code, message) => {
  const errors = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/invalid-credential": "Invalid email or password.",
  };
  return errors[code] || `Error: ${code || "Unknown"} | ${message || ""}`;
};
