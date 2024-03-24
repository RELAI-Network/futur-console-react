import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
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

import { getPublisherBooks } from '../services/firestore';

// ----------------------------------------------------------------------

export default function BooksView() {
  const form = useFormValidation({});

  const router = useRouter();

  const { user } = useAuth();

  const { data: applications, loading: isLoading } = usePromise(() =>
    getPublisherBooks({ developerId: user?.publisher_id })
  );

  return (
    <Container maxWidth="xl">
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
          <Box sx={{ mr: 1 }}>
            <img src="/assets/icons/navbar/apps.svg" alt="Applications" width={36} />
          </Box>
          <Typography variant="h5">Books</Typography>
        </Stack>
        <Box>
          <Button
            href="apps/create"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            Add
          </Button>
        </Box>
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
      <br />
      {isLoading ? (
        <CircularLoader />
      ) : (
        <Tableview
          addNewBtnLabel="Add"
          title="Applications"
          fields={[
            {
              attribute: 'name',
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
          items={applications}
          showHeader={false}
          showSearchAndFilter={false}
          onClickRow={(id) => {
            router.push(`/apps/view/${id}`);
          }}
        />
      )}
    </Container>
  );
}
