/* eslint-disable no-debugger */
/* eslint-disable consistent-return */
/* eslint-disable no-unreachable */
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
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

export async function getPublisherBook({ applicationId }) {
  try {
    return getDocument(booksCollection, applicationId);
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
/**
 * Uploads a file to MobSF server.
 *
 * @param {Object} book_file - The file to be uploaded
 * @return {Promise<{scan_type: String, hash: String, file_name: String, status: String}>} The response data from the server
 */
export async function uploadToMobSF(book_file) {
  const formData = new FormData();

  formData.append('file', book_file);

  formData.append('fileName', book_file.name);

  const config = {
    headers: {
      'X-Mobsf-Api-Key': import.meta.env.VITE_APP_MOBSF_KEY,
      Authorization: import.meta.env.VITE_APP_MOBSF_KEY,
      'Content-Type': 'multipart/form-data',
    },
  };

  const { data } = await axios.post(
    `${import.meta.env.VITE_APP_MOBSF_BASE_URL}/upload`,
    formData,
    config
  );

  return data;
}

export async function scanMobSF(hash) {
  const formData = new FormData();

  formData.append('hash', hash);

  const config = {
    headers: {
      'X-Mobsf-Api-Key': import.meta.env.VITE_APP_MOBSF_KEY,
      Authorization: import.meta.env.VITE_APP_MOBSF_KEY,
      // 'Content-Type': null,
    },
  };

  const { data } = await axios.post(
    `${import.meta.env.VITE_APP_MOBSF_BASE_URL}/scan`,
    formData,
    config
  );

  return data;
}
export async function addAndPublishNewBookEdition({
  book_file,
  book_file_name,
  book_file_extension,
  book_cover_file,
  book_cover_file_name,
  publisher_id,
  publisher_name,
  book_id,
  ...formData
}) {
  try {
    if (!book_id) {
      book_id = await addNewBook({ publisher_id, publisher_name, ...formData });
    }

    const bookCoverFileUrl = await uploadFile({
      filePath: `developers/${publisher_id}/books/${book_id}/editions/covers/${book_cover_file_name}`,
      file: book_cover_file,
    });

    const bookFileUrl = await uploadFile({
      filePath: `developers/${publisher_id}/books/${book_id}/editions/${book_file_name}.${book_file_extension}`,
      file: book_file,
    });

    const { authors, isbn, language, price, type, title, resume } = formData;

    const documentId = await addDocument(`${booksCollection}/${book_id}/editions`, {
      cover_url: bookCoverFileUrl,
      file_extension: book_file_extension,
      file_main_url: bookFileUrl,
      authors,
      isbn,
      book_id,
      resume,
      title,
      price,
      type,
      language,

      published: true,
      published_at: Timestamp.now(),
    });

    await updateDocument(booksCollection, book_id, {
      actual_edition_id: documentId,
      status: 'published',
      published: true,
      published_at: Timestamp.now(),
      updated_at: Timestamp.now(),

      cover_url: bookCoverFileUrl,
      file_main_url: bookFileUrl,
      authors,
      isbn,
      book_id,
      resume,
      title,
      price,
      type,
      language,
    });

    let editions = await getBookEditions(book_id);

    editions = editions.filter((book) => book.id !== documentId);

    if (editions.length > 1) {
      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < editions.length; index++) {
        const edition = editions[index];
        // eslint-disable-next-line no-await-in-loop
        await updateDocument(`${booksCollection}/${book_id}/editions`, edition.id, {
          published: false,
          ...(edition.published ? { un_published_at: Timestamp.now() } : {}),
        });
      }
    }

    return documentId;
  } catch (error) {
    console.error(error);

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
      isbn,
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
