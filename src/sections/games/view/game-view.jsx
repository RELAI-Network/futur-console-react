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

import usePromise from 'src/hooks/use_promise';

import Tableview from 'src/components/table_view';
import CircularLoader from 'src/components/loader/CircularLoader';

import { getDeveloperGame, getApplicationReleases } from '../services/firestore';

export default function GameView() {
  const { id: applicationId } = useParams();

  const { data: application, loading: applicationLoading } = usePromise(() =>
    getDeveloperGame({ applicationId })
  );

  const { data: releases, loading: releasesLoading } = usePromise(async () =>
    getApplicationReleases({ applicationId })
  );

  return (
    <Container maxWidth="xl">
      <Stack>
        <Typography variant="h4">Dashboard</Typography>
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
                href={`/games/view/${applicationId}/add-release`}
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
              attribute: 'downloads_count',
            },
            {
              attribute: 'releases_notes',
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
              attribute: 'downloads_count',
              label: 'Installations',
            },
            {
              attribute: 'releases_notes',
              label: 'Notes',
            },
          ]}
          identifier="id"
          items={releases || []}
          showHeader={false}
          showSearchAndFilter={false}
          onClickRow={(id) => {
            // router.push(`/games/view/${id}`);
          }}
        />
      )}
    </Container>
  );
}
