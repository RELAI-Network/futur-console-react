/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-template */
/* eslint-disable react/prop-types */

import { useParams } from 'react-router-dom';
import Identicon from '@polkadot/react-identicon';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import usePromise from 'src/hooks/use_promise';

import Div from 'src/components/commons/Div';
import Iconify from 'src/components/iconify';
import Tableview from 'src/components/table_view';
import CircularLoader from 'src/components/loader/CircularLoader';

import { getAppReviews } from 'src/sections/apps/services/firestore';

import { getGameReleases, getDeveloperGame } from '../services/firestore';

export default function GameView() {
  const { id: applicationId } = useParams();

  const router = useRouter();

  const { data: application, loading: applicationLoading } = usePromise(
    () => getDeveloperGame({ applicationId }),
    [applicationId]
  );

  const { data: releases, loading: releasesLoading } = usePromise(
    async () => getGameReleases({ applicationId }),
    [applicationId]
  );

  const { data: reviews, loading: reviewsLoading } = usePromise(async () =>
    getAppReviews({ applicationId })
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
            onClick={() => window.history.back()}
            cursor="pointer"
          />
          <Typography variant="h4">Dashboard</Typography>
        </Stack>
        <Divider color="primary" />
        <br />
        {applicationLoading ? (
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
              <img
                src={application.logo_image_square_url}
                alt={application.name + ' logo'}
                width={54}
                height={54}
              />{' '}
              <Box ml={2}>
                <Typography variant="h5">{application.name}</Typography>
                <Typography>
                  ID : <span style={{ fontWeight: 'bold' }}>{application.id}</span>
                </Typography>
              </Box>
            </Stack>
            <Box>
              <Button
                onClick={() => router.push(`/apps/view/${applicationId}/add-release`)}
                variant="contained"
                color="primary"
              >
                Add new release
              </Button>
            </Box>
          </Stack>
        )}
      </Stack>
      <br />
      <Typography variant="h6">Releases</Typography>
      <Divider color="primary" />
      <br />
      {applicationLoading ? null : releasesLoading ? (
        <CircularLoader />
      ) : (
        <Tableview
          addNewBtnLabel="Add"
          title="Releases"
          fields={[
            {
              attribute: 'version',
            },
            {
              attribute: 'size',
              builder: (size) => (
                <TableCell align="left">{Math.round(size / 1024 ** 2) + ' Mo'}</TableCell>
              ),
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
              attribute: 'published_at',
              builder: (at) => (
                <TableCell align="left">
                  {at?.seconds ? new Date(at.seconds * 1000).toLocaleDateString() : null}
                </TableCell>
              ),
            },
            {
              attribute: 'downloads_count',
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
              attribute: 'version',
              label: 'Version',
            },
            {
              attribute: 'size',
              label: 'Taille',
            },
            {
              attribute: 'created_at',
              label: 'Added at',
            },
            {
              attribute: 'published_at',
              label: 'Published at',
            },
            {
              attribute: 'downloads_count',
              label: 'Installations',
            },
            {
              attribute: 'published',
              label: 'Status',
            },
          ]}
          identifier="id"
          items={releases || []}
          showHeader={false}
          showSearchAndFilter={false}
          onClickRow={(id) => {
            router.push(`/games/view/${applicationId}/release/${id}`);
          }}
        />
      )}
      <br />
      <Typography variant="h6">Reviews</Typography>
      <Divider color="primary" />
      <br />
      {applicationLoading ? null : reviewsLoading ? (
        <CircularLoader />
      ) : (
        <Tableview
          addNewBtnLabel="Add"
          title="Reviews"
          fields={[
            {
              attribute: 'address',
              builder: (address) => (
                <Div
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    justifyItems: 'center',
                    justifySelf: 'center',
                  }}
                >
                  <Identicon
                    value={address}
                    size={36}
                    theme="substrate" /// 'polkadot', 'substrate' (default), 'beachball' or 'jdenticon'
                  />
                </Div>
              ),
            },
            {
              attribute: 'rating',
              // builder: (rating) => (
              //   <Rating name="read-only" value={rating} readOnly />
              // ),
            },
            {
              attribute: 'comment',
              builder: (comment) => (
                // <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                <Typography
                  sx={{
                    wordBreak: 'break-all',
                    maxWidth: 300,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {comment.length > 100 ? comment.substring(0, 100) + '...' : comment}
                </Typography>
              ),
            },
            {
              attribute: 'added_at',
              builder: (createdAt) => (
                <TableCell align="left">
                  {new Date(createdAt.seconds * 1000).toLocaleDateString()}
                </TableCell>
              ),
            },
          ]}
          headers={[
            {
              attribute: 'address',
              label: 'User',
            },
            
            {
              attribute: 'rating',
              label: 'Note',
            },
            {
              attribute: 'comment',
              label: 'Comment',
            },
            {
              attribute: 'added_at',
              label: 'Added at',
            },
          ]}
          identifier="id"
          items={reviews || []}
          showHeader={false}
          showSearchAndFilter={false}
        />
      )}
    </Container>
  );
}
