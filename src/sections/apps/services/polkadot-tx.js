/* eslint-disable import/no-extraneous-dependencies */
import { toInteger } from 'lodash';
/* eslint-disable no-debugger */
import { hexToU8a } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3FromAddress } from '@polkadot/extension-dapp';

import { getWeb3Accounts } from 'src/sections/account/services/extensions';

export const wsEndPoint = 'wss://rpc1.relai.network';

// eslint-disable-next-line consistent-return
export async function submitAsset({
  user_web3_account_address,
  name,
  assetType = 'app',
  publishThisAsset = false,
  price = 0,
  assetJson = {},
  onStartup,
  onSuccess,
  onError,
  onProcessing,
}) {
  try {
    const wsProvider = new WsProvider(wsEndPoint);

    const api = await ApiPromise.create({
      provider: wsProvider,
      types: {
        RelaiPrimitivesAssetsregAsset: {
          creator: 'AccountId32',
          assetType: 'RelaiPrimitivesAssetsregAssetType',
          name: 'Bytes',
          price: 'u128',
          hash_: 'Bytes',
          published: 'bool',
        },
        RelaiPrimitivesAssetsregAssetType: {
          _enum: ['APP', 'GAME', 'BOOK'],
        },
      },
    });

    // Wait until we are ready and connected
    await api.isReady;

    const assetHashBytes = hexToU8a(blake2AsHex(JSON.stringify(assetJson), 256));

    const asset = api.createType('RelaiPrimitivesAssetsregAsset', {
      creator: user_web3_account_address,

      assetType: assetType.toUpperCase(),
      name: api.createType('Bytes', name),

      price: api.createType('u128', price),
      hash_: assetHashBytes,

      published: publishThisAsset,

      // assetType: api.createType('RelaiPrimitivesAssetsregAssetType', assetType.toUpperCase()),
      // hash: api.createType('Bytes', assetHashBytes),
      // hash: assetHashBytes
    });

    await getWeb3Accounts();

    const injector = await web3FromAddress(user_web3_account_address);

    let assetId;

    // Subscribe to events from your pallet
    api.query.system.events((events) => {
      // console.debug(`\nReceived ${events.length} events:`);

      // Loop through the Vec<EventRecord>
      events.forEach((record) => {
        // Extract the phase, event and the event types
        const { event } = record;

        const eventName = `${event.section}:${event.method}`;

        if (eventName === 'futurAssetsReg:AssetSubmited') {
          const [creator, eventAssetId] = event.data;
          console.debug('futurAssetsReg:AssetSubmited', creator, eventAssetId);
          if (`${creator}` === user_web3_account_address) {
            assetId = `${eventAssetId}`;
            console.debug(eventAssetId);
          }

          // const types = event.typeDef;
          // // Loop through each of the parameters, displaying the type and data
          // event.data.forEach((data, index) => {
          //   console.log(`\t\t\t${types[index].type}: ${data}`);
          // });
        }
      });
    });

    const transaction = api.tx.futurAssetsReg.submitAsset(asset);

    const transactionPaymentInfo = await transaction.paymentInfo(user_web3_account_address);

    onStartup?.({ asset, publishThisAsset, transaction, payment: transactionPaymentInfo });

    await transaction.signAndSend(
      user_web3_account_address,
      { signer: injector.signer },
      async (result) => {
        onProcessing?.({
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
          await onSuccess?.({
            api,
            injector,
            result: { tx_hash: result.txHash.toHex(), ...result },
            assetId,
          });
        }

        if (result.isError) {
          throw Error(result.dispatchError);
        }
      }
    );
  } catch (e) {
    onError?.(e);
  }
}

export async function updateAsset({
  senderAddress,
  name,
  assetId,
  assetType = 'app',
  publishThisAsset = false,
  price = 0,
  assetJson = {},
  onStartup,
  onSuccess,
  onError,
  onProcessing,
}) {
  try {
    const wsProvider = new WsProvider(wsEndPoint);

    const api = await ApiPromise.create({
      provider: wsProvider,
      types: {
        RelaiPrimitivesAssetsregAsset: {
          creator: 'AccountId32',
          assetType: 'RelaiPrimitivesAssetsregAssetType',
          name: 'Bytes',
          price: 'u128',
          hash_: 'Bytes',
          published: 'bool',
        },
        RelaiPrimitivesAssetsregAssetType: {
          _enum: ['APP', 'GAME', 'BOOK'],
        },
      },
    });

    // Wait until we are ready and connected
    await api.isReady;

    const asset = api.createType('RelaiPrimitivesAssetsregAsset', {
      creator: senderAddress,

      assetType: assetType.toUpperCase(),
      name: api.createType('Bytes', name),

      price: api.createType('u128', price),
      hash_: hexToU8a(blake2AsHex(JSON.stringify(assetJson), 256)),

      published: publishThisAsset,

      // assetType: api.createType('RelaiPrimitivesAssetsregAssetType', assetType.toUpperCase()),
      // hash: api.createType('Bytes', assetHashBytes),
      // hash: assetHashBytes
    });

    await getWeb3Accounts();

    const injector = await web3FromAddress(senderAddress);

    const transaction = api.tx.futurAssetsReg.updateAsset(assetId, asset);

    const transactionPaymentInfo = await transaction.paymentInfo(senderAddress);

    onStartup?.({ asset, publishThisAsset, transaction, payment: transactionPaymentInfo });

    await transaction.signAndSend(senderAddress, { signer: injector.signer }, async (result) => {
      onProcessing?.({
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
        await onSuccess?.({
          api,
          injector,
          result: { tx_hash: result.txHash.toHex(), ...result },
          assetId,
        });
      }

      if (result.isError) {
        throw Error(result.dispatchError);
      }
    });
  } catch (e) {
    onError?.(e);
  }
}

export async function pubUnblishAsset({
  senderAddress,
  assetId,
  publishThisAsset = true,

  onStartup,
  onSuccess,
  onError,
  onProcessing,
}) {
  try {
    const wsProvider = new WsProvider(wsEndPoint);

    const api = await ApiPromise.create({
      provider: wsProvider,
    });

    // Wait until we are ready and connected
    await api.isReady;

    await getWeb3Accounts();

    const injector = await web3FromAddress(senderAddress);

    const transaction = api.tx.futurAssetsReg.pubUnpubAsset(toInteger(`${assetId}`), publishThisAsset);

    const transactionPaymentInfo = await transaction.paymentInfo(senderAddress);

    onStartup?.({ assetId, publishThisAsset, transaction, payment: transactionPaymentInfo });

    await transaction.signAndSend(senderAddress, { signer: injector.signer }, async (result) => {
      onProcessing?.({
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
        await onSuccess?.({
          api,
          injector,
          result: { tx_hash: result.txHash.toHex(), ...result },
          assetId,
          pubUnpub: publishThisAsset,
        });
      }

      if (result.isError) {
        throw Error(result.dispatchError);
      }
    });
  } catch (e) {
    onError?.(e);
  }
}
