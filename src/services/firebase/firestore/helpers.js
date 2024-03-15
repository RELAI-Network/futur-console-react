// Function to add a document to a collection
import { doc, addDoc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';

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

    if (documentSnapshot.exists) {
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
    await db.collection(collectionName).doc(documentId).delete();
  } catch (error) {
    console.error('Error deleting document: ', error);

    const errorMessage = getFirestoreErrorMessage(error.code);

    throw new FirestoreError(errorMessage);
  }
}

export { addDocument, getDocument, updateDocument, deleteDocument };
