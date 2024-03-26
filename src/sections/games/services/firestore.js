/* eslint-disable no-unreachable */
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
import { Timestamp } from 'firebase/firestore';

import { uploadFile } from 'src/services/firebase/firestorage/helpers';
import { getAll, addDocument } from 'src/services/firebase/firestore/helpers';
import { appsCollection, categoriesCollection } from 'src/services/firebase/firestore/constants';

import {
  getApplicationReleases,
  getDeveloperApplication,
} from 'src/sections/apps/services/firestore';

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

    return apps.filter(
      (app) => app.app_type === 'game' && `${developerId}` === `${app.publisher_id}`
    );
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getDeveloperGame({ applicationId }) {
  return getDeveloperApplication({ applicationId });
}

export async function getGameReleases({ applicationId }) {
  return getApplicationReleases({ applicationId });
}

function generateId() {
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

export async function addNewGame({ formData, user, categories }) {
  try {
    const id = generateId();

    const logo_image_square_url = await uploadFile({
      filePath: `developers/${user.web3_account_id}/games/${id}/images/${formData.logo_image_square.name}`,
      file: formData.logo_image_square,
      metadata: { user_id: user.id },
    });

    const cover_image_rect_url = formData.cover_image_rect
      ? await uploadFile({
          filePath: `developers/${user.web3_account_id}/games/${id}/images/${formData.cover_image_rect.name}`,
          file: formData.cover_image_rect,
          metadata: { user_id: user.id },
        })
      : null;

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
