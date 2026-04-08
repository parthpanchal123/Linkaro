/**
 * Firestore CRUD operations for Linkaro — Modular SDK
 */
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, FieldPath } from "firebase/firestore";
import { db } from "./firebase-init.js";

export const initUserData = async (userId) => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const defaultData = { fields: [], links: {}, metadata: {}, hasCustomOrder: false };
    await setDoc(userRef, defaultData);
    return defaultData;
  }

  const data = snap.data();
  if (!data.metadata) data.metadata = {};
  if (typeof data.hasCustomOrder !== "boolean") data.hasCustomOrder = false;
  return data;
};

export const saveLinkToFirestore = async (userId, fieldName, url) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, new FieldPath("links", fieldName), url);
};

export const addFieldToFirestore = async (userId, fieldName) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { fields: arrayUnion(fieldName) });
};

export const deleteFieldFromFirestore = async (userId, fieldName) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(
    userRef,
    "fields", arrayRemove(fieldName),
    new FieldPath("links", fieldName), deleteField(),
    new FieldPath("metadata", fieldName), deleteField()
  );
};

export const updateFieldMetadata = async (userId, fieldName, metadataUpdates) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { metadata: { [fieldName]: metadataUpdates } }, { merge: true });
};

export const saveReorderedFields = async (userId, newFieldsArray) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { fields: newFieldsArray, hasCustomOrder: true });
};
