import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function SettingsView() {
  return (
    <Container maxWidth="xl">
      <Stack>
        <Typography variant="h4">Settings</Typography>
        <Divider color="primary" />
        <br />
      </Stack>
      <br />
    </Container>
  );
}
