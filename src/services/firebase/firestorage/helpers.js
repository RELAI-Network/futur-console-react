import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

import { storage } from '../config';
import { handleStorageError } from './errors';

/**
 * Creates a Firebase Storage reference for a specified path.
 *
 * @param {string} filePath The path to the file within the bucket (e.g., "images/my_file.jpg").
 * @returns {firebase.storage.Reference} The Firebase Storage reference for the specified path.
 * @throws {Error} Throws an error if the path is empty or invalid.
 */
function createStorageRef(filePath) {
  if (!filePath) {
    throw new Error('File path is required.');
  }

  return ref(storage, filePath);
}

/**
 * Uploads a file to Firebase Storage.
 *
 * @param {String} filePath The path to the file within the bucket (e.g., "images/my_file.jpg").
 * @param {File|Blob|Uint8Array} file The file object to upload.
 * @param {Object} metadata The file object metadata (such as name, size, and contentType).
 * @param {function(number)} onProgress Optional callback function to receive upload progress (0-100).
 * @param {function(String)} onError Optional callback function to get the error message.
 * @param {function(String)} onSuccess Optional callback function to get the download URL.
 * @returns {Promise<string>} A promise that resolves with the download URL of the uploaded file.
 * @throws {Error} Throws an error if the upload fails.
 */
async function uploadFile({filePath, file, metadata, onProgress, onError, onSuccess}) {
  const storageRef = createStorageRef(filePath);

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  // Register three observers:
  // 1. 'state_changed' observer, called any time the state changes
  // 2. Error observer, called on failure
  // 3. Completion observer, called on successful completion
  uploadTask.on(
    'state_changed',
    (snapshot) => {
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

      console.log(`Upload is ${progress}% done`);

      onProgress?.(progress);

      // eslint-disable-next-line default-case
      switch (snapshot.state) {
        case 'paused':
          console.log('Upload is paused');
          break;
        case 'running':
          console.log('Upload is running');
          break;
      }
    },
    (error) => {
      // Handle unsuccessful uploads
      onError?.(handleStorageError(error));
    },
    () => {
      // Handle successful uploads on complete
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        onSuccess?.(downloadURL);
      });
    }
  );

  const downloadURL = await uploadTask.then((snapshot) =>
    getDownloadURL(snapshot.ref).then((url) => url)
  );

  return downloadURL;
}

/**
 * Downloads a file from Firebase Storage as a blob.
 *
 * @param {firebase.storage.Reference} storageRef The Firebase Storage reference for the file to download.
 * @returns {Promise<Blob>} A promise that resolves with the downloaded file as a blob.
 * @throws {Error} Throws an error if the download fails.
 */
async function downloadFile(storageRef) {
  const url = await storageRef.getDownloadURL();
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  return response.blob();
}

/**
 * Deletes a file from Firebase Storage.
 *
 * @param {firebase.storage.Reference} storageRef The Firebase Storage reference for the file to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 * @throws {Error} Throws an error if the deletion fails.
 */
async function deleteFile(storageRef) {
  await storageRef.delete();
}

/**
 * Retrieves the metadata of a file in Firebase Storage.
 *
 * @param {firebase.storage.Reference} storageRef The Firebase Storage reference for the file.
 * @returns {Promise<firebase.storage.FullMetadata>} A promise that resolves with the file's metadata object.
 * @throws {Error} Throws an error if fetching metadata fails.
 */
async function getFileMetadata(storageRef) {
  const metadata = await storageRef.getMetadata();
  return metadata;
}

/**
 * Lists the names of files within a Firebase Storage directory (basic implementation).
 *
 * @param {firebase.storage.Reference} storageRef The Firebase Storage reference for the directory.
 * @returns {Promise<string[]>} A promise that resolves with an array of file names.
 * @throws {Error} Throws an error if listing files fails.
 */
async function listFiles(storageRef) {
  const listResult = await storageRef.listAll();
  const items = listResult.items.map((itemRef) => itemRef.name);
  return items;
}

export { listFiles, uploadFile, deleteFile, downloadFile, getFileMetadata };
