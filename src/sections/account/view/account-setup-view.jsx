/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-template */
/* eslint-disable react/prop-types */
import { Icon } from '@iconify/react';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import { Card } from '@mui/material';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/use_auth';

import { connectToWallet, payRegistrationFee } from '../services/wallet';
import { updateUserAccountAfterRegistration } from '../services/firestore';
import { getWeb3Accounts, getWeb3Extensions } from '../services/extensions';

export default function AccountSetupView() {
  const { user } = useAuth();

  const router = useRouter();

  const [installedExtensions, setInstalledExtensions] = useState(null);

  const [accounts, setAccounts] = useState(null);

  const [selectedAccount, setSelectedAccount] = useState(null);

  const [connectingToWallet, setConnectingToWallet] = useState(false);

  const [connectedToWallet, setConnectedToWallet] = useState(false);

  const [payingDeveloperFee, setPayingDeveloperFee] = useState(false);

  const [payingDeveloperFeeError, setPayingDeveloperFeeError] = useState('');

  const [transactionLog, setTransactionLog] = useState('');

  const launchPage = (url) => {
    window.open(url, '_blank');
  };

  const loadingInstalledExtensions = useMemo(
    () => installedExtensions === null,
    [installedExtensions]
  );

  const isExtensionInstalled = useCallback(
    (extension) =>
      (installedExtensions ?? []).map((e) => e.name.toLowerCase()).includes(extension) ?? false,
    [installedExtensions]
  );

  useEffect(() => {
    getWeb3Extensions().then((extensions) => {
      setInstalledExtensions(extensions);
    });
  }, []);

  useEffect(() => {
    if (installedExtensions) {
      getWeb3Accounts().then((web3Accounts) => {
        setAccounts(web3Accounts);
      });
    }
  }, [installedExtensions]);

  return (
    <Container maxWidth="xl">
      <Box marginX="auto" maxWidth={600}>
        <Typography variant="h4" textAlign="center">
          Setup your developer account
        </Typography>
        <br />

        <Stack spacing={3}>
          <ConfigAction
            actionLabel="1. Install Polkadot or Talisman Navigator extension"
            actionFunc={() => {
              launchPage('https://polkadot.js.org/extension/');
              launchPage('https://www.talisman.xyz/download');
            }}
            buttonText="Install"
            description="Finish installation, set up your password, add an account, accept requirements, allow connection to the extension and refresh the page. You will need to choose accounts to connect to futur console."
            done={isExtensionInstalled('polkadot-js') || isExtensionInstalled('talisman')}
            loading={loadingInstalledExtensions}
            buttonColor="inherit"
            actionsBuilder={({ done, loading, buttonEnabled }) => (
              <Stack direction="column" spacing={2}>
                <LoadingButton
                  sx={{
                    maxHeight: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    whiteSpace: 'nowrap',
                  }}
                  disabled={!buttonEnabled}
                  loading={loading}
                  onClick={() => launchPage('https://polkadot.js.org/extension/')}
                  variant="contained"
                  color="primary"
                >
                  Install Polkadot
                </LoadingButton>
                <LoadingButton
                  sx={{
                    maxHeight: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    whiteSpace: 'nowrap',
                  }}
                  disabled={!buttonEnabled}
                  loading={loading}
                  onClick={() => launchPage('https://www.talisman.xyz/download')}
                  variant="outlined"
                  color="secondary"
                >
                  Install Talisman
                </LoadingButton>
              </Stack>
            )}
          />
          <br />
          {accounts != null && (
            <ConfigAction
              actionLabel="2. Connect your wallet"
              actionFunc={async () => {
                setConnectingToWallet(true);

                await connectToWallet({
                  address: selectedAccount.address,
                  onError: (e) => {
                    console.error(e);

                    setConnectingToWallet(false);
                  },
                  onSuccess: (data) => {
                    console.log(data);

                    setConnectingToWallet(false);
                    setConnectedToWallet(true);
                  },
                });
              }}
              buttonText="Connect"
              description={
                accounts.length === 0
                  ? 'Create at least one account using dApp or Talisman extension.'
                  : 'Choose your account from the list below.'
              }
              done={connectedToWallet}
              loading={connectingToWallet && !connectedToWallet}
              buttonColor="secondary"
              buttonEnabled={accounts.length > 0 && selectedAccount != null && !connectedToWallet}
            />
          )}
          <Stack spacing={3} sx={{ overflowY: 'auto', maxHeight: 300 }}>
            {(accounts ?? []).map((account) => (
              <Card
                elevation={24}
                key={account.address}
                sx={{
                  minHeight: 64,
                  paddingX: 2,
                  paddingY: 1.5,
                  cursor: connectingToWallet ? null : 'pointer',
                  elevation: 24,
                  backgroundColor: '#cccccc',
                  ':hover': connectingToWallet
                    ? null
                    : { backgroundColor: '#999999', color: 'white' },
                }}
                onClick={() => {
                  if (!connectingToWallet && !payingDeveloperFee) {
                    setSelectedAccount(account);
                    setConnectedToWallet(false);
                  }
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="start" spacing={3}>
                  <img
                    src={
                      account.meta.source === 'polkadot-js'
                        ? '/assets/icons/wallets/dApp.svg'
                        : '/assets/icons/wallets/talisman.png'
                    }
                    width={36}
                    // eslint-disable-next-line prefer-template
                    alt={(account.meta.source === 'polkadot-js' ? 'dApp' : 'Talisman') + ' Logo'}
                  />
                  <Stack sx={{ width: '75%' }}>
                    <Typography variant="subtitle1">{account.meta.name}</Typography>
                    <Typography variant="body2">{account.address.substr(0, 24) + '...'}</Typography>
                  </Stack>
                  <Icon
                    icon="lets-icons:check-fill"
                    width={36}
                    color={selectedAccount?.address === account.address ? 'green' : 'white'}
                  />
                </Stack>
              </Card>
            ))}
          </Stack>
          <br />
          {connectedToWallet && (
            <TextField
              value={selectedAccount?.publisherName ?? selectedAccount?.meta?.name}
              name="publisher_name"
              label={`${user.role[0].toUpperCase() + user.role.slice(1)} Name`}
              required
              disabled={payingDeveloperFee}
              helperText={`Your ${user.role} or organization name`}
              onChange={(e) => {
                setSelectedAccount({ ...selectedAccount, publisherName: e.target.value });
              }}
              size="small"
              fullWidth
            />
          )}
          <br />
          {payingDeveloperFeeError ? (
            <Typography color="error" align="center">
              {payingDeveloperFeeError}
            </Typography>
          ) : (
            transactionLog && (
              <Typography variant="subtitle2" sx={{ marginY: 0, padding: 0 }} align="center">
                {transactionLog}
              </Typography>
            )
          )}
          <LoadingButton
            sx={{ marginY: 0, padding: 0 }}
            size="large"
            loading={payingDeveloperFee}
            disabled={!connectedToWallet}
            onClick={async () => {
              setPayingDeveloperFee(true);
              setPayingDeveloperFeeError('');

              let paymentInfo;

              await payRegistrationFee({
                address: selectedAccount.address,
                name: user.name,
                email: user.email,
                website: user.website,
                onStartup: ({ payment }) => {
                  // eslint-disable-next-line no-debugger
                  console.debug('onStartup', payment);

                  paymentInfo = {
                    fee: Number(payment.partialFee) / 1000000000000,
                  };

                  setTransactionLog('This transaction will cost you ' + paymentInfo.fee + ' DOT.');
                },

                onProcessing: (result) => {
                  // eslint-disable-next-line no-debugger
                  console.debug('onProcessing', result);

                  if (result.isInBlock) {
                    setTransactionLog('Transaction included in block...');
                  } else if (result.isCompleted) {
                    setTransactionLog('Transaction included in being completed...');
                  } else if (result.isFinalized) {
                    setTransactionLog('Transaction is being finalized...');
                  }
                },
                onSuccess: async ({ result }) => {
                  // eslint-disable-next-line no-debugger
                  console.debug('onSuccess', result);

                  setTransactionLog('Transaction finalized. Setting your developer account...');

                  await updateUserAccountAfterRegistration({
                    userID: user.uid,
                    accountAddress: selectedAccount.address,
                    accountSource: selectedAccount.meta.source,
                    accountName: selectedAccount.publisherName ?? selectedAccount.meta.name,
                    paymentFee: paymentInfo.fee,
                    txHash: result.tx_hash,
                  });

                  setTransactionLog('');

                  setPayingDeveloperFee(false);

                  router.reload();
                },
                onError: (e) => {
                  setPayingDeveloperFeeError(e?.message ?? 'Error occured during transaction.');

                  console.error('onError', e);

                  setPayingDeveloperFee(false);
                },
              });
            }}
            variant="contained"
            color="primary"
          >
            Register as a {`${user.role}`}
          </LoadingButton>
        </Stack>
      </Box>
      <br />
    </Container>
  );
}

function ConfigAction({
  done = false,
  loading = false,
  buttonEnabled = true,
  actionLabel,
  actionFunc,
  buttonText,
  description,
  actionsBuilder,
  buttonColor = 'primary',
}) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={3}>
      <Stack alignItems="start" justifyContent="space-between" justifyItems="start">
        <Typography
          color={done ? 'text.secondary' : 'text.primary'}
          variant="subtitle1"
          sx={{
            textDecoration: done ? 'line-through' : 'none',
          }}
        >
          {actionLabel}
        </Typography>
        {done ||
          (description && (
            <Typography variant="subtitle2" color="text.secondary">
              {description}
            </Typography>
          ))}
      </Stack>
      {actionsBuilder ? (
        actionsBuilder({ done, buttonEnabled, loading })
      ) : done ? (
        <Icon icon="lets-icons:check-fill" width={36} color="green" />
      ) : (
        <LoadingButton
          sx={{
            maxHeight: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            whiteSpace: 'nowrap',
          }}
          disabled={!buttonEnabled}
          loading={loading}
          onClick={actionFunc}
          variant="contained"
          color={buttonColor}
        >
          {buttonText}
        </LoadingButton>
      )}
    </Stack>
  );
}
