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
  onProcessing,
}) {
  try {
    const wsProvider = new WsProvider(wsEndPoint);

    const api = await ApiPromise.create({ provider: wsProvider });

    // Wait until we are ready and connected
    await api.isReady;

    const injector = await web3FromAddress(address);

    const registration = await api.tx.futurCreatorsReg
      .registerDeveloper(name, email, website)
      .signAndSend(address, { signer: injector.signer }, (result) => {
        onProcessing(result);
      });

    onSuccess({ api, injector, registration });
  } catch (e) {
    onError(e);
  }
}
