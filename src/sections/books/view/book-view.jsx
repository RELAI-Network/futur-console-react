/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-template */
/* eslint-disable react/prop-types */

import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import usePromise from 'src/hooks/use_promise';

import Iconify from 'src/components/iconify';
import Tableview from 'src/components/table_view';
import CircularLoader from 'src/components/loader/CircularLoader';

import { getBookEditions, getPublisherBook } from '../services/firestore';

export default function AppView() {
  const { id: bookId } = useParams();

  const router = useRouter();

  const { data: book, loading: bookLoaading } = usePromise(() => getPublisherBook({ bookId }));

  const { data: editions, loading: editionsLoading } = usePromise(async () =>
    getBookEditions(bookId)
  );

  return (
    <Container maxWidth="xl">
      <Stack>
        <Stack mb={1} direction="row" alignItems="center" justifyContent="start">
          <Iconify
            color="primary"
            sx={{ mr: 1 }}
            icon="material-symbols:arrow-back-ios"
            width={24}
            height={24}
            onClick={() => router.push('/apps')}
            cursor="pointer"
          />
          <Typography variant="h4">Dashboard</Typography>
        </Stack>
        <Divider color="primary" />
        <br />
        {bookLoaading ? (
          <CircularLoader />
        ) : (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mb: 5 }}
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center">
              <img src={book.cover_url} alt={book.title + ' logo'} width={54} height={54} />{' '}
              <Box ml={2}>
                <Typography variant="h5">{book.title}</Typography>
                <Typography>
                  ID : <span style={{ fontWeight: 'bold' }}>{book.id}</span>
                </Typography>
              </Box>
            </Stack>
            <Box>
              <Button
                onClick={() => router.push(`/books/view/${bookId}/add-edition`)}
                variant="contained"
                color="primary"
              >
                Add new edition
              </Button>
            </Box>
          </Stack>
        )}
      </Stack>
      <br />
      <Typography variant="h6">Editions</Typography>
      <Divider color="primary" />
      <br />
      {bookLoaading ? null : editionsLoading ? (
        <CircularLoader />
      ) : (
        <Tableview
          addNewBtnLabel="Add"
          title="Editions"
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
              attribute: 'published_at',
              builder: (createdAt) => (
                <TableCell align="left">
                  {createdAt?.seconds
                    ? new Date(createdAt.seconds * 1000).toLocaleDateString()
                    : null}
                </TableCell>
              ),
            },

            {
              attribute: 'published',
              builder: (published, release) => (
                <TableCell sx={{ color: published ? 'green' : 'orange' }} align="left">
                  {published ? 'Published' : release.status ?? 'Unpublished'}
                </TableCell>
              ),
            },
            {
              attribute: 'file_main_url',
              builder: (download) => (
                <TableCell align="center" sx={{ cursor: 'pointer', color: 'primary' }}>
                  <Iconify
                    onClick={(e) => {
                      e.stopPropagation();

                      window.open(download, '_blank', 'noopener,noreferrer');
                      return false;
                    }}
                    color="primary"
                    icon="material-symbols:download"
                    width={24}
                    height={24}
                  />
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
              attribute: 'published_at',
              label: 'Added at',
            },

            {
              attribute: 'published',
              label: 'Status',
            },
            {
              attribute: 'download',
              label: 'Download',
              textAlign: 'center',
            },
          ]}
          identifier="id"
          items={editions || []}
          showHeader={false}
          showSearchAndFilter={false}
          onClickRow={(id) => {
            router.push(`/books/view/${bookId}/edition/${id}`);
          }}
        />
      )}
    </Container>
  );
}
