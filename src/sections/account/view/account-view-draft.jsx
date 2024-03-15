import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabList from '@mui/lab/TabList';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from '../../../routes/hooks';
import { generateSecretPhrase } from '../services/wallet';
import { validateSchemas } from '../../../utils/forms/validator';
import { useLocalStorage } from '../../../hooks/use-local-storage';
import { useFormValidation } from '../../../utils/forms/hooks/useFormValidation';

// ----------------------------------------------------------------------

export default function AccountView() {
    const form = useFormValidation({});

    const router = useRouter();

    const [publicKey, setPublicKey] = useLocalStorage('public-key');

    const [tabValue, setTabValue] = useState('1');

    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };

    const generatePhrase = () => {
        generateSecretPhrase().then(({ address, phrase }) => {
            form.setFieldValue('secret', phrase);
            form.setFieldValue('address', address);
        });
    };

    async function createAccount() {
        if (
            await validateSchemas({
                validationSchemas: {
                    secret: 'Enter your secret phrase.',
                    address: 'Enter your address phrase.',
                },
                setFieldError: form.setFieldError,
                values: form.data,
            })
        ) {
            setPublicKey(form.data.address);
            router.reload();
        }
    }

    // On click open dApp extension page on new tab
    const installDAppExtension = () => {
        window.open('https://polkadot.js.org/extension/', '_blank');
    }

    return (
        <Container maxWidth="xl">
            <Box>
                <Typography variant="h4" textAlign="center">Setup your wallet</Typography>
                <br />
                <Stack spacing={3}>
                    <Stack direction="row" alignItems="center" spacing={3}>
                        <Typography>1.</Typography>
                        <Typography>Install the dApp Navigator extension to manage your account</Typography>
                        <Button onClick={installDAppExtension} variant="contained">Install dApp extension</Button>
                    </Stack>
                </Stack>
            </Box>
            <br />
            <br />
            <br />
            <br />
            {!publicKey ? (
                <Typography>Public Key : {publicKey}</Typography>
            ) : (
                <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    <TabContext value={tabValue}>
                        <TabList onChange={handleChangeTab} centered>
                            <Tab label="Create a new wallet" value="1" />
                            <Tab label="Connect to my wallet" value="2" />
                        </TabList>
                        <TabPanel value={tabValue} index="1">
                            <Box
                                sx={{
                                    marginX: 'auto',
                                    maxWidth: '500px',
                                }}
                            >
                                <Typography variant="h4" textAlign="center">
                                    Create new wallet
                                </Typography>
                                <br />
                                <Stack spacing={3}>
                                    <TextField
                                        name="phrase"
                                        label="Secret phrase"
                                        required
                                        focused
                                        value={form.data.secret}
                                        helperText={form.validationErrors.phrase ?? 'Enter your secret phrase'}
                                        error={!!form.validationErrors.phrase}
                                        onChange={(e) => form.setFieldValue('secret', e.target.value)}
                                    />
                                    <br />
                                    <Stack direction="row" spacing={3}>
                                        <LoadingButton
                                            fullWidth
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            color="success"
                                            disabled={(form.data.secret?.length ?? 0) > 0}
                                            onClick={generatePhrase}
                                        >
                                            Generate phrase
                                        </LoadingButton>
                                        <LoadingButton
                                            fullWidth
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            color="inherit"
                                            loading={form.submitting}
                                            onClick={() => createAccount()}
                                        >
                                            Create
                                        </LoadingButton>
                                    </Stack>
                                </Stack>
                            </Box>
                        </TabPanel>
                        <TabPanel value={tabValue} index="2" />
                    </TabContext>
                </Box>
            )}
        </Container>
    );
}
