// eslint-disable-next-line import/no-extraneous-dependencies
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

export async function getWeb3Extensions(originName = 'Futur Store') {
  const extensions = await web3Enable(originName);

  console.debug(extensions);

  return extensions;
}

export async function getWeb3Accounts() {
  const extensions = await getWeb3Extensions();

  if (!extensions.length) {
    return [];
  }

  const allAccounts = await web3Accounts();

  console.debug(allAccounts);

  return allAccounts;
}
