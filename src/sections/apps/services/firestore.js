/* eslint-disable no-debugger */
/* eslint-disable consistent-return */
/* eslint-disable no-unreachable */
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
import { omit, toInteger } from 'lodash';
import { Timestamp } from 'firebase/firestore';

import { uploadFile, uploadStringFile } from 'src/services/firebase/firestorage/helpers';
import {
  appsCollection,
  tagsCollection,
  categoriesCollection,
} from 'src/services/firebase/firestore/constants';
// eslint-disable-next-line import/named
import {
  getAll,
  addDocument,
  getDocument,
  getAllWhere,
  updateDocument,
} from 'src/services/firebase/firestore/helpers';

import { minScanScore } from '../constants';
import { submitAsset, updateAsset, pubUnblishAsset } from './polkadot-tx';

export async function getAppsCategories() {
  try {
    return getAllWhere(categoriesCollection, 'item_types', 'array-contains', 'app');
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getDeveloperApplications({ developerId }) {
  try {
    const apps = await getAll(appsCollection);

    return apps
      .filter((app) => app.app_type === 'app' && `${developerId}` === `${app.publisher_id}`)
      .map((app) => ({
        id: app.id,
        ...app,
        app_version: toInteger(`${app.version}`.replaceAll('.', '')),
      }))
      .sort((a, b) => b.app_version - a.app_version);
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getDeveloperApplication({ applicationId }) {
  try {
    return getDocument(appsCollection, applicationId);
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getApplicationReleases({ applicationId }) {
  try {
    const releases = await getAll(`${appsCollection}/${applicationId}/releases`);

    return releases
      .sort((a, b) => b.created_at - a.created_at)
      .map((release) => ({
        id: release.id,
        ...release,
        release_version: toInteger(`${release.version}`.replaceAll('.', '')),
        release_version_code: toInteger(`${release.version_code}`),
      }))
      .sort((a, b) => b.release_version - a.release_version);
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getApplicationRelease({ applicationId, releaseId }) {
  try {
    return getDocument(`${appsCollection}/${applicationId}/releases`, releaseId);
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

function generateId() {
  return Math.floor(Math.random() * (999999999999999 - 100000000000000 + 1)) + 100000000000000;
}
/**
 * Uploads a file to MobSF server.
 *
 * @param {Object} package_file - The file to be uploaded
 * @return {Promise<{scan_type: String, hash: String, file_name: String, status: String}>} The response data from the server
 */
export async function uploadToMobSF({ package_file }) {
  const formData = new FormData();

  formData.append('file', package_file);

  formData.append('fileName', package_file.name);

  // throw new Error('internal', 'Not implemented');

  const config = {
    // headers: {
    //   'content-type': 'multipart/form-data',
    //   'Authorization': 'cec4291d2049e5495c8b8d4f7a9c1976d39d948a66f8dc8256aa545f6ccadfc0'
    // },
    headers: {
      'X-Mobsf-Api-Key': import.meta.env.VITE_APP_MOBSF_KEY,
      Authorization: import.meta.env.VITE_APP_MOBSF_KEY,
      // 'Content-Type': 'application/octet-stream',
      // 'Content-Type': 'multipart/form-data',
      'content-type': 'multipart/form-data',
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

  formData.append('re_scan', 0);

  const config = {
    headers: {
      'X-Mobsf-Api-Key': import.meta.env.VITE_APP_MOBSF_KEY,
      // Authorization: import.meta.env.VITE_APP_MOBSF_KEY,
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
export async function addNewApplicationRelease({
  formData,
  publisher_id,
  package_name,
  application_id,
  app_type = 'app',
  onUploadProgress,
}) {
  try {
    await throwErrorWhenApplicationVersionExists({
      application_id,
      version_code: formData.version_code,
      version: formData.version,
    });

    const mobsfResponse = await uploadToMobSF({
      package_file: formData.package_file,
    });

    // const { appsec } = await scanMobSF(mobsfResponse.hash);

    // if ((appsec?.security_score ?? 0) < minScanScore) {
    //   throw new Error(`Security score of ${app_type} is too low : ${appsec?.security_score}`);
    // }

    const applicationPackageFileUrl = await uploadFile({
      filePath: `developers/${publisher_id}/${app_type}s/${application_id}/releases/${package_name}-${formData.version}.apk`,
      file: formData.package_file,
      onProgress: onUploadProgress,
    });

    const applicationLogoUrl = await uploadStringFile({
      filePath: `developers/${publisher_id}/${app_type}s/${application_id}/releases/logo-${formData.version}`,
      file: formData.package_icon,
      format: 'data_url',
    });

    const date = new Date();

    const documentData = {
      downloads_count: 0,

      application_id,

      logo: applicationLogoUrl ?? '',

      file_download_url: applicationPackageFileUrl,
      release_file_main_url: applicationPackageFileUrl,
      is_beta: false,
      releases_notes: formData.releases_notes,
      version: formData.version,
      version_code: formData.version_code,
      size: formData.size,

      added_at: Timestamp.fromDate(date),
      created_at: Timestamp.fromDate(date),

      scan_type: mobsfResponse.scan_type,
      scan_hash: mobsfResponse.hash,
      scan_status: mobsfResponse.status,
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
      version_code: formData.version_code,

      updated_at: Timestamp.fromDate(date),
    });

    return document;
  } catch (error) {
    console.error(error);

    throw error;
  }
}

async function throwErrorWhenApplicationVersionExists({
  application_id,
  version_code,
  version,
  release_id,
}) {
  let othersReleases = await getApplicationReleases({ applicationId: application_id });

  if (release_id) {
    othersReleases = othersReleases.filter((release) => release.id !== release_id);
  }

  if (othersReleases.length > 0) {
    const othersReleasesVersionCodes = othersReleases
      .map((release) => release.release_version_code)
      .sort((a, b) => b - a);

    if (othersReleasesVersionCodes.includes(version_code)) {
      throw new Error(`A release with version code ${version_code} already exists.`);
    }

    if (othersReleasesVersionCodes[0] >= toInteger(`${version_code}`)) {
      throw new Error(
        `Your release version code ${version_code} must be greater than ${othersReleasesVersionCodes[0]}.`
      );
    }

    const othersReleasesVersion = othersReleases
      .filter((release) => !!release.published_at)
      .map((release) => release.release_version)
      .sort((a, b) => b - a);

    if (othersReleasesVersion.length > 0) {
      if (othersReleasesVersion[0] >= toInteger(`${version}`.replaceAll('.', ''))) {
        throw new Error(
          `App release version (${version}) must be greater than latest version (${othersReleases[0].version}).`
        );
      }
    }
  }
}

export async function publishApplicationRelease({
  application_id,
  release_id,
  user_account,
  onSuccess,
  onError,
  onProcessing,
  onInit,
}) {
  try {
    const release = await getApplicationRelease({
      applicationId: application_id,
      releaseId: release_id,
    });

    await throwErrorWhenApplicationVersionExists({
      application_id,
      version_code: release.version_code,
      version: release.version,
      release_id: release.id,
    });

    if (release?.scan_hash) {
      const { appsec, ...props } = await scanMobSF(release?.scan_hash);

      if ((appsec?.security_score ?? 0) > minScanScore) {
        const application = await getDeveloperApplication({
          applicationId: application_id,
        });

        await pubUnblishAsset({
          senderAddress: user_account,
          assetId: application.asset_id,
          publishThisAsset: true,

          onError: (e) => {
            console.error(e);

            onError?.(e?.message ?? 'An errur occured while publishing the application.');

            throw e;
          },
          onStartup: ({ payment }) => {
            onInit?.(payment);
          },
          onProcessing: (r) => {
            const { isInBlock, isFinalized, isCompleted, isError, log } = r;

            onProcessing?.({ isInBlock, isFinalized, isCompleted, isError, log });
          },
          onSuccess: async ({ assetId }) => {
            await updateDocument(`${appsCollection}/${application_id}/releases`, release_id, {
              scan_virus_total: props.virus_total,
              scan_version_name: props.version_name,
              scan_version_code: props.version_code,
              scan_version: props.version,
              scan_size: props.size,
              scan_target_sdk: props.target_sdk,
              scan_min_sdk: props.min_sdk,
              scan_max_sdk: props.max_sdk,
              scan_hash: appsec.hash,
              scan_app_name: appsec.app_name,
              scan_file_name: appsec.file_name,
              scan_score: appsec.security_score,
              scan_security_score: appsec.security_score,
              scan_total_trackers: appsec.total_trackers,
              published: true,
              published_at: Timestamp.now(),
            });

            await updateDocument(appsCollection, application_id, {
              actual_release_id: release_id,
              status: 'published',
              published: true,
              published_at: Timestamp.now(),
              asset_id: assetId,
              onchain_id: assetId,
            });

            let othersReleases = await getApplicationReleases({ applicationId: application_id });
            othersReleases = othersReleases.filter((r) => r.id !== release_id);

            if (othersReleases.length > 1) {
              // eslint-disable-next-line no-plusplus
              for (let index = 0; index < othersReleases.length; index++) {
                const otherRelease = othersReleases[index];
                // eslint-disable-next-line no-await-in-loop
                await updateDocument(
                  `${appsCollection}/${application_id}/releases`,
                  otherRelease.id,
                  {
                    published: false,
                    ...(otherRelease.published ? { un_published_at: Timestamp.now() } : {}),
                  }
                );
              }
            }

            onSuccess?.(release.id);
          },
        });
      } else {
        throw new Error(`Security score of application is too low : ${appsec?.security_score}`);
      }
    } else {
      throw new Error('Scan of application failed.');
    }
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function unPublishApplicationRelease({
  application_id,
  release_id,
  user_account,
  onSuccess,
  onError,
  onProcessing,
  onInit,
}) {
  try {
    const release = await getApplicationRelease({
      applicationId: application_id,
      releaseId: release_id,
    });

    const application = await getDeveloperApplication({
      applicationId: application_id,
    });

    if (release?.published ?? false) {
      await pubUnblishAsset({
        senderAddress: user_account,
        assetId: application.asset_id,
        publishThisAsset: false,

        onError: (e) => {
          console.error(e);

          onError?.(e?.message ?? 'An errur occured while publishing the application.');

          throw e;
        },
        onStartup: ({ payment }) => {
          onInit?.(payment);
        },
        onProcessing: (r) => {
          const { isInBlock, isFinalized, isCompleted, isError, log } = r;

          onProcessing?.({ isInBlock, isFinalized, isCompleted, isError, log });
        },
        onSuccess: async () => {
          await updateDocument(`${appsCollection}/${application_id}/releases`, release_id, {
            published: false,
            un_published_at: Timestamp.now(),
          });

          await updateDocument(appsCollection, application_id, {
            actual_release_id: null,
            status: 'un_published',
            published: false,
            un_published_at: Timestamp.now(),
          });

          onSuccess?.(release.id);
        },
      });
    } else {
      throw new Error('Application release is not published.');
    }
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function addNewApplication({
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
      app_type: 'app',
      category_id: formData.category_id,
      category_name: categories.find((category) => category.id === formData.category_id).label,
      has_in_app_purchases: formData.has_in_app_purchases === 'true',
      contains_ads: formData.contains_ads === 'true',
      logo_image_square_url: formData.logo_image_square_url,
      screenshots: formData.screenshots,
      cover_image_rect_url,
      min_age_required: toInteger(`${formData.min_age_requirement}`),
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

        onError?.(e?.message ?? 'An errur occured while submitting the application.');

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

    onError?.(error?.message ?? 'An errur occured while submitting the application.');

    throw error;
  }
}

export async function editApplication({
  formData,
  applicationId,
  user,
  categories,
  onSuccess,
  onError,
  onProcessing,
  onInit,
}) {
  try {
    if (!applicationId) {
      throw new Error('Unable to edit this application at this time. Please try later.');
    }

    const application = await getDeveloperApplication({
      applicationId,
    });

    const cover_image_rect_url = formData.cover_image_rect_url
      ? formData.cover_image_rect_url
      : null;

    formData = { ...application, ...formData };

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
      assetId: application.onchain_id,
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

        onError?.(e?.message ?? 'An errur occured while submitting the application.');

        throw e;
      },

      onProcessing: (r) => {
        const { isInBlock, isFinalized, isCompleted, isError, log } = r;

        onProcessing?.({ isInBlock, isFinalized, isCompleted, isError, log });
      },
      onSuccess: async () => {
        await updateDocument(appsCollection, applicationId, documentData);

        onSuccess?.({ id: applicationId, assetId: application.onchain_id });
      },
    });
  } catch (error) {
    console.error(error);

    onError?.(error?.message ?? 'An errur occured while submitting the application.');

    throw error;
  }
}
