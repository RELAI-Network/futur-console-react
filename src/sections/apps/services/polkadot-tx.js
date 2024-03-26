import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3FromAddress } from '@polkadot/extension-dapp';

const wsEndPoint = 'wss://rpc1.relai.network';

export async function submitAsset({
  user_web3_account_address,
  file_name,
  assetType = 'app',
  publishThisAsset = false,
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

    const asset = api.createType('RelaiPrimitivesAssetsregAsset', {
      creator: user_web3_account_address,
      assetType: api.createType('RelaiPrimitivesAssetsregAssetType', assetType.toUpperCase()),
      name: file_name,
      meta: {},
    });

    const injector = await web3FromAddress(user_web3_account_address);

    const registration = api.tx.futurAssetsReg.submitAsset(asset, publishThisAsset);

    const registrationPaymentInfo = await registration.paymentInfo(asset);

    onStartup({ api, injector, payment: registrationPaymentInfo });

    registration.signAndSend(user_web3_account_address, { signer: injector.signer }, (result) => {
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
