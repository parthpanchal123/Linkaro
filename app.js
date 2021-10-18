// Button Refernces

// For add new field btn
const addNewBtn = document.getElementById("addNewBtn");

// The div that contains all the fields

const linksDiv = document.querySelector(".links-area");

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
  if (!linkData) {
    alert("No link to copy ❌ ");
    return;
  }
  alert(linkData + " copied to clipboard ✔  ");
};

const loadAllFromLocalStorage = () => {
  // An array for custom fields
  let customFields = JSON.parse(localStorage.getItem("customFields"));

  customFields.forEach((field) => {
    loadCustomFieldsFromLocalStorage(field);
  });

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

const loadCustomFieldsFromLocalStorage = (newFieldName) => {
  const newField = document.createElement("div");
  newField.classList.add(
    "flex",
    "flex-row",
    "justify-center",
    "items-center",
    "ml-3"
  );

  const newIcon = document.createElement("i");
  newIcon.style.fontSize = "28px";
  newIcon.classList.add("fas", "fa-link");

  const newEditIcon = document.createElement("i");
  newEditIcon.classList.add("fas", "fa-edit");

  const newCopyIcon = document.createElement("i");
  newCopyIcon.classList.add("fas", "fa-copy");

  const newFieldInput = document.createElement("input");
  newFieldInput.classList.add(
    "w-3/5",
    "ml-4",
    "px-2",
    "py-2",
    "shadow-md",
    "rounded-md",
    "text-left"
  );

  newFieldInput.setAttribute("placeholder", newFieldName);
  newFieldInput.setAttribute("id", newFieldName);
  newFieldInput.value = localStorage.getItem(newFieldName);
  newFieldInput.setAttribute("type", "text");

  const newFieldEditBtn = document.createElement("button");
  newFieldEditBtn.classList.add(
    "m-2",
    "bg-blue-500",
    "hover:bg-blue-700",
    "text-white",
    "font-bold",
    "py-2",
    "px-4",
    "rounded-md",
    "shadow-md"
  );
  newFieldEditBtn.setAttribute("id", newFieldName + "EditBtn");

  newFieldEditBtn.appendChild(newEditIcon);

  newFieldEditBtn.addEventListener("click", () => {
    const data = document.getElementById(newFieldName).value;
    saveToLocalStorage(newFieldName, data);
  });

  const newFieldCopyBtn = document.createElement("button");
  newFieldCopyBtn.classList.add(
    "m-2",
    "ml-2",
    "bg-blue-500",
    "hover:bg-blue-700",
    "text-white",
    "font-bold",
    "py-2",
    "px-4",
    "rounded-md",
    "shadow-md"
  );

  newFieldCopyBtn.setAttribute("id", newFieldName + "CopyBtn");
  newFieldCopyBtn.appendChild(newCopyIcon);

  newFieldCopyBtn.addEventListener("click", () => {
    const data = document.getElementById(newFieldName).value;
    copyToClipboard(data);
  });

  newField.appendChild(newIcon);
  newField.appendChild(newFieldInput);
  newField.appendChild(newFieldEditBtn);
  newField.appendChild(newFieldCopyBtn);

  linksDiv.appendChild(newField);
};

// Add a new field

const addNewField = () => {
  const newFieldName = prompt("Enter a new field name");
  if (!newFieldName) return;

  if (checkForDuplicates(newFieldName)) return;

  const newField = document.createElement("div");
  newField.classList.add("flex", "flex-row", "justify-center", "items-center");

  const newIcon = document.createElement("i");
  newIcon.style.fontSize = "28px";
  newIcon.classList.add("fas", "fa-link");

  const newEditIcon = document.createElement("i");
  newEditIcon.classList.add("fas", "fa-edit");

  const newCopyIcon = document.createElement("i");
  newCopyIcon.classList.add("fas", "fa-copy");

  const newFieldInput = document.createElement("input");
  newFieldInput.classList.add(
    "w-3/5",
    "ml-4",
    "px-2",
    "py-2",
    "shadow-md",
    "rounded-md",
    "text-left"
  );

  newFieldInput.setAttribute("placeholder", newFieldName);
  newFieldInput.setAttribute("id", newFieldName);
  newFieldInput.setAttribute("type", "text");

  const newFieldEditBtn = document.createElement("button");
  newFieldEditBtn.classList.add(
    "m-2",
    "bg-blue-500",
    "hover:bg-blue-700",
    "text-white",
    "font-bold",
    "py-2",
    "px-4",
    "rounded-md",
    "shadow-md"
  );
  newFieldEditBtn.setAttribute("id", newFieldName + "EditBtn");

  newFieldEditBtn.appendChild(newEditIcon);

  newFieldEditBtn.addEventListener("click", () => {
    const data = document.getElementById(newFieldName).value;
    saveToLocalStorage(newFieldName, data);
  });

  const newFieldCopyBtn = document.createElement("button");
  newFieldCopyBtn.classList.add(
    "bg-blue-500",
    "hover:bg-blue-700",
    "text-white",
    "font-bold",
    "py-2",
    "px-4",
    "rounded-md",
    "shadow-md"
  );

  newFieldCopyBtn.setAttribute("id", newFieldName + "CopyBtn");
  newFieldCopyBtn.appendChild(newCopyIcon);

  newFieldCopyBtn.addEventListener("click", () => {
    const data = document.getElementById(newFieldName).value;
    copyToClipboard(data);
  });

  newField.appendChild(newIcon);
  newField.appendChild(newFieldInput);
  newField.appendChild(newFieldEditBtn);
  newField.appendChild(newFieldCopyBtn);

  linksDiv.appendChild(newField);

  const newItems = JSON.parse(localStorage.getItem("customFields")) ?? [];
  newItems.push(newFieldName);

  console.log(newItems);

  localStorage.setItem("customFields", JSON.stringify(newItems));

  // Get the field name
};

addNewBtn.addEventListener("click", () => {
  addNewField();
});

const checkForDuplicates = (newLinkName) => {
  const links = JSON.parse(localStorage.getItem("customFields"));

  if (!links) return;

  if (links.includes(newLinkName)) {
    alert("This field already exists");
    return true;
  }
};

// Load values from local storage

document.onload = loadAllFromLocalStorage();
