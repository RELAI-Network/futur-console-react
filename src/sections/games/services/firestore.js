/* eslint-disable no-unreachable */
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
import { omit, toInteger } from 'lodash';
import { Timestamp } from 'firebase/firestore';

import { getAll, addDocument, updateDocument } from 'src/services/firebase/firestore/helpers';
import { appsCollection, categoriesCollection } from 'src/services/firebase/firestore/constants';

import { submitAsset, updateAsset } from 'src/sections/apps/services/polkadot-tx';
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
    rejectUnauthorized: false,
    timeout: 0,
  };

  const { data } = await axios.post(
    // `${import.meta.env.VITE_APP_MOBSF_BASE_URL}/upload`,
    `//34.163.31.92:8000/api/v1/upload`,
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
    rejectUnauthorized: false,
    timeout: 0,
  };

  const { data } = await axios.post(
    // `${import.meta.env.VITE_APP_MOBSF_BASE_URL}/upload`,
    `//34.163.31.92:8000/api/v1/upload`,
    {
      hash,
      // re_scan: 0,
    },
    config
  );

  return data;
}

export async function addNewGame({
  formData,
  user,
  categories,
  onSuccess,
  onError,
  onProcessing,
  onInit,
}) {
  try {
    const id = generateId();

    const cover_image_rect_url = formData.cover_image_rect_url
      ? formData.cover_image_rect_url
      : null;

    const documentData = {
      ...formData,
      id,
      app_type: 'game',
      category_id: formData.category_id,
      category_name: categories.find((category) => category.id === formData.category_id).label,
      has_in_app_purchases: formData.has_in_app_purchases === 'true',
      contains_ads: formData.contains_ads === 'true',
      logo_image_square_url: formData.logo_image_square_url,
      screenshots: formData.screenshots,
      cover_image_rect_url,
      min_age_requirement: toInteger(`${formData.min_age_requirement}`),
      notes_average: 0,
      downloads_count: 0,
      notes_count: 0,
      publisher_id: user.web3_account_id,
      publisher_name: user.web3_account_name,
      publisher_address: user.web3_account_address,
      privacy_policy_link_url: formData.privacy_policy_link ?? '',
      created_at: Timestamp.fromDate(new Date()),

      cid: null,
    };

    await submitAsset({
      user_web3_account_address: user.web3_account_address,
      name: documentData.name,
      assetType: documentData.app_type,
      publishThisAsset: false,

      price: documentData.price ?? 0,

      assetJson: omit(documentData, ['downloads_count', 'cid', 'onchain_id']),

      onStartup: ({ payment }) => {
        onInit?.(payment);
      },
      onError: (e) => {
        console.error(e);

        onError?.(e?.message ?? 'An errur occured while submitting the game.');

        throw e;
      },

      onProcessing: (r) => {
        const { isInBlock, isFinalized, isCompleted, isError, log } = r;

        onProcessing?.({ isInBlock, isFinalized, isCompleted, isError, log });
      },
      onSuccess: async ({ assetId }) => {
        const document = await addDocument(
          appsCollection,
          { asset_id: assetId, onchain_id: assetId, ...documentData },
          id
        );

        onSuccess?.({ id: document, assetId });
      },
    });
  } catch (error) {
    console.error(error);

    onError?.(error?.message ?? 'An errur occured while submitting the game.');

    throw error;
  }
}

export async function editGame({
  formData,
  gameId,
  user,
  categories,
  onSuccess,
  onError,
  onProcessing,
  onInit,
}) {
  try {
    if (!gameId) {
      throw new Error('Unable to edit this game at this time. Please try later.');
    }

    const game = getDeveloperGame({ applicationId: gameId });

    const cover_image_rect_url = formData.cover_image_rect_url
      ? formData.cover_image_rect_url
      : null;

    formData = { ...game, ...formData };

    const documentData = {
      ...formData,
      category_id: formData.category_id,
      category_name: categories.find((category) => category.id === formData.category_id).label,
      has_in_app_purchases: formData.has_in_app_purchases === 'true',
      contains_ads: formData.contains_ads === 'true',
      logo_image_square_url: formData.logo_image_square_url,
      screenshots: formData.screenshots,
      cover_image_rect_url,
      min_age_requirement: toInteger(`${formData.min_age_requirement}`),
      privacy_policy_link_url: formData.privacy_policy_link ?? '',
      updated_at: Timestamp.fromDate(new Date()),
    };

    await updateAsset({
      senderAddress: user.web3_account_address,
      assetId: game.onchain_id,
      name: documentData.name,
      assetType: documentData.app_type,
      publishThisAsset: documentData.published,

      price: documentData.price ?? 0,

      assetJson: omit(documentData, ['downloads_count', 'cid', 'onchain_id']),

      onStartup: ({ payment }) => {
        onInit?.(payment);
      },
      onError: (e) => {
        console.error(e);

        onError?.(e?.message ?? 'An errur occured while updating the game.');

        throw e;
      },

      onProcessing: (r) => {
        const { isInBlock, isFinalized, isCompleted, isError, log } = r;

        onProcessing?.({ isInBlock, isFinalized, isCompleted, isError, log });
      },
      onSuccess: async () => {
        await updateDocument(appsCollection, gameId, documentData);

        onSuccess?.({ id: gameId, assetId: game.onchain_id });
      },
    });
  } catch (error) {
    console.error(error);

    onError?.(error?.message ?? 'An errur occured while updating the game.');

    throw error;
  }
}
