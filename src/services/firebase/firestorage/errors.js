/**
 * Handles errors from Firebase Storage and returns appropriate error messages.
 *
 * @param {Error} error - The error object to be handled
 * @return {string} The appropriate error message based on the error code
 */
export function handleStorageError(error) {
  console.error('Firebase Storage Error:', error);

  const errorMessage = error.code || 'An unknown error occurred';

  switch (errorMessage) {
    case 'storage/object-not-found':
      return 'The specified file could not be found.';
    case 'storage/unauthorized':
      return 'You are not authorized to perform this operation.';
    case 'storage/quota-exceeded':
      return 'Storage quota exceeded. Please upgrade your plan or delete unused files.';
    case 'storage/network-request-failed':
      return 'Network request failed. Please check your internet connection.';
    // Add more cases for specific errors you encounter
    default:
      return errorMessage;
  }
}

/**
 * A custom error class for handling Firestore errors with user-friendly messages.
 */
export class FirestorageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FirestorageError';
  }
}

/**
 * Wraps a Firestorage operation in a try-catch block and throws a custom FirestorageError with a descriptive message on error.
 *
 * @param {Promise<any>} firestorageOperation The Firestorage operation to execute.
 * @returns {Promise<any>} A promise that resolves with the operation's result or rejects with a FirestorageError.
 */
export async function handleFirestorageError(firestorageOperation) {
  try {
    return await firestorageOperation;
  } catch (error) {
    const errorMessage = handleStorageError(error.code);
    throw new FirestorageError(errorMessage);
  }
}
