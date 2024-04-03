import axios from 'axios';
import { ApiPromise, WsProvider } from '@polkadot/api';

import { wsEndPoint } from 'src/sections/apps/services/polkadot-tx';

export async function getWalletBalance(address) {
  try {
    const wsProvider = new WsProvider(wsEndPoint);

    const api = await ApiPromise.create({
      provider: wsProvider,
    });

    // Wait until we are ready and connected
    await api.isReady;

    const { nonce, data: balance } = await api.query.system.account(address);

    return { balance: Number(balance.free) / 1000000000000, nonce };
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export async function requestTokens(address) {
  try {
    await axios.get(`https://faucet-tskg7nm5aa-uc.a.run.app?requester=${address}`);
  } catch (error) {
    console.error(error);
  }
}
