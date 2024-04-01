import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/use_auth';
import usePromise from 'src/hooks/use_promise';

import { useFormValidation } from 'src/utils/forms/hooks/useFormValidation';

import Iconify from 'src/components/iconify';
import Tableview from 'src/components/table_view';
import CircularLoader from 'src/components/loader/CircularLoader';

import { getDeveloperGames } from 'src/sections/games/services/firestore';
import { getDeveloperApplications } from 'src/sections/apps/services/firestore';
// ----------------------------------------------------------------------

export default function HomeView() {
  const form = useFormValidation({});

  const { user } = useAuth();

  const { data: applications, loading: appplicationsAreLoading } = usePromise(() =>
    getDeveloperApplications({ developerId: user.publisher_id })
  );

  const { data: games, loading: gamesAreLoasding } = usePromise(() =>
    getDeveloperGames({ developerId: user.publisher_id })
  );

  const router = useRouter();

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Hi, Welcome back 👋
      </Typography>
      <br />
      <Divider color="primary" />
      <br />
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center">
          <Typography variant="h5">Applications & Games</Typography>
        </Stack>
        <Box>
          <TextField
            name="search"
            label="Search application"
            required
            helperText={form.validationErrors.searchApp}
            error={!!form.validationErrors.searchApp}
            onChange={(e) => form.setFieldValue('searchApp', e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="material-symbols:search" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Stack>
      {appplicationsAreLoading || gamesAreLoasding ? (
        <CircularLoader />
      ) : (
        <Tableview
          addNewBtnLabel="Add"
          title="Applications"
          fields={[
            {
              attribute: 'name',
              builder: (name, app) => (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyItems="center"
                  alignContent="center"
                  margin={0}
                >
                  <img
                    src={`/assets/icons/navbar/${app?.app_type ?? 'app'}s.svg`}
                    alt="Applications"
                    width={24}
                  />
                  <TableCell align="left">{name}</TableCell>
                </Stack>
              ),
            },
            {
              attribute: 'category_name',
            },
            {
              attribute: 'created_at',
              builder: (createdAt) => (
                <TableCell align="left">
                  {new Date(createdAt.seconds * 1000).toLocaleDateString()}
                </TableCell>
              ),
            },
            {
              attribute: 'downloads_count',
            },
          ]}
          headers={[
            {
              attribute: 'name',
              label: 'Name',
            },
            {
              attribute: 'category_name',
              label: 'Category',
            },
            {
              attribute: 'created_at',
              label: 'Added at',
            },
            {
              attribute: 'downloads_count',
              label: 'Installations',
            },
          ]}
          identifier="id"
          items={[...applications, ...games]}
          showHeader={false}
          showSearchAndFilter={false}
          onClickRow={(id, item) => {
            router.push(`/${item?.app_type ?? 'apps'}s/view/${id}`);
          }}
          onEditRow={(id) => {
            router.push(`/apps/edit/${id}`);
          }}
        />
      )}
    </Container>
  );
}
