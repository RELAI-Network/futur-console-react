/* eslint-disable no-unreachable */
import { Timestamp } from 'firebase/firestore';

import { uploadFile } from 'src/services/firebase/firestorage/helpers';
import { getAll, addDocument } from 'src/services/firebase/firestore/helpers';
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
      has_in_app_purchases: formData.has_in_app_purchases === "true",
      contains_ads: formData.contains_ads === "true",
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
      privacy_policy_link_url: formData.privacy_policy_link ?? "",
      created_at: Timestamp.fromDate(new Date()),
    };

    console.log({ formData, documentData, user, categories });

    const document = await addDocument(appsCollection, documentData, id);

    return document;
  } catch (error) {
    console.error(error);

    throw error;
  }
}
