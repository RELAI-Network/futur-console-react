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

import { getPublisherBooks } from 'src/sections/books/services/firestore';
// ----------------------------------------------------------------------

export default function PublisherHomeView() {
  const form = useFormValidation({});

  const { user } = useAuth();

  const { data: books, loading: booksAreLoading } = usePromise(() =>
    getPublisherBooks({ developerId: user.publisher_id })
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
          <Typography variant="h5">Books</Typography>
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
      {booksAreLoading ? (
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
          items={books}
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
