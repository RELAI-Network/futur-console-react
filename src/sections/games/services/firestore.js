/* eslint-disable no-unreachable */
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
import { Timestamp } from 'firebase/firestore';

import { uploadFile, uploadStringFile } from 'src/services/firebase/firestorage/helpers';
import {
  getAll,
  addDocument,
  getDocument,
  updateDocument,
} from 'src/services/firebase/firestore/helpers';
import {
  appsCollection,
  tagsCollection,
  categoriesCollection,
} from 'src/services/firebase/firestore/constants';

export async function getGamesCategories() {
  try {
    const categories = await getAll(categoriesCollection);

    return categories.filter((category) => (category.item_types ?? []).includes('game'));
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getDeveloperGames({ developerId }) {
  try {
    const apps = await getAll(appsCollection);

    return apps.filter((app) => app.app_type === 'game' && `${developerId}` === `${app.publisher_id}`);
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getDeveloperGame({ applicationId }) {
  try {
    return getDocument(appsCollection, applicationId);
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getApplicationReleases({ applicationId }) {
  try {
    return getAll(`${appsCollection}/${applicationId}/releases`);
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

function geneateId() {
  return Math.floor(Math.random() * (999999999999999 - 100000000000000 + 1)) + 100000000000000;
}

export async function uploadToMobSF({ package_file }) {
  const formData = new FormData();

  formData.append('file', package_file);

  formData.append('fileName', package_file.name);

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

export async function scanMobSF({ hash }) {
  const config = {
    headers: {
      'X-Mobsf-Api-Key': import.meta.env.VITE_APP_MOBSF_KEY,
      Authorization: import.meta.env.VITE_APP_MOBSF_KEY,
      'Content-Type': null,
    },
  };

  const { data } = await axios.post(
    `${import.meta.env.VITE_APP_MOBSF_BASE_URL}/upload`,
    {
      hash,
      // re_scan: 0,
    },
    config
  );

  return data;
}

export async function addNewGameRelease({ formData, publisher_id, package_name, application_id }) {
  
  try {
    const mobsfResponse = await uploadToMobSF({
      package_file: formData.package_file,
    });
  
    await scanMobSF({
      hash: mobsfResponse.hash,
    });

    const applicationPackageFileUrl = await uploadFile({
      filePath: `developers/${publisher_id}/games/${application_id}/releases/${package_name}-${formData.version}.apk`,
      file: formData.package_file,
    });

    const applicationLogoUrl = await uploadStringFile({
      filePath: `developers/${publisher_id}/games/${application_id}/releases/logo-${formData.version}`,
      file: formData.package_icon,
      format: 'data_url',
    });

    const date = new Date();

    const documentData = {
      downloads_count: 0,

      application_id,

      logo: applicationLogoUrl ?? '',

      // file_download_url: applicationPackageFileUrl,
      is_beta: false,
      releases_notes: formData.releases_notes,
      version: formData.version,
      size: formData.size,

      added_at: Timestamp.fromDate(date),
      created_at: Timestamp.fromDate(date),

      scan_type: mobsfResponse.scan_type,
      scan_hash: mobsfResponse.hash,
      // scan_status: mobsfResponse.status,
      scan_status: 'waiting',
      scan_file_name: mobsfResponse.file_name,
    };

    const document = await addDocument(
      `${appsCollection}/${application_id}/releases`,
      documentData
    );

    await updateDocument(appsCollection, application_id, {
      app_download_size: formData.size,
      release_file_main_url: applicationPackageFileUrl,
      release_main_url: applicationPackageFileUrl,
      version: formData.version,

      updated_at: Timestamp.fromDate(date),
    });

    return document;
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function addNewGame({ formData, user, categories }) {
  try {
    const id = geneateId();

    const logo_image_square_url = await uploadFile({
      filePath: `developers/${user.web3_account_id}/games/${id}/images/${formData.logo_image_square.name}`,
      file: formData.logo_image_square,
      metadata: { user_id: user.id },
    });

    const cover_image_rect_url = await uploadFile({
      filePath: `developers/${user.web3_account_id}/games/${id}/images/${formData.cover_image_rect.name}`,
      file: formData.cover_image_rect,
      metadata: { user_id: user.id },
    });

    let screenshots = [];

    if (formData.app_screenshots) {
      screenshots = await Promise.all(
        formData.app_screenshots.map(async (file) => {
          const url = await uploadFile({
            filePath: `developers/${user.web3_account_id}/games/${id}/screenshots${file.name}`,
            file,
            metadata: { user_id: user.id },
          });

          screenshots = [...screenshots, url];
        })
      );
    }

    

    const documentData = {
      ...formData,
      id,
      app_type: 'game',
      category_name: categories.find((category) => category.id === formData.category_id).label,
      has_in_app_purchases: formData.has_in_app_purchases === 'true',
      contains_ads: formData.contains_ads === 'true',
      logo_image_square: null,
      cover_image_rect: null,
      logo_image_square_url,
      screenshots,
      app_screenshots: null,
      cover_image_rect_url,
      min_age_required: formData.min_age_requirement,
      note_averrage: 0,
      downloads_count: 0,
      notes_count: 0,
      publisher_id: user.web3_account_id,
      publisher_name: user.web3_account_name,
      privacy_policy_link_url: formData.privacy_policy_link ?? '',
      created_at: Timestamp.fromDate(new Date()),
    };

    const document = await addDocument(appsCollection, documentData, id);

    return document;
  } catch (error) {
    console.error(error);

    throw error;
  }
}
