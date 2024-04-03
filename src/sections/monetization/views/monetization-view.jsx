import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

// import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/use_auth';
import usePromise from 'src/hooks/use_promise';

import { requestTokens, getWalletBalance } from '../services/wallet';

export default function MonetizationView() {
  const { user } = useAuth();

  const [loading, setLoading] = useState();

  const { data, loading: balanceLoading } = usePromise(
    () => getWalletBalance(user.web3_account_address),
    [user.web3_account_address, loading]
  );

  // const router = useRouter();

  return (
    <Container maxWidth="xl">
      <Stack>
        <Typography variant="h4">Monetization</Typography>
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
                Account Address :{' '}
                <span style={{ fontWeight: 'bold' }}>{user.web3_account_address}</span>
              </Typography>
              {balanceLoading || (
                <Typography>
                  Account Balance :{' '}
                  <span style={{ fontWeight: 'bold' }}>{`${data?.balance} $RL`}</span>
                </Typography>
              )}
            </Box>
          </Stack>
          <Box>
            <LoadingButton
              loading={loading}
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
          </Box>
        </Stack>
      </Stack>
      <br />
    </Container>
  );
}
