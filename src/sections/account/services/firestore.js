import { addDocument, updateDocument } from 'src/services/firebase/firestore/helpers';
import { usersCollection, publishersCollection } from 'src/services/firebase/firestore/constants';

function geneateId() {
  return Math.floor(Math.random() * (999999999999999 - 100000000000000 + 1)) + 100000000000000;
}

export async function updateUserAccountAfterRegistration({
  userID,
  accountAddress,
  accountName,
  accountSource,
  paymentFee,
  txHash,
}) {
  const publisherId = geneateId();
  try {
    await updateDocument(usersCollection, userID, {
      paid_developer_fee: true,
      publisher_id: publisherId,
      publisher_name: accountName,
      web3_account_id: publisherId,
      web3_account_address: accountAddress,
      web3_account_name: accountName,
      web3_account_source: accountSource,
      registration_transaction_fee: paymentFee,
      registration_transaction_hash: txHash,
    });

    try {
      await addDocument(
        publishersCollection,
        {
          id: publisherId,
          name: accountName,
        },
        publisherId
      );
    } catch (_) { /* ignore */ }
  } catch (error) {
    console.error(error);

    throw error;
  }
}
