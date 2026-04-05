/**
 * Firestore CRUD operations for Linkaro
 * Depends on: firebase-config.js (provides global `db` and `firebase`)
 */

/**
 * Initialize user data in Firestore. Creates default fields for new users.
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<{fields: string[], links: Object}>}
 */
const initUserData = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    const defaultFields = [
      "Github",
      "Linkedin",
      "Twitter",
      "Portfolio",
      "Email",
      "Dev",
      "Dribbble",
    ];
    const defaultData = { fields: defaultFields, links: {} };
    await userRef.set(defaultData);
    return defaultData;
  }

  return doc.data();
};

/**
 * Save a single link URL to Firestore
 * @param {string} userId
 * @param {string} fieldName
 * @param {string} url
 */
const saveLinkToFirestore = async (userId, fieldName, url) => {
  const userRef = db.collection("users").doc(userId);
  // Using FieldPath to prevent errors with dots/slashes in the field name
  await userRef.update(
    new firebase.firestore.FieldPath("links", fieldName), url
  );
};

/**
 * Add a new custom field to the user's field list
 * @param {string} userId
 * @param {string} fieldName
 */
const addFieldToFirestore = async (userId, fieldName) => {
  const userRef = db.collection("users").doc(userId);
  await userRef.update({
    fields: firebase.firestore.FieldValue.arrayUnion(fieldName),
  });
};

/**
 * Delete a field and its link data from Firestore
 * @param {string} userId
 * @param {string} fieldName
 */
const deleteFieldFromFirestore = async (userId, fieldName) => {
  const userRef = db.collection("users").doc(userId);
  await userRef.update(
    "fields", firebase.firestore.FieldValue.arrayRemove(fieldName),
    new firebase.firestore.FieldPath("links", fieldName), firebase.firestore.FieldValue.delete()
  );
};
