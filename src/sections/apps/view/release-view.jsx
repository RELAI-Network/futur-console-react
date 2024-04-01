/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-template */
/* eslint-disable react/prop-types */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/use_auth';
import usePromise from 'src/hooks/use_promise';

import { addDocument } from 'src/services/firebase/firestore/helpers';

import Iconify from 'src/components/iconify';
import CircularLoader from 'src/components/loader/CircularLoader';

import { minScanScore, recommendedScanScore } from '../constants';
import {
  scanMobSF,
  getApplicationRelease,
  getDeveloperApplication,
  publishApplicationRelease,
  unPublishApplicationRelease,
} from '../services/firestore';

export default function ReleaseView() {
  const { id: releaseId, application_id: applicationId } = useParams();

  const { user } = useAuth();

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
      try {
        const scanResult = await scanMobSF(release?.scan_hash);

        setScanningResult(scanResult);

        if ((scanResult?.appsec?.security_score ?? 0) > minScanScore) {
          await addDocument(
            `apps_scans`,
            {
              application_id: applicationId,
              scan_score: scanResult?.appsec?.security_score,
              scan_hash: release?.scan_hash,
              scanned_at: Timestamp.now(),
            },
            applicationId,
            { merge: true }
          );
        }
      } catch (error) {
        setScanningApp(false);
      }
    }

    setScanningApp(false);
  };

  const publish = async () => {
    setPublishing(true);
    setPublishingError('');

    if ((scanningResult?.appsec?.security_score ?? release?.scan_score ?? 0) > minScanScore) {
      setPublishing(true);
      setPublishingError('');

      try {
        await publishApplicationRelease({
          application_id: applicationId,
          release_id: releaseId,
          user_account: user?.web3_account_address,
          onSuccess: () => router.reload(),
          onError: (e) => {
            setPublishing(false);

            setPublishingError(e?.message ?? 'An error occured while publishing the application.');
          },
        });
      } catch (e) {
        setPublishingError(e?.message ?? 'An error occured while publishing the application.');

        setPublishing(false);
      }
    }
  };

  const unPublish = async () => {
    if (release.published ?? false) {
      setUnPublishing(true);
      setPublishingError('');

      try {
        await unPublishApplicationRelease({
          application_id: applicationId,
          release_id: releaseId,
          user_account: user?.web3_account_address,

          onSuccess: () => router.reload(),

          onError: (e) => {
            setUnPublishing(false);

            setPublishingError(
              e?.message ?? 'An error occured while unpublishing the application.'
            );
          },
        });
      } catch (e) {
        setPublishingError(e?.message ?? 'An error occured while publishing the application.');

        setUnPublishing(false);
      }
    }
  };

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
              onClick={() =>
                router.push(`/${application?.app_type ?? 'app'}s/view/${applicationId}`)
              }
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
                      ? new Date(release?.created_at?.seconds * 1000).toLocaleString('en-US', {
                          timeZone: 'UTC',
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                        })
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
                ) : (release?.scan_score ?? 0) > minScanScore && !release.published ? (
                  <Stack direction="column" alignItems="end" justifyContent="start" spacing={0}>
                    <Typography textAlign="center" variant="h6">
                      Scan result :{'  '}
                      <span
                        style={{
                          fontWeight: 'bold',
                          color:
                            (release?.scan_score ?? 0) > recommendedScanScore
                              ? 'green'
                              : (release?.scan_score ?? 0) > minScanScore
                                ? 'orange'
                                : 'red',
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
                    <LoadingButton
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
                    </LoadingButton>
                    {(scanningResult?.appsec?.security_score ?? 0) > minScanScore && (
                      <Stack direction="column" alignItems="center" justifyContent="end">
                        <LoadingButton
                          disabled={scanningApp || publishing}
                          onClick={publish}
                          loading={publishing}
                          variant="contained"
                          color="secondary"
                        >
                          {publishing ? 'Publishing...' : 'Publish release'}
                        </LoadingButton>
                      </Stack>
                    )}
                  </Stack>
                )}
              </Box>
            </Stack>
          )}
          {publishingError && <Typography color="error">{publishingError}</Typography>}
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
                    color:
                      (scanningResult?.appsec?.security_score ?? 0) > recommendedScanScore
                        ? 'green'
                        : (scanningResult?.appsec?.security_score ?? 0) > minScanScore
                          ? 'orange'
                          : 'red',
                    fontSize: '24px',
                  }}
                >
                  {scanningResult.appsec.security_score}{' '}
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '24px' }}>/ 100</span>
              </Typography>
              <Divider color="primary" />
              <br />
              <Typography sx={{ textDecoration: 'underline', fontSize: '18px' }}>Resume</Typography>
              <br />

              {(scanningResult.appsec.high ?? []).length > 0 && (
                <>
                  <Typography sx={{ textDecoration: 'underline', mb: 1, ml: 1 }}>
                    Severe vulnerabilities
                  </Typography>
                  {(scanningResult.appsec.high ?? []).map((high, index) => (
                    <Typography>
                      {' '}
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: 'red',
                          marginLeft: '9px',
                        }}
                      >
                        {`${index + 1}.`} {high.title}{' '}
                      </span>
                    </Typography>
                  ))}
                  <br />
                </>
              )}

              {(scanningResult.appsec.hotspot ?? []).length > 0 && (
                <>
                  <Typography sx={{ textDecoration: 'underline', mb: 1, ml: 1 }}>
                    High vulnerabilities
                  </Typography>
                  {(scanningResult.appsec.hotspot ?? []).map((hotspot, index) => (
                    <Typography>
                      {' '}
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: 'orange',
                          marginLeft: '9px',
                        }}
                      >
                        {`${index + 1}.`} {hotspot.title}{' '}
                      </span>
                    </Typography>
                  ))}
                  <br />
                </>
              )}

              {(scanningResult.appsec.info ?? []).length > 0 && (
                <>
                  <Typography sx={{ textDecoration: 'underline', mb: 1, ml: 1 }}>
                    Legere vulnerabilities
                  </Typography>
                  {(scanningResult.appsec.info ?? []).map((info, index) => (
                    <Typography>
                      {' '}
                      <span
                        style={{
                          marginLeft: '9px',
                        }}
                      >
                        {`${index + 1}.`} {info.title}{' '}
                      </span>
                    </Typography>
                  ))}
                  <br />
                </>
              )}

              <br />
              <Typography sx={{ textDecoration: 'underline', fontSize: '18px' }}>
                Information
              </Typography>
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
