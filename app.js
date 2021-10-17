// Button Refernces

// For Github
const gitEditBtn = document.getElementById("gitEditBtn");
const gitLink = document.getElementById("Github");
const gitCopyBtn = document.getElementById("gitCopyBtn");

// For linkedin
const linkedinEditBtn = document.getElementById("linkedInEditBtn");
const linkedInLink = document.getElementById("Linkedin");
const linkedinCopyBtn = document.getElementById("linkedInCopyBtn");

// For twitter

const twitterEditBtn = document.getElementById("twitterEditBtn");
const twitterLink = document.getElementById("Twitter");
const twitterCopyBtn = document.getElementById("twitterCopyBtn");

// For Portfolio

const portfolioEditBtn = document.getElementById("portfolioEditBtn");
const portfolioLink = document.getElementById("Portfolio");
const portfolioCopyBtn = document.getElementById("portfolioCopyBtn");

// For Email

const emailEditBtn = document.getElementById("emailEditBtn");
const emailLink = document.getElementById("Email");
const emailCopyBtn = document.getElementById("emailCopyBtn");

// For Dev.to

const devEditBtn = document.getElementById("devEditBtn");
const devLink = document.getElementById("Dev");
const devCopyBtn = document.getElementById("devCopyBtn");

// For Dribbble

const dribbbleEditBtn = document.getElementById("dribbbleEditBtn");
const dribbbleLink = document.getElementById("Dribbble");
const dribbbleCopyBtn = document.getElementById("dribbbleCopyBtn");

gitEditBtn.addEventListener("click", () => {
  const gitLinkUrl = gitLink.value;
  saveToLocalStorage("Github", gitLinkUrl);
});

gitCopyBtn.addEventListener("click", (event) => {
  const gitLinkUrl = gitLink.value;
  copyToClipboard(gitLinkUrl);
});

linkedInEditBtn.addEventListener("click", () => {
  const linkedInLinkUrl = linkedInLink.value;
  saveToLocalStorage("Linkedin", linkedInLinkUrl);
});

linkedInCopyBtn.addEventListener("click", (event) => {
  const linkedInLinkUrl = gitLink.value;
  copyToClipboard(linkedInLinkUrl);
});

twitterEditBtn.addEventListener("click", () => {
  const twitterLinkUrl = twitterLink.value;
  saveToLocalStorage("Twitter", twitterLinkUrl);
});

twitterCopyBtn.addEventListener("click", (event) => {
  const twitterLinkUrl = twitterLink.value;
  copyToClipboard(twitterLinkUrl);
});

portfolioEditBtn.addEventListener("click", () => {
  const portfolioLinkUrl = portfolioLink.value;
  saveToLocalStorage("Portfolio", portfolioLinkUrl);
});

portfolioCopyBtn.addEventListener("click", (event) => {
  const portfolioLinkUrl = portfolioLink.value;
  copyToClipboard(portfolioLinkUrl);
});

emailEditBtn.addEventListener("click", () => {
  const emailLinkUrl = emailLink.value;
  saveToLocalStorage("Email", emailLinkUrl);
});

emailCopyBtn.addEventListener("click", (event) => {
  const emailLinkUrl = emailLink.value;
  copyToClipboard(emailLinkUrl);
});

devEditBtn.addEventListener("click", () => {
  const devLinkUrl = devLink.value;
  saveToLocalStorage("Dev", devLinkUrl);
});

devCopyBtn.addEventListener("click", (event) => {
  const devLinkUrl = devLink.value;
  copyToClipboard(devLinkUrl);
});

dribbbleEditBtn.addEventListener("click", () => {
  const dribbbleLinkUrl = dribbbleLink.value;
  saveToLocalStorage("Dribbble", dribbbleLinkUrl);
});

dribbbleCopyBtn.addEventListener("click", (event) => {
  const dribbbleLinkUrl = dribbbleLink.value;
  copyToClipboard(dribbbleLinkUrl);
});

const saveToLocalStorage = (key, linkData) => {
  if (!linkData) return;
  localStorage.setItem(key, linkData);
};

const copyToClipboard = async (urlData) => {
  try {
    await navigator.clipboard.writeText(urlData);
    showalert(urlData);
  } catch (error) {
    alert("Did you give the clipboard permission ?");
  }
};

const showalert = (linkData) => {
  alert(linkData + " copied to clipboard 🔥 ");
};

const loadAllFromLocalStorage = () => {
  const gitLinkData = localStorage.getItem("Github");
  const linkedInLinkData = localStorage.getItem("Linkedin");
  const twitterLinkData = localStorage.getItem("Twitter");
  const portfolioLinkData = localStorage.getItem("Portfolio");
  const emailLinkData = localStorage.getItem("Email");
  const devLinkData = localStorage.getItem("Dev");
  const dribbbleLinkData = localStorage.getItem("Dribbble");

  gitLink.value = gitLinkData;
  linkedInLink.value = linkedInLinkData;
  twitterLink.value = twitterLinkData;
  portfolioLink.value = portfolioLinkData;
  emailLink.value = emailLinkData;
  devLink.value = devLinkData;
  dribbbleLink.value = dribbbleLinkData;
};

// Load values from local storage

document.onload = loadAllFromLocalStorage();
