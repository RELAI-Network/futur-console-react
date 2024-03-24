/* eslint-disable no-debugger */
/* eslint-disable consistent-return */
/* eslint-disable no-unreachable */
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
import { Timestamp } from 'firebase/firestore';

import { uploadFile, uploadStringFile } from 'src/services/firebase/firestorage/helpers';
// eslint-disable-next-line import/named
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

export async function getAppsCategories() {
  try {
    const categories = await getAll(categoriesCollection);

    return categories.filter((category) => (category.item_types ?? []).includes('app'));
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function getDeveloperApplications({ developerId }) {
  try {
    const apps = await getAll(appsCollection);

    return apps.filter(
      (app) => app.app_type === 'app' && `${developerId}` === `${app.publisher_id}`
    );
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

    return releases.sort((a, b) => b.created_at - a.created_at);
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

function geneateId() {
  return Math.floor(Math.random() * (999999999999999 - 100000000000000 + 1)) + 100000000000000;
}
/**
 * Uploads a file to MobSF server.
 *
 * @param {Object} package_file - The file to be uploaded
 * @return {{scan_type: String, hash: String, file_name: String, status: String}} The response data from the server
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

export async function scanMobSF({ hash }) {
  const formData = new FormData();

  formData.append('hash', hash);

  // formData.append('re_scan', package_file.name);

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
export async function addNewApplicationRelease({
  formData,
  publisher_id,
  package_name,
  application_id,
  app_type = 'app',
}) {
  const mobsfResponse = await uploadToMobSF({
    package_file: formData.package_file,
  });

  await scanMobSF({
    hash: mobsfResponse.hash,
  });

  try {
    const applicationPackageFileUrl = await uploadFile({
      filePath: `developers/${publisher_id}/${app_type}s/${application_id}/releases/${package_name}-${formData.version}.apk`,
      file: formData.package_file,
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

      updated_at: Timestamp.fromDate(date),
    });

    return document;
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function publishApplicationRelease({ application_id, release_id }) {
  try {
    const release = await getApplicationRelease({
      applicationId: application_id,
      releaseId: release_id,
    });

    if (release?.scan_hash) {
      const { appsec, ...props } = await scanMobSF({ hash: release?.scan_hash });

      if ((appsec?.security_score ?? 0) > 50) {
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
        });

        let othersReleases = await getApplicationReleases({ applicationId: application_id });
        othersReleases = othersReleases.filter((r) => r.id !== release_id);

        if (othersReleases.length > 1) {
          // eslint-disable-next-line no-plusplus
          for (let index = 0; index < othersReleases.length; index++) {
            const otherRelease = othersReleases[index];
            // eslint-disable-next-line no-await-in-loop
            await updateDocument(`${appsCollection}/${application_id}/releases`, otherRelease.id, {
              published: false,
              ...(otherRelease.published ? { un_published_at: Timestamp.now() } : {}),
            });
          }
        }

        return release.id;
      }
      throw new Error(`Security score of application is too low : ${appsec?.security_score}`);
    } else {
      throw new Error('Scan of application failed.');
    }
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function unPublishApplicationRelease({ application_id, release_id }) {
  try {
    const release = await getApplicationRelease({
      applicationId: application_id,
      releaseId: release_id,
    });

    if (release?.published ?? false) {
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

      return release.id;
    }

    throw new Error('Application release is not published.');

  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function addNewApplication({ formData, user, categories }) {
  try {
    const id = geneateId();

    const logo_image_square_url = await uploadFile({
      filePath: `developers/${user.web3_account_id}/apps/${id}/images/${formData.logo_image_square.name}`,
      file: formData.logo_image_square,
      metadata: { user_id: user.id },
    });

    const cover_image_rect_url = await uploadFile({
      filePath: `developers/${user.web3_account_id}/apps/${id}/images/${formData.cover_image_rect.name}`,
      file: formData.cover_image_rect,
      metadata: { user_id: user.id },
    });

    // eslint-disable-next-line prefer-const
    let screenshots = [];

    // if (formData.app_screenshots) {
    //   screenshots = await Promise.all(
    //     formData.app_screenshots.map(async (file) => {
    //       const url = await uploadFile({
    //         filePath: `apps/${id}/screenshots/${file.name}`,
    //         file,
    //         metadata: { user_id: user.id },
    //       });

    //       console.log(url);
    //     })
    //   );

    //   console.log({ screenshots });
    // }

    const documentData = {
      ...formData,
      id,
      app_type: 'app',
      category_name: categories.find((category) => category.id === formData.category_id).label,
      has_in_app_purchases: formData.has_in_app_purchases === 'true',
      contains_ads: formData.contains_ads === 'true',
      app_screenshots: null,
      logo_image_square: null,
      cover_image_rect: null,
      logo_image_square_url,
      screenshots,
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
