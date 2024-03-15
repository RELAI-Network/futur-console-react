import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Div from '../../../components/commons/Div';

// ----------------------------------------------------------------------

export default function HomeView() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi, Welcome back 👋
      </Typography>

      <Div
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: "start",
          justifyContent: "center",
          flexWrap: "row",
        }}
      >
        <Typography variant="h4" sx={{ mb: 5 }}>
          You have not set up your wallet !
        </Typography>
        <Button>Setup my wallet</Button>
      </Div>
    </Container>
  );
}
