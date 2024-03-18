import { waitReady } from '@polkadot/wasm-crypto';
import { mnemonicGenerate } from '@polkadot/util-crypto';
// eslint-disable-next-line import/no-extraneous-dependencies
import { web3FromAddress } from '@polkadot/extension-dapp';
import { Keyring, ApiPromise, WsProvider } from '@polkadot/api';

const wsEndPoint = 'wss://rpc1.relai.network';

export async function generateSecretPhrase(length = 12) {
  // We wait for connection.
  await waitReady();

  // Create mnemonic string
  const mnemonic = mnemonicGenerate(length);

  // We create a new keychain type Sr25519
  const keyring = new Keyring({ type: 'sr25519' });

  // We added seed phrase to the new keyring.
  const keys = keyring.createFromUri(mnemonic, { name: 'sr25519' });

  //  //We store the public key in local storage.
  //  localStorage.setItem('Publickey', keys.address);

  return {
    address: keys.address,
    phrase: mnemonic,
  };
}

export async function connectToWallet({ address, onSuccess, onError }) {
  try {
    const wsProvider = new WsProvider(wsEndPoint);

    const api = await ApiPromise.create({ provider: wsProvider });

    // Wait until we are ready and connected
    await api.isReady;

    const account = await api.query.system.account(address);

    const balance = Number(account.data.free) / 1000000000000;

    onSuccess({ api, account, balance });
  } catch (e) {
    console.error(e);

    onError(e);
  }
}

export async function payRegistrationFee({
  address,
  name,
  email,
  website,
  onSuccess,
  onError,
  onStartup,
  onProcessing,
}) {
  try {
    const wsProvider = new WsProvider(wsEndPoint);

    const api = await ApiPromise.create({ provider: wsProvider });

    // Wait until we are ready and connected
    await api.isReady;

    const injector = await web3FromAddress(address);

    const registration = api.tx.futurCreatorsReg.registerDeveloper(name, email, website);

    const registrationPaymentInfo = await registration.paymentInfo(address);

    onStartup({ api, injector, payment: registrationPaymentInfo });

    registration.signAndSend(address, { signer: injector.signer }, (result) => {
      onProcessing({
        isInBlock: result.isInBlock,
        isFinalized: result.isFinalized,
        isCompleted: result.isCompleted,
        isError: result.isError,
        isWarning: result.isWarning,
        txIndex: result.txIndex,
        dispatchError: result.dispatchError,
        result,
        log: result.toHuman(),
      });

      if (result.isCompleted && result.isFinalized) {
        onSuccess({
          api,
          injector,
          result: { tx_hash: result.txHash.toHex(), ...result },
        });
      }

      if (result.isError) {
        throw Error(result.dispatchError.toString());
      }
    });
  } catch (e) {
    onError(e);
  }
}
