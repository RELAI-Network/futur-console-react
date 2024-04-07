/* eslint-disable prefer-template */
/* eslint-disable react/prop-types */

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import LinearProgress from '@mui/material/LinearProgress';

import { useAuth } from 'src/hooks/use_auth';
import usePromise from 'src/hooks/use_promise';

import AccountSetupView from './account-setup-view';
import { requestTokens, getWalletBalance } from '../services/wallet';

export default function AccountView() {
  const { user } = useAuth();

  const [loading, setLoading] = useState();

  const { data, loading: balanceLoading } = usePromise(
    () => getWalletBalance(user.web3_account_address),
    [user.web3_account_address, loading]
  );

  return (
    <Container maxWidth="xl">
      {user.paidDeveloperFee ? (
        <Stack>
          <Typography variant="h4">Organisation account</Typography>
          <Divider color="primary" />
          <br />
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mb: 5 }}
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center">
              <img src="/assets/icons/navbar/account.svg" alt="Account" width={45} />{' '}
              <Box ml={2}>
                <Typography>
                  {`${user.role[0].toUpperCase() + user.role.slice(1)} Id`} :{' '}
                  <span style={{ fontWeight: 'bold' }}>{user.publisher_id}</span>
                </Typography>
                <Typography>
                  Account Name :{' '}
                  <span style={{ fontWeight: 'bold' }}>{user.web3_account_name}</span>
                </Typography>
                <Typography>
                  Account Address :{' '}
                  <span style={{ fontWeight: 'bold' }}>{user.web3_account_address}</span>
                </Typography>
                {balanceLoading ? (
                  <>
                    <br />
                    <LinearProgress />
                  </>
                ) : (
                  <Typography>
                    Account Balance :{' '}
                    <span style={{ fontWeight: 'bold' }}>{`${data?.balance} $RL`}</span>
                  </Typography>
                )}
              </Box>
            </Stack>
            <Box>
              {data && data?.balance < 10 && (
                <LoadingButton
                  loading={loading}
                  disabled={balanceLoading}
                  onClick={async () => {
                    setLoading(true);
                    await requestTokens(user.web3_account_address);

                    setLoading(false);

                    // router.reload();
                  }}
                  variant="contained"
                  color="success"
                >
                  Request tokens
                </LoadingButton>
              )}
            </Box>
          </Stack>
        </Stack>
      ) : (
        <AccountSetupView />
      )}
      <br />
    </Container>
  );
}
