/* eslint-disable no-nested-ternary */
import 'filepond/dist/filepond.min.css';
/* eslint-disable no-debugger */
import { useParams } from 'react-router-dom';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardMedia from '@mui/material/CardMedia';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import LinearProgress from '@mui/material/LinearProgress';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/use_auth';
import usePromise from 'src/hooks/use_promise';

import { validateSchemas } from 'src/utils/forms/validator';
import { useFormValidation } from 'src/utils/forms/hooks/useFormValidation';

import Iconify from 'src/components/iconify';
import CircularLoader from 'src/components/loader/CircularLoader';

import { getDeveloperApplication, addNewApplicationRelease } from '../services/firestore';

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

// ----------------------------------------------------------------------

export default function AddNewReleaseView() {
  const form = useFormValidation({});

  const { user } = useAuth();

  const router = useRouter();

  const { id: applicationId } = useParams();

  const { data: application, loading: applicationLoading } = usePromise(() =>
    getDeveloperApplication({ applicationId })
  );

  const onUploadProgress = (progress) => {
    form.setFieldValue('package_file_upload_progress', progress);
  };

  function loadApplicationPackageInfo(file) {
    form.setFieldValue('package_file_info', null);

    new window.AppInfoParser(file)
      .parse()
      .then((appPackageInfo) => {
        const applicationInfo = {
          icon: appPackageInfo.icon,
          label: appPackageInfo.application.label,
          package: appPackageInfo.package,
          version_code: appPackageInfo.versionCode,
          version: appPackageInfo.versionName,
          modifiedAt: file.lastModifiedDate,
          size: file.size,
          sizeRounded: Math.round(file.size / 1024 ** 2),
        };

        if (applicationInfo.package === application.package_name) {
          // if (true) {
          form.setFieldValue('package_file_info', applicationInfo);
          form.setFieldValue('version', applicationInfo.version);
        } else {
          // form.setFieldValue('package_file_info', null);
          // form.setFieldValue('package_file', null);
          form.setFieldError(
            'package_file',
            `Your apk file package name (${applicationInfo.package}) and application package name (${application.package_name}) are not compatible.`
          );
        }
      })
      .catch((e) => {
        form.setFieldError('package_file', e?.message ?? 'Invalid package file submitted.');
        form.setFieldValue('package_file_info', null);
      });
  }

  const createReleaseFunc = async () => {
    if (
      await validateSchemas({
        validationSchemas: {
          name: 'Enter release name.',
          package_file: 'Choose application package file.',
          package_file_info: 'Error occured during package file parsing.',
          releases_notes: 'Enter release notes.',
        },
        setFieldError: (field, message) => {
          form.setFieldError(field, message);

          form.setSubmitError(message);
        },
        stopValidationOnFirstError: false,
        values: form.data,
      })
    ) {
      form.setSubmitting(true);

      addNewApplicationRelease({
        onUploadProgress,
        publisher_id: user.publisher_id,
        formData: {
          package_file: form.data.package_file,
          version: form.data.package_file_info.version,
          version_code: form.data.package_file_info.version_code,
          package_icon: form.data.package_file_info.icon,
          label: form.data.package_file_info.label,
          updated_at: form.data.package_file_info.modifiedAt,
          size: form.data.package_file_info.size,
          releases_notes: form.data.releases_notes,
        },
        package_name: application.package_name,
        application_id: applicationId,
        app_type: application.app_type,
      })
        .then((releaseId) => {
          router.push(`/${application.app_type}s/view/${applicationId}/release/${releaseId}`);
        })
        .catch((e) => {
          form.setSubmitError(e?.message ?? 'An error occured.');
        })
        .finally(() => {
          form.setSubmitting(false);
        });
    } else {
      form.setSubmitError('Enter valid informations.');
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack mb={1} direction="row" alignItems="center" justifyContent="start">
        <Iconify
          color="primary"
          sx={{ mr: 1 }}
          icon="material-symbols:arrow-back-ios"
          width={24}
          height={24}
          onClick={() => router.push(`/${application?.app_type ?? 'app'}s/view/${applicationId}`)}
          cursor="pointer"
        />
        <Typography variant="h4">Add new release</Typography>
      </Stack>
      <Divider color="primary" />
      <br />
      {applicationLoading ? (
        <CircularLoader />
      ) : (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Name"
                required
                helperText={form.validationErrors.name}
                error={!!form.validationErrors.name}
                onChange={(e) => form.setFieldValue('name', e.target.value)}
                size="small"
                fullWidth
              />
              <br />
              <br />
              <FilePond
                label="App Package File"
                files={form.data.package_file ? [form.data.package_file] : []}
                onremovefile={() => {
                  form.setFieldValue('package_file', null);
                  form.setFieldValue('package_file_info', null);
                }}
                onaddfilestart={({ file }) => {
                  if (
                    file &&
                    file.type &&
                    file.type === 'application/vnd.android.package-archive'
                  ) {
                    /* empty */
                  } else {
                    throw new Error('Select a valid application file.');
                  }
                }}
                onupdatefiles={(files) => {
                  const file = files?.[0]?.file;

                  if (file) {
                    if (file.type && file.type === 'application/vnd.android.package-archive') {
                      form.setFieldValue('package_file', file);
                      loadApplicationPackageInfo(file);
                    } else {
                      form.setFieldError('package_file', 'Select a valid application file.');
                    }
                  }
                }}
                allowMultiple={false}
                maxFiles={1}
                required
                acceptedFileTypes={['application/vnd.android.package-archive']}
                name="package_file"
                labelIdle="App Package File"
              />
              <Typography color="error">
                {form.validationErrors.package_file ?? form.validationErrors.package_file_info}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              {form.data.package_file ? (
                form.data.package_file_info ? (
                  <Stack
                    sx={{
                      marginY: 'auto',
                    }}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    justifyContent="space-arround"
                    justifyItems="center"
                    alignContent="center"
                  >
                    <CardMedia
                      component="img"
                      image={form.data.package_file_info.icon}
                      alt={form.data.package_file_info.label}
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 2,
                        border: 'green solid 1px',
                        mr: 4,
                        p: 1,
                      }}
                    />
                    <Stack>
                      <Typography>
                        Label :{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {form.data.package_file_info.label}
                        </span>
                      </Typography>
                      <Typography>
                        Package Name :{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {form.data.package_file_info.package}
                        </span>
                      </Typography>
                      <Typography>
                        Version :{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {form.data.package_file_info.version}
                        </span>
                      </Typography>
                      <Typography>
                        Version Code :{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {form.data.package_file_info.version_code}
                        </span>
                      </Typography>
                      <Typography>
                        Size :{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {`${form.data.package_file_info.sizeRounded} Mo`}
                        </span>
                      </Typography>
                      <Typography>
                        Build at :{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {form.data.package_file_info.modifiedAt?.toLocaleString('en-US', {
                            timeZone: 'UTC',
                            dateStyle: 'medium',
                            timeStyle: 'medium',
                          })}
                        </span>
                      </Typography>
                    </Stack>
                  </Stack>
                ) : form.validationErrors.package_file ??
                  form.validationErrors.package_file_info ? null : (
                  <CircularLoader />
                )
              ) : null}
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="releases_notes"
                label="Release notes"
                required
                helperText={form.validationErrors.releases_notes}
                error={!!form.validationErrors.releases_notes}
                onChange={(e) => form.setFieldValue('releases_notes', e.target.value)}
                size="medium"
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
          </Grid>
        </Box>
      )}
      <br />
      {form.submitting ? (
        form.data.package_file_upload_progress ? (
          form.data.package_file_upload_progress === 100 ? (
            <Typography align="center">Finalizing...</Typography>
          ) : (
            <Stack>
              <LinearProgress
                variant="determinate"
                color="primary"
                value={form.data.package_file_upload_progress}
                sx={{
                  height: 6,
                  borderRadius: 2,
                  backgroundColor: '#E9EEEF',
                  mb: 1,
                }}
              />
              <Typography align="center">Uploading application file...</Typography>
            </Stack>
          )
        ) : (
          <Typography align="center">Processing application file pre-analysis...</Typography>
        )
      ) : (
        form.submitError && (
          <Typography align="center" color="error">
            {form.submitError}
          </Typography>
        )
      )}
      <br />
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={form.submitting}
        onClick={createReleaseFunc}
      >
        Create new release
      </LoadingButton>
    </Container>
  );
}
