/**
 * Gets a descriptive error message based on the Firestore error code.
 *
 * @param {string} errorCode The Firestore error code.
 * @returns {string} A human-readable error message.
 */
export function getFirestoreErrorMessage(errorCode) {
  switch (errorCode) {
    case 'permission-denied':
      return 'You do not have permission to access this document.';
    case 'not-found':
      return 'The requested document does not exist.';
    case 'cancelled':
      return 'The operation was cancelled.';
    case 'internal':
      return 'An internal error occurred in Firestore.';
    case 'invalid-argument':
      return 'Invalid arguments were provided to the Firestore operation.';
    case 'deadline-exceeded':
      return 'The operation timed out.';
    case 'unavailable':
      return 'Firestore is unavailable at this time.';
    case 'failed-precondition':
      return 'The precondition for the operation failed.';
    case 'aborted':
      return 'The operation was aborted.';
    case 'out-of-range':
      return 'The document or field path is too deep.';
    default:
      return 'An unknown Firestore error occurred.';
  }
}

/**
 * A custom error class for handling Firestore errors with user-friendly messages.
 */
export class FirestoreError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FirestoreError';
  }
}

/**
 * Wraps a Firestore operation in a try-catch block and throws a custom FirestoreError with a descriptive message on error.
 *
 * @param {Promise<any>} firestoreOperation The Firestore operation to execute.
 * @returns {Promise<any>} A promise that resolves with the operation's result or rejects with a FirestoreError.
 */
export async function handleFirestoreError(firestoreOperation) {
  try {
    return await firestoreOperation;
  } catch (error) {
    const errorMessage = getFirestoreErrorMessage(error.code);
    throw new FirestoreError(errorMessage);
  }
}
