import { usersCollection } from './constants';
import { addDocument, getDocument, updateDocument } from './helpers';
import {
  deleteCurrentUser,
  signOutCurrentUser,
  handleAuthStateChanged,
  logInWithEmailAndPassword,
  signUpWithEmailAndPassword,
} from '../auth';

/**
 * This callback type is called `onError`.
 *
 * @callback onError
 * @param {string} errorMessage
 */

/**
 * This callback type is called `onError`.
 *
 * @callback onSuccess
 * @param {Object} options - The options object.
 * @param {UserCredential} options.credential - .
 * @param {string} options.userDocId - .
 * @param {User} options.user - .
 */

/**
 * Register a user with the provided form data.
 * @param {Object} options - The options object.
 * @param {onError} options.onError - The function to call if an error occurs during registration.
 * @param {onSuccess} options.onSuccess - The function to call when registration is successful.
 * @param {Object} options.formData - The form data containing the user's information.
 * @param {string} options.formData.name - The name of the user.
 * @param {string} options.formData.email - The email of the user.
 * @param {string} options.formData.password - The password of the user.
 * @param {string} options.formData.website - The website of the user.
 * @returns {Promise<void>}
 */
export async function registerNewUser({ onError, onSuccess, formData, onLogOut }) {
  try {
    let credential;

    try {
      credential = await signUpWithEmailAndPassword(formData.email.toLowerCase(), formData.password);
    } catch (e) {
      console.error(e);

      onError(e?.message ?? 'An error occured.');

      return;
    }
    const user = {
      uid: credential.user.uid,
      ...formData,
      created_at: new Date().toISOString(),
      password: null,
    };

    const docId = await addDocument(usersCollection, user, credential.user.uid);
    
    handleAuthStateChanged((authUser) => {
      if (!authUser) {
        onLogOut();
      }
    });

    onSuccess({ userDocId: docId, user, credential });
  } catch (e) {
    signOutCurrentUser();

    deleteCurrentUser();

    onError(e?.message ?? 'An error occured.');
  }
}

/**
 * Sign In an user
 * @param {Object} options - The options object.
 * @param {onError} options.onError - The function to call if an error occurs during registration.
 * @param {onSuccess} options.onSuccess - The function to call when registration is successful.
 * @param {Object} options.formData - The form data containing the user's information.
 * @param {string} options.formData.name - The name of the user.
 * @param {string} options.formData.email - The email of the user.
 * @param {string} options.formData.password - The password of the user.
 * @param {string} options.formData.website - The website of the user.
 * @returns {Promise<void>}
 */
export async function signInUser({ onError, onSuccess, formData, onLogOut }) {
  let credential;

  try {
    try {
      credential = await logInWithEmailAndPassword(formData.email.toLowerCase(), formData.password);
    } catch (e) {
      console.error(e);

      onError(e?.message ?? 'An error occured.');

      return;
    }

    await updateDocument(usersCollection, credential.user.uid, {
      last_connection: new Date().toISOString(),
    });
    
    handleAuthStateChanged((authUser) => {
      if (!authUser) {
        onLogOut();
      }
    });

    onSuccess({
      userDocId: credential.user.uid,
      user: await getDocument(usersCollection, credential.user.uid),
      credential,
    });
  } catch (e) {
    onSuccess({
      userDocId: credential.user.uid,
      user: credential.user,
      credential,
      errorMessage: e?.message ?? 'An error occured.',
    });
  }
}

/**
 * Sign In an user
 * @param {Object} options - The options object.
 * @param {onError} options.onError - The function to call if an error occurs during registration.
 * @param {onSuccess} options.onSuccess - The function to call when registration is successful.
 * @param {Object} options.formData - The form data containing the user's information.
 * @param {string} options.formData.name - The name of the user.
 * @param {string} options.formData.email - The email of the user.
 * @param {string} options.formData.password - The password of the user.
 * @param {string} options.formData.website - The website of the user.
 * @returns {Promise<void>}
 */
export async function logUserOut({ onError, onSuccess, userId }) {
  try {
    try {
      await updateDocument(usersCollection, userId, {
        last_connection: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
    }

    await signOutCurrentUser();

    onSuccess();
  } catch (e) {
    onError(e?.message ?? 'An error occured.');
  }
}
