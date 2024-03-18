import { updateDocument } from 'src/services/firebase/firestore/helpers';
import { usersCollection } from 'src/services/firebase/firestore/constants';

export async function updateUserAccountAfterRegistration({
  userID,
  accountAddress,
  accountName,
  accountSource,
  paymentFee,
  txHash,
}) {
  try {
    await updateDocument(usersCollection, userID, {
      paid_developer_fee: true,
      web3_account_address: accountAddress,
      web3_account_name: accountName,
      web3_account_source: accountSource,
      registration_transaction_fee: paymentFee,
      registration_transaction_hash: txHash,
    });
  } catch (error) {
    console.error(error);

    throw error;
  }
}
