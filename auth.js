/**
 * Auth page logic for Linkaro
 * Depends on: firebase-config.js (provides global `auth`)
 */

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

// If already logged in, go straight to main page
auth.onAuthStateChanged((user) => {
  if (user) {
    const isExtension = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL;
    window.location.href = isExtension ? chrome.runtime.getURL("link_index.html") : "link_index.html";
  }
});

// Toggle between Login ↔ Sign Up
toggleBtn.addEventListener("click", (e) => {
  e.preventDefault();
  isSignUp = !isSignUp;
  btnText.textContent = isSignUp ? "Sign Up" : "Log In";
  toggleMsg.textContent = isSignUp
    ? "Already have an account? "
    : "Don't have an account? ";
  toggleBtn.textContent = isSignUp ? "Log In" : "Sign Up";
  
  // Reset form and errors for clean state
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
      await auth.createUserWithEmailAndPassword(email, password);
    } else {
      await auth.signInWithEmailAndPassword(email, password);
    }
    // onAuthStateChanged handles the redirect
  } catch (error) {
    errorMsg.textContent = getFriendlyError(error.code, error.message);
    setLoading(false);
  }
});

const googleBtn = document.getElementById("googleBtn");
const googleBtnContent = document.getElementById("googleBtnContent");
const googleBtnSpinner = document.getElementById("googleBtnSpinner");

const setGoogleLoading = (loading) => {
  googleBtn.disabled = loading;
  if (googleBtnContent) googleBtnContent.style.display = loading ? "none" : "inline";
  if (googleBtnSpinner) googleBtnSpinner.style.display = loading ? "inline" : "none";
};

// Handle Google Sign-in
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
        const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
        await auth.signInWithCredential(credential);
        // onAuthStateChanged handles the redirect
      } catch (error) {
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
  btnText.style.display = loading ? "none" : "inline";
  btnSpinner.style.display = loading ? "inline" : "none";
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
