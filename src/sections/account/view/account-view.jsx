/* eslint-disable prefer-template */
/* eslint-disable react/prop-types */

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useAuth } from 'src/hooks/use_auth';

import AccountSetupView from './account-setup-view';

export default function AccountView() {
  const { user } = useAuth();

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
                  Account Name :{' '}
                  <span style={{ fontWeight: 'bold' }}>{user.web3_account_name}</span>
                </Typography>
                <Typography>
                  Account Address :{' '}
                  <span style={{ fontWeight: 'bold' }}>{user.web3_account_address}</span>
                </Typography>
              </Box>
            </Stack>
            <Box>
              <Button variant="contained" color="warning">
                Change
              </Button>
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
