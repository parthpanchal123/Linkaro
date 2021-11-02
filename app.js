// Button Refernce for add new field btn
const addNewBtn = document.getElementById("addNewBtn");

// The div that contains all the fields
const linksDiv = document.querySelector(".links-area");

/**
 * @param  {String} key The name of the field
 * @param  {String} linkData The data of the field
 */
const saveToLocalStorage = (key, linkData) => {
  if (!linkData) return;
  localStorage.setItem(key, linkData);
};

/**
 * @param  {String} urlData The linkdata of the field
 */
const copyToClipboard = async (urlData) => {
  try {
    if(urlData)
      await navigator.clipboard.writeText(urlData);
    showalert(urlData);
  } catch (error) {
    alert("Did you give the clipboard permission ?");
  }
};

/**
 * @param  {String} linkData The data of the field
 */
const showalert = (linkData) => {
  if (!linkData) {
    alert("No link to copy ❌ ");
    return;
  }
  alert(linkData + " copied to clipboard ✔  ");
};

const loadAllFromLocalStorage = () => {
  const defaultFields = [
    "Github",
    "Linkedin",
    "Twitter",
    "Portfolio",
    "Email",
    "Dev",
    "Dribbble",
  ];
  // An array for custom fields
  let customFields = JSON.parse(localStorage.getItem("customFields")) ?? [];

  if (customFields.length != 0) {
    customFields.forEach((field) => {
      renderFieldsFromLocalStorage({ newFieldName: field, isNewField: false });
    });
  } else {
    localStorage.setItem("customFields", JSON.stringify(defaultFields));
  }
};
/**
 * @param  {String} newFieldName The name of the field
 * @param  {Boolean} isNewField A boolean to check if the field is new or not
 */
const renderFieldsFromLocalStorage = ({ newFieldName, isNewField }) => {
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

  switch (newFieldName) {
    case "Github":
      newIcon.classList.add("fab", "fa-github");
      break;
    case "Linkedin":
      newIcon.classList.add("fab", "fa-linkedin");
      break;
    case "Twitter":
      newIcon.classList.add("fab", "fa-twitter");
      break;
    case "Portfolio":
      newIcon.classList.add("fas", "fa-globe");
      break;
    case "Email":
      newIcon.classList.add("fas", "fa-envelope");
      break;
    case "Dev":
      newIcon.classList.add("fab", "fa-dev");
      break;
    case "Dribbble":
      newIcon.classList.add("fab", "fa-dribbble");
      break;
    default:
      newIcon.classList.add("fas", "fa-link");
      break;
  }

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

  if (isNewField) {
    let existingFields = JSON.parse(localStorage.getItem("customFields"));
    existingFields.push(newFieldName);
    localStorage.setItem("customFields", JSON.stringify(existingFields));
  }
};

addNewBtn.addEventListener("click", () => {
  newFieldName = prompt("Enter a new field name");
  if (!newFieldName) return;

  if (isDuplicateField(newFieldName)) return;
  renderFieldsFromLocalStorage({ newFieldName, isNewField: true });
});
/**
 * @param  {String} newLinkName The name of the field
 */
const isDuplicateField = (newLinkName) => {
  const links = JSON.parse(localStorage.getItem("customFields"));

  if (!links) return;

  if (links.includes(newLinkName)) {
    alert("This field already exists");
    return true;
  }
};

// Load all the fields from local storage on startup.
document.onload = loadAllFromLocalStorage();
