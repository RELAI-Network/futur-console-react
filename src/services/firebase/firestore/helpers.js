// Function to add a document to a collection
import {
  doc,
  query,
  where,
  addDoc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
} from 'firebase/firestore';

import { db } from '../config';
import { FirestoreError, getFirestoreErrorMessage } from './errors';

async function addDocument(collectionName, data, id) {
  try {
    let docRef;

    if (id) {
      docRef = doc(db, `${collectionName}/${id}`);
    } else {
      docRef = await addDoc(collection(db, collectionName), {});
    }

    await setDoc(docRef, {
      ...data,
      id: docRef.id,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);

    const errorMessage = getFirestoreErrorMessage(error.code);

    throw new FirestoreError(errorMessage);
  }
}

// Function to get a document from a collection
async function getDocument(collectionName, documentId) {
  try {
    const docRef = doc(db, collectionName, documentId);

    const documentSnapshot = await getDoc(docRef);

    if (documentSnapshot.exists()) {
      return { id: documentSnapshot.id, ...documentSnapshot.data() };
    }

    throw Error(`No document with ${documentId} in collection ${collectionName}`, {
      code: 'not-found',
    });
  } catch (error) {
    console.error('Error getting document: ', error);

    const errorMessage = getFirestoreErrorMessage(error.code);

    throw new FirestoreError(errorMessage);
  }
}

async function getAll(collectionName) {
  try {
    const collectionRef = collection(db, collectionName);

    const querySnapshot = await getDocs(collectionRef);

    const documents = [];

    querySnapshot.forEach((document) => {
      documents.push({ id: document.id, ...document.data() });
    });

    return documents;
  } catch (error) {
    console.error('Error getting document: ', error);

    const errorMessage = getFirestoreErrorMessage(error.code);

    throw new FirestoreError(errorMessage);
  }
}

/**
 * Retrieves all documents from a specified collection where a specific condition is met.
 *
 * https://firebase.google.com/docs/firestore/query-data/queries
 *
 * @param {string} collectionName - The name of the collection to query.
 * @param {string} field - The field to query against.
 * @param {("==" | "!=" | "<" | "<=" | ">" | ">=" | "array-contains" | "in" | "array-contains-any" | "not-in")} [operator="=="] - The operator for the query (default is "==").
 *    The available operators are: "==", "!=", "<", "<=", ">", ">=", "array-contains", "in", "array-contains-any", "not-in".
 * @param {any} value - The value to compare against.
 * @return {Promise<Array>} An array of documents that meet the specified condition.
 */
async function getAllWhere(collectionName, field, operator = '==', value) {
  try {
    const collectionRef = collection(db, collectionName);

    const querySnapshot = await getDocs(query(collectionRef, where(field, operator, value)));

    const documents = [];

    querySnapshot.forEach((document) => {
      documents.push({ id: document.id, ...document.data() });
    });

    return documents;
  } catch (error) {
    console.error('Error getting document: ', error);

    const errorMessage = getFirestoreErrorMessage(error.code);

    throw new FirestoreError(errorMessage);
  }
}

// Function to update a document in a collection
async function updateDocument(collectionName, documentId, data) {
  try {
    const document = doc(db, collectionName, documentId);

    await updateDoc(document, data);
  } catch (error) {
    console.error('Error updating document: ', error);

    const errorMessage = getFirestoreErrorMessage(error.code);

    throw new FirestoreError(errorMessage);
  }
}

// Function to delete a document from a collection
async function deleteDocument(collectionName, documentId) {
  try {
    const document = doc(db, collectionName, documentId);

    return deleteDoc(document);
  } catch (error) {
    console.error('Error deleting document: ', error);

    const errorMessage = getFirestoreErrorMessage(error.code);

    throw new FirestoreError(errorMessage);
  }
}

export { getAll, addDocument, getDocument, getAllWhere, updateDocument, deleteDocument };
