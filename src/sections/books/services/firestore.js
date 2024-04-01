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

export async function getBookEditions(bookId) {
  try {
    const editions = await getAll(`${booksCollection}/${bookId}/editions`);

    return editions.sort((a, b) => b.created_at - a.created_at);
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getBookEdition({ bookId, editionId }) {
  try {
    return getDocument(`${booksCollection}/${bookId}/editions`, editionId);
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getTags() {
  try {
    const tags = await getAll(tagsCollection);

    return tags;
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function addAndPublishNewBookEdition({
  book_file,
  book_file_name,
  book_file_extension,
  cover_url,
  publisher_id,
  publisher_name,
  publisher_address,
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
      book_id = await addNewBook({ publisher_id, publisher_name, ...formData });
    }

    const bookFileUrl = await uploadFile({
      filePath: `developers/${publisher_id}/books/${book_id}/editions/${book_file_name}.${book_file_extension}`,
      file: book_file,
      onProgress: onUploadProgress,
    });

    const { authors, isbn, language, price, type, title, resume } = formData;

    const bookEditionData = {
      cover_url,
      file_extension: book_file_extension,
      file_main_url: bookFileUrl,
      authors,
      isbn: isbn ?? '',
      book_id,
      resume,
      title,
      price,
      type,
      language,

      published: true,
      published_at: Timestamp.now(),
    };

    await submitAsset({
      user_web3_account_address: publisher_address,
      name: title,
      assetType: 'book',
      publishThisAsset: true,

      price: price ?? 0,

      assetJson: omit(bookEditionData, ['downloads_count', 'cid', 'onchain_id']),

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
        const documentId = await addDocument(`${booksCollection}/${book_id}/editions`, {
          ...bookEditionData,

          downloads_count: 0,
          onchain_id: assetId,
          asset_id: assetId,
          cid: null,
        });

        const bookUpdateData = {
          actual_edition_id: documentId,
          status: 'published',
          published: true,
          published_at: Timestamp.now(),
          updated_at: Timestamp.now(),

          cover_url,
          file_main_url: bookFileUrl,
          authors,
          isbn: isbn ?? '',
          book_id,
          resume,
          title,
          price,
          type,
          language,
        };

        await updateDocument(booksCollection, book_id, bookUpdateData);

        onSuccess?.({ id: book_id, editionId: documentId, document, assetId });
      },
    });
  } catch (error) {
    console.error(error);

    onError?.(error?.message ?? 'An errur occured while submitting the application.');

    throw error;
  }
}

export async function editBookEdition({
  cover_url,
  publisher_id,
  publisher_name,
  publisher_address,
  book_id,
  edition_id,
  onUploadProgress,

  onSuccess,
  onError,
  onProcessing,
  onInit,

  ...formData
}) {
  try {
    if (!book_id || !edition_id) {
      throw new Error('Unable to edit this book at this time. Please try later.');
    }

    const bookEdition = await getBookEdition({ bookId: book_id, editionId: edition_id });

    const { authors, isbn, language, price, type, title, resume } = formData;

    const bookEditionData = {
      ...bookEdition,
      cover_url,
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
      senderAddress: publisher_address,
      assetId: bookEdition.onchain_id,
      name: title,
      assetType: 'book',
      publishThisAsset: bookEdition.published ?? true,

      price: price ?? 0,

      assetJson: omit(bookEditionData, ['downloads_count', 'cid', 'onchain_id']),

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
      onSuccess: async () => {
        await updateDocument(`${booksCollection}/${book_id}/editions`, edition_id, bookEditionData);

        const book = await getPublisherBook({ bookId: book_id });

        const bookUpdateData = {
          updated_at: Timestamp.now(),

          ...(book.actual_edition_id === edition_id
            ? {
                cover_url,
                authors,
                isbn: isbn ?? '',
                resume,
                title,
                price,
                type,
                language,
              }
            : {}),
        };

        await updateDocument(booksCollection, book_id, bookUpdateData);

        onSuccess?.({ id: book_id, editionId: edition_id, document });
      },
    });
  } catch (error) {
    console.error(error);

    onError?.(error?.message ?? 'An errur occured while submitting the application.');

    throw error;
  }
}

export async function unPublishBookEdition({ book_id, edition_id }) {
  try {
    const book = await getBookEdition({
      bookId: book_id,
      editionId: edition_id,
    });

    if (book?.published ?? false) {
      await updateDocument(`${booksCollection}/${book_id}/editions`, edition_id, {
        published: false,
        un_published_at: Timestamp.now(),
      });

      await updateDocument(booksCollection, edition_id, {
        actual_release_id: null,
        status: 'un_published',
        published: false,
        un_published_at: Timestamp.now(),
      });

      return book.id;
    }

    throw new Error('Book edition is not published.');
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function removeBookEdition({ book_id, edition_id }) {
  try {
    const book = await getBookEdition({
      bookId: book_id,
      editionId: edition_id,
    });

    await deleteDocument(`${booksCollection}/${book_id}/editions`, edition_id);

    if (book?.published ?? false) {
      await updateDocument(booksCollection, book_id, {
        actual_release_id: null,
        status: 'un_published',
        published: false,
        un_published_at: Timestamp.now(),
      });
    }

    return true;
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function addNewBook({ publisher_id, publisher_name, ...formData }) {
  try {
    const { authors, isbn, language, price, type, title, resume, category_id, description, genre } =
      formData;

    const documentId = await addDocument(booksCollection, {
      authors,
      category_id,
      description,
      genre,
      isbn: isbn ?? '',
      resume,
      title,
      price,
      type,
      language,
      publisher_id,
      publisher_name,
      created_at: Timestamp.now(),
      published: false,
      published_at: null,
    });

    return documentId;
  } catch (error) {
    console.error(error);

    throw error;
  }
}
