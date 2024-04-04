/* eslint-disable no-debugger */
/* eslint-disable consistent-return */
/* eslint-disable no-unreachable */
// eslint-disable-next-line import/no-extraneous-dependencies

import { omit } from 'lodash';
import { Timestamp } from 'firebase/firestore';

import { uploadFile } from 'src/services/firebase/firestorage/helpers';
import {
  tagsCollection,
  booksCollection,
  categoriesCollection,
} from 'src/services/firebase/firestore/constants';
// eslint-disable-next-line import/named
import {
  getAll,
  addDocument,
  getDocument,
  getAllWhere,
  updateDocument,
  deleteDocument,
} from 'src/services/firebase/firestore/helpers';

import { submitAsset, updateAsset } from 'src/sections/apps/services/polkadot-tx';

export async function getBooksCategories() {
  try {
    return getAllWhere(categoriesCollection, 'item_types', 'array-contains', 'book');
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getBookReviews({ bookId }) {
  try {
    const reviews = await getAll(`${booksCollection}/${bookId}/reviews`);

    return reviews.sort((a, b) => b.added_at - a.added_at);
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getPublisherBooks({ developerId }) {
  try {
    return getAllWhere(booksCollection, 'publisher_id', '==', developerId);
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getPublisherBook({ bookId }) {
  try {
    return getDocument(booksCollection, bookId);
  } catch (error) {
    console.error(error);

    throw error;
  }
}

// export async function getBookEditions(bookId) {
//   try {
//     const editions = await getAll(`${booksCollection}/${bookId}/editions`);

//     return editions.sort((a, b) => b.created_at - a.created_at);
//   } catch (error) {
//     console.error(error);

//     throw error;
//   }
// }

// export async function getBookEdition({ bookId, editionId }) {
//   try {
//     return getDocument(`${booksCollection}/${bookId}/editions`, editionId);
//   } catch (error) {
//     console.error(error);

//     throw error;
//   }
// }

export async function getTags() {
  try {
    const tags = await getAll(tagsCollection);

    return tags;
  } catch (error) {
    console.error(error);

    throw error;
  }
}

function generateId() {
  return Math.floor(Math.random() * (999999999999999 - 100000000000000 + 1)) + 100000000000000;
}

export async function addAndPublishNewBook({
  book_file,
  book_file_name,
  book_file_extension,
  cover_url,
  publisher_id,
  publisher_name,
  publisher_address,

  onUploadProgress,

  onSuccess,
  onError,
  onProcessing,
  onInit,

  ...formData
}) {
  try {
    const book_id = generateId();

    const { authors, isbn, language, price, type, title, resume, category_id, description, genre } =
      formData;

    const bookFileUrl = await uploadFile({
      filePath: `developers/${publisher_id}/books/${book_id}/${book_file_name}.${book_file_extension}`,
      file: book_file,
      onProgress: onUploadProgress,
    });

    debugger;

    const bookData = {
      authors,
      category_id,
      description,
      genre,
      id: book_id,
      isbn: isbn ?? '',
      resume,
      title,
      price,
      type,
      language,
      publisher_id,
      publisher_name,
      publisher_address,
      created_at: Timestamp.now(),

      cover_url,
      file_main_url: bookFileUrl,
      book_id,

      file_extension: book_file_extension,
      file_name: book_file_name,

      published: true,
      published_at: Timestamp.now(),
    };

    debugger;

    await submitAsset({
      user_web3_account_address: publisher_address,
      name: title,
      assetType: 'book',
      publishThisAsset: true,

      price: price ?? 0,

      assetJson: bookData,

      onStartup: ({ payment }) => {
        onInit?.(payment);
      },
      onError: (e) => {
        console.error(e);

        onError?.(e?.message ?? 'An errur occured while adding the book edition.');

        throw e;
      },

      onProcessing: (r) => {
        const { isInBlock, isFinalized, isCompleted, isError, log } = r;

        onProcessing?.({ isInBlock, isFinalized, isCompleted, isError, log });
      },
      onSuccess: async ({ assetId }) => {
        debugger;

        const documentId = await addDocument(
          booksCollection,
          {
            ...bookData,

            status: 'published',
            downloads_count: 0,
            onchain_id: assetId,
            asset_id: assetId,
            cid: null,
          },
          book_id
        );

        debugger;

        onSuccess?.({ id: book_id, editionId: documentId, document, assetId });
      },
    });
  } catch (error) {
    console.error(error);

    onError?.(error?.message ?? 'An errur occured while submitting the book.');

    throw error;
  }
}

export async function editBook({
  cover_url,
  book_id,
  onUploadProgress,

  onSuccess,
  onError,
  onProcessing,
  onInit,

  ...formData
}) {
  try {
    if (!book_id) {
      throw new Error('Unable to edit this book at this time. Please try later.');
    }

    const book = await getPublisherBook({ bookId: book_id });

    const { authors, isbn, language, price, type, title, resume, category_id, description, genre } =
      formData;

    const bookData = {
      ...book,
      cover_url,
      category_id,
      description,
      genre,
      authors,
      isbn: isbn ?? '',
      book_id,
      resume,
      title,
      price,
      type,
      language,

      updated_at: Timestamp.now(),
    };

    await updateAsset({
      senderAddress: book.publisher_address,
      assetId: book.onchain_id,
      name: title,
      assetType: 'book',
      publishThisAsset: book.published ?? true,

      price: price ?? 0,

      assetJson: omit(bookData, ['downloads_count', 'cid', 'onchain_id']),

      onStartup: ({ payment }) => {
        onInit?.(payment);
      },
      onError: (e) => {
        console.error(e);

        onError?.(e?.message ?? 'An errur occured while updating this book.');

        throw e;
      },

      onProcessing: (r) => {
        const { isInBlock, isFinalized, isCompleted, isError, log } = r;

        onProcessing?.({ isInBlock, isFinalized, isCompleted, isError, log });
      },
      onSuccess: async () => {
        await updateDocument(booksCollection, book_id, bookData);

        onSuccess?.({ id: book_id });
      },
    });
  } catch (error) {
    console.error(error);

    onError?.(error?.message ?? 'An errur occured while submitting the application.');

    throw error;
  }
}

export async function unPublishBook({ book_id }) {
  try {
    const book = await getPublisherBook({
      bookId: book_id,
    });

    if (!(book?.published ?? false)) {
      throw new Error('Book edition is not published.');
    }

    await updateDocument(booksCollection, book_id, {
      published: false,
      status: 'un_published',
      un_published_at: Timestamp.now(),
    });

    return book.id;
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function removeBook({ book_id }) {
  try {
    const book = await getPublisherBook({
      bookId: book_id,
    });

    if (book === null) {
      throw new Error('Unable to delete this book at this time ; please retry later.');
    }

    if (book?.published ?? false) {
      throw new Error('Unpublish the book before deleting it.');
    }

    await deleteDocument(booksCollection, book_id);
  } catch (error) {
    console.error(error);

    throw error;
  }
}
