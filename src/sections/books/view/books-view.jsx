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

  const { data: books, loading: isLoading } = usePromise(() =>
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
            onClick={() => router.push('/books/create')}
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
          title="Books"
          fields={[
            {
              attribute: 'cover_url',
              builder: (coverImageUrl) => (
                <img src={coverImageUrl} alt="Cover" width={54} height={54} />
              ),
            },
            {
              attribute: 'title',
            },
            {
              attribute: 'category_id',
            },
            {
              attribute: 'created_at',
              builder: (createdAt) => (
                <TableCell align="left">
                  {createdAt?.seconds
                    ? new Date(createdAt.seconds * 1000).toLocaleDateString()
                    : null}
                </TableCell>
              ),
            },
            {
              attribute: 'genre',
            },
            {
              attribute: 'published',
              builder: (published, release) => (
                <TableCell sx={{ color: published ? 'green' : 'orange' }} align="left">
                  {published ? 'Published' : release.status ?? 'Unpublished'}
                </TableCell>
              ),
            },
          ]}
          headers={[
            {
              attribute: 'cover_url',
              label: 'Cover',
            },
            {
              attribute: 'title',
              label: 'Title',
            },
            {
              attribute: 'category_id',
              label: 'Category',
            },
            {
              attribute: 'created_at',
              label: 'Added at',
            },
            {
              attribute: 'genre',
              label: 'Genre',
            },
            {
              attribute: 'published',
              label: 'Status',
            },
          ]}
          identifier="id"
          items={books || []}
          showHeader={false}
          showSearchAndFilter={false}
          onClickRow={(id) => {
            router.push(`/books/view/${id}`);
          }}
        />
      )}
    </Container>
  );
}
