/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-template */
/* eslint-disable react/prop-types */

import { useState } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import usePromise from 'src/hooks/use_promise';

import Iconify from 'src/components/iconify';
import CircularLoader from 'src/components/loader/CircularLoader';

import {
  scanMobSF,
  getApplicationRelease,
  getDeveloperApplication,
  publishApplicationRelease,
  unPublishApplicationRelease,
} from '../services/firestore';

export default function ReleaseView() {
  const { id: releaseId, application_id: applicationId } = useParams();

  const router = useRouter();

  const {
    data: application,
    loading: applicationLoading,
    error: loadingApplicationError,
    isError: loadingApplicationFailed,
  } = usePromise(() => getDeveloperApplication({ applicationId }));

  const { data: release, loading: releaseLoading } = usePromise(async () =>
    getApplicationRelease({ applicationId, releaseId })
  );

  const [scanningApp, setScanningApp] = useState(false);
  const [scanningResult, setScanningResult] = useState(null);

  const [publishing, setPublishing] = useState(false);
  const [publishingError, setPublishingError] = useState('');

  const [unPublishing, setUnPublishing] = useState(false);

  const scanApp = async () => {
    setScanningApp(true);

    if (release?.scan_hash) {
      const scanResult = await scanMobSF({ hash: release?.scan_hash });

      setScanningResult(scanResult);
    }

    setScanningApp(false);
  };

  const publish = async () => {
    setPublishing(true);

    if ((scanningResult?.appsec?.security_score ?? release?.scan_score ?? 0) > 50) {
      publishApplicationRelease({
        application_id: applicationId,
        release_id: releaseId,
      })
        .then(() => router.reload())
        .catch((e) =>
          setPublishingError(e?.message ?? 'An error occured while publishing the application.')
        )
        .finally(() => setPublishing(false));
    } else {
      setPublishing(false);
    }
  };

  const unPublish = async () => {
    setUnPublishing(true);

    if (release.published ?? false) {
      unPublishApplicationRelease({
        application_id: applicationId,
        release_id: releaseId,
      })
        .then(() => router.reload())
        .catch((e) =>
          setPublishingError(e?.message ?? 'An error occured while unpublishing the application.')
        )
        .finally(() => setUnPublishing(false));
    } else {
      setUnPublishing(false);
    }
  };

  console.log(application, release);

  return (
    <Container maxWidth="xl">
      {applicationLoading ? (
        <CircularLoader />
      ) : loadingApplicationFailed ? (
        <Stack mb={1} direction="row" alignItems="center" justifyContent="start">
          <Typography>{loadingApplicationError?.message ?? 'An error occured'}</Typography>
          <Button variant="contained" color="primary" onClick={() => router.reload()}>
            Reload
          </Button>
        </Stack>
      ) : (
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
            <Typography sx={{ ml: 1 }} variant="h4">
              Application {application?.name}
            </Typography>
          </Stack>
          <Stack mb={1} direction="row">
            <Typography>
              Category : <span style={{ fontWeight: 'bold' }}>{application?.category_name}</span>
            </Typography>
          </Stack>
          <Divider color="primary" />
          <br />

          {releaseLoading ? (
            <CircularLoader />
          ) : (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 5 }}
              justifyContent="space-between"
              justifyItems="center"
            >
              <Stack mb={1} direction="column" spacing={1}>
                <Typography variant="h6">Release {release?.version}</Typography>
                <Typography>
                  Added at :{' '}
                  <span style={{ fontWeight: 'bold' }}>
                    {release?.created_at?.seconds
                      ? new Date(release?.created_at?.seconds * 1000).toLocaleDateString()
                      : null}
                  </span>
                </Typography>
              </Stack>
              <Box>
                {release?.published ?? false ? (
                  <Stack direction="column" alignItems="end" justifyContent="start" spacing={1}>
                    {release?.published_at && (
                      <Typography>
                        Published at :{' '}
                        <span style={{ fontWeight: 'bold', color: 'green' }}>
                          {release?.published_at?.seconds
                            ? new Date(release?.published_at?.seconds * 1000).toLocaleDateString()
                            : null}
                        </span>
                      </Typography>
                    )}

                    <LoadingButton
                      disabled={scanningApp || publishing || unPublishing}
                      onClick={unPublish}
                      loading={unPublishing}
                      variant="contained"
                      color="warning"
                    >
                      Upublish release
                    </LoadingButton>
                  </Stack>
                ) : (release?.scan_score ?? 0) > 50 && !release.published ? (
                  <Stack direction="column" alignItems="end" justifyContent="start" spacing={0}>
                    <Typography textAlign="center" variant="h6">
                      Scan result :{'  '}
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: (release?.scan_score ?? 0) > 50 ? 'green' : 'red',
                          fontSize: '24px',
                        }}
                      >
                        {release?.scan_score}{' '}
                      </span>
                      <span style={{ fontWeight: 'bold', fontSize: '24px' }}>/ 100</span>
                    </Typography>
                    <LoadingButton
                      disabled={scanningApp || publishing}
                      onClick={publish}
                      loading={publishing}
                      variant="contained"
                      color="primary"
                    >
                      Publish release
                    </LoadingButton>
                  </Stack>
                ) : (
                  <Stack direction="column" alignItems="center" justifyContent="center" spacing={1}>
                    <Button
                      disabled={scanningApp || publishing}
                      onClick={scanApp}
                      loading={scanningApp}
                      variant="contained"
                      color="success"
                    >
                      {scanningApp
                        ? 'Scanning...'
                        : scanningResult
                          ? 'Relaunch scan'
                          : 'Launch scan'}
                    </Button>
                    {(scanningResult?.appsec?.security_score ?? 0) > 50 && (
                      <Stack direction="column" alignItems="center" justifyContent="end">
                        <Button
                          disabled={scanningApp || publishing}
                          onClick={publish}
                          loading={publishing}
                          variant="contained"
                          color="secondary"
                        >
                          {publishing ? 'Publishing...' : 'Publish release'}
                        </Button>
                        {publishingError && (
                          <Typography color="error">{publishingError}</Typography>
                        )}
                      </Stack>
                    )}
                  </Stack>
                )}
              </Box>
            </Stack>
          )}
          {scanningApp && (
            <Stack direction="column" alignItems="center" justifyContent="center">
              <CircularLoader />
              <Typography>
                Keep this page open, you will be notified at the end of the scan.
              </Typography>
            </Stack>
          )}
          {!scanningApp && scanningResult && (
            <Box>
              <Typography sx={{ mb: 1 }} textAlign="center" variant="h6">
                Scan result :{'  '}
                <span
                  style={{
                    fontWeight: 'bold',
                    color: scanningResult.appsec.security_score < 50 ? 'red' : 'green',
                    fontSize: '24px',
                  }}
                >
                  {scanningResult.appsec.security_score}{' '}
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '24px' }}>/ 100</span>
              </Typography>
              <Divider color="primary" />
              <br />
              <Typography sx={{ textDecoration: 'underline' }}>Resume</Typography>
              <br />
              {(scanningResult.appsec.hotspot ?? []).map((high) => (
                <Typography>
                  {' '}
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: 'orange',
                    }}
                  >
                    {high.title}{' '}
                  </span>
                </Typography>
              ))}
              {(scanningResult.appsec.high ?? []).map((high) => (
                <Typography>
                  {' '}
                  <span
                    style={{
                      fontWeight: 'bold',
                    }}
                  >
                    {high.title}{' '}
                  </span>
                </Typography>
              ))}
              {(scanningResult.appsec.info ?? []).map((high) => (
                <Typography>
                  {' '}
                  <span>{high.title} </span>
                </Typography>
              ))}
              <br />
              <Typography sx={{ textDecoration: 'underline' }}>Information</Typography>
              <br />
              <Stack direction="row" alignItems="start" justifyContent="space-between">
                <Stack direction="column" alignItems="start" justifyContent="space-between">
                  <Typography>
                    Size : <span style={{ fontWeight: 'bold' }}>{scanningResult.size}</span>
                  </Typography>
                  <Typography>
                    Version name :{' '}
                    <span style={{ fontWeight: 'bold' }}>{scanningResult.version_name}</span>
                  </Typography>
                  <Typography>
                    Version code :{' '}
                    <span style={{ fontWeight: 'bold' }}>{scanningResult.version_code}</span>
                  </Typography>
                </Stack>
                <Stack direction="column" alignItems="end" justifyContent="space-between">
                  <Typography>
                    Trackers detected :{' '}
                    <span style={{ fontWeight: 'bold' }}>
                      {scanningResult.trackers.detected_trackers}
                    </span>
                  </Typography>
                  <Typography>
                    Services found :{' '}
                    <span style={{ fontWeight: 'bold' }}>{scanningResult.services.length}</span>
                  </Typography>
                  <Typography>
                    Dangerous permissions :{' '}
                    <span style={{ fontWeight: 'bold' }}>
                      {
                        Object.values(scanningResult.permissions).filter(
                          (permission) => permission.status === 'dangerous'
                        ).length
                      }
                    </span>{' '}
                    <span style={{ fontWeight: 'bold' }}>
                      / {Object.values(scanningResult.permissions).length}
                    </span>
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}
        </Stack>
      )}
      <br />
    </Container>
  );
}
