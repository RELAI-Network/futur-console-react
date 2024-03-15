import {
  signOut,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../config';

/**
 * This callback type is called `onUserAuthStateChanged`. It set the helperText of an invalid form field.
 *
 * @callback onUserAuthStateChanged
 * @param {firebase.auth.User | undefined} user
 */

/**
 * Signs up a new user with email and password.
 *
 * @param {string} email The user's email address.
 * @param {string} password The user's password.
 * @returns {Promise<UserCredential>} A promise resolving to the user credential on successful signup.
 * @throws {CustomError} Throws a custom error with a descriptive message on signup failure.
 */
export async function signUpWithEmailAndPassword(email, password) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    throw new CustomError(errorMessage);
  }
}

/**
 * This function sets up a listener that triggers whenever the user signs in or out.
 *
 * @access     public
 *
 * @param {onUserAuthStateChanged} onStateChanged  Collection of receipts
 */
export async function handleAuthStateChanged(onStateChanged) {
  onAuthStateChanged(auth, (user) => onStateChanged(user));
}

/**
 * Signs in a user with email and password.
 *
 * @param {string} email The user's email address.
 * @param {string} password The user's password.
 * @returns {Promise<UserCredential>} A promise resolving to the user credential on successful sign in.
 * @throws {CustomError} Throws a custom error with a descriptive message on sign in failure.
 */
export async function logInWithEmailAndPassword(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const errorMessage = getAuthSignInErrorMessage(error.code);
    throw new CustomError(errorMessage);
  }
}

/**
 * Signs out the currently signed-in user.
 *
 * @returns {Promise<void>} A promise that resolves when the user is signed out.
 * @throws {CustomError} Throws a custom error if sign out fails.
 */
export async function signOutCurrentUser() {
  try {
    await signOut(auth);
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);

    throw new CustomError(errorMessage);
  }
}

/**
 * Deletes a Firebase user by their user ID.
 *
 * @returns {Promise<void>} A promise that resolves when the user is deleted.
 * @throws {CustomError} Throws a custom error with a descriptive message on deletion failure.
 */
export async function deleteCurrentUser() {
  try {
    await deleteUser(auth.currentUser);
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code); // (Optional) Handle specific error codes
    throw new CustomError(errorMessage || 'An error occurred while deleting the user.');
  }
}

/**
 * Sends a password reset email to the given email address.
 *
 * @param {string} email The email address of the user to send the reset link to.
 * @returns {Promise<void>} A promise that resolves when the reset email is sent.
 * @throws {CustomError} Throws a custom error if sending the reset email fails.
 */
// eslint-disable-next-line no-unused-vars
async function sendPasswordResetEmail(email) {
  try {
    await auth.sendPasswordResetEmail(email);
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    throw new CustomError(errorMessage);
  }
}

/**
 * Gets a descriptive error message based on the Firebase Auth error code.
 *
 * @param {string} errorCode The Firebase Auth error code.
 * @returns {string} A human-readable error message.
 */
function getAuthErrorMessage(errorCode) {
  console.error('getAuthErrorMessage', errorCode);
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'The email address is already in use by another account.';
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/weak-password':
      return 'The password is too weak.';
    case 'auth/wrong-password':
      return 'The email address or password is incorrect.';
    case 'auth/user-not-found':
      return 'The user account does not exist.';
    default:
      return 'An error occurred during authentication.';
  }
}

/**
 * Gets a descriptive error message based on the Firebase Auth error code.
 *
 * @param {string} errorCode The Firebase Auth error code.
 * @returns {string} A human-readable error message.
 */
function getAuthSignInErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/wrong-password':
      return 'The email address or password is incorrect.';
    case 'auth/user-not-found':
      return 'The user account does not exist.';
    case 'auth/network-request-failed':
      return 'There was a network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Please try again later.';
    case 'auth/invalid-credential':
      return 'Invalid credentials provided.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in credentials.';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed. Please contact support.';
    default:
      return 'An error occurred during sign in.';
  }
}

/**
 * A custom error class for handling authentication errors with user-friendly messages.
 */
class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CustomError';
  }
}
