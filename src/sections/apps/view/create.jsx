/* eslint-disable no-debugger */
import 'filepond/dist/filepond.min.css';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/use_auth';
import usePromise from 'src/hooks/use_promise';

import { validateSchemas } from 'src/utils/forms/validator';
import { useFormValidation } from 'src/utils/forms/hooks/useFormValidation';

import FormSelect from 'src/components/form/select';
import RadioInput from 'src/components/form/radio_input';
import CircularLoader from 'src/components/loader/CircularLoader';

import { getTags, addNewApplication, getAppsCategories } from '../services/firestore';

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

// ----------------------------------------------------------------------

export default function CreateNewApp() {
  const form = useFormValidation({
    contains_ads: false,
    has_in_app_purchases: false,
  });

  const { user } = useAuth();

  const router = useRouter();

  const { data: categories, loading: loadingCategories } = usePromise(getAppsCategories);
  const { data: tags, loading: loadingTags } = usePromise(getTags);

  const createAppFunc = async () => {
    if (
      await validateSchemas({
        validationSchemas: {
          // 1 - Information
          name: 'Enter application name.',
          category_id: 'Choose application category.',
          email: 'Enter valid email.',
          website: 'Enter valid website.',
          description: 'Enter app description.',

          // 2 - Presentation
          logo_image_square: 'Select your application main logo.',
          cover_image_rect: 'Select your application cover image.',
          // app_screenshots: 'Add your application screenshots.',

          // 3 - Additionnal
          tags: 'Add application tags.',
          min_age_requirement: 'Indicate min age requirement.',
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

      addNewApplication({ formData: form.data, categories, user })
        .then((result) => {
          router.push(`/apps/${result.id}`);
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
      <Typography variant="h4">Create new application</Typography>
      <Divider color="primary" />
      <br />
      {loadingCategories || loadingTags ? (
        <CircularLoader />
      ) : (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {' '}
              <Typography variant="h6">1. Information</Typography>
            </Grid>

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
            </Grid>
            <Grid item xs={12} md={6}>
              <FormSelect
                onChange={(value) => {
                  form.setFieldValue('category_id', value);
                }}
                label="Category *"
                name="category_id"
                items={(categories ?? []).map((i) => ({
                  label: i.label,
                  value: i.id,
                }))}
                error={form.validationErrors.category_id}
                helperText={form.validationErrors.category_id}
                defaultValue={form.data.category_id}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email"
                required
                helperText={form.validationErrors.email}
                error={!!form.validationErrors.email}
                onChange={(e) => form.setFieldValue('email', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="website"
                label="Website"
                required
                helperText={form.validationErrors.website}
                error={!!form.validationErrors.website}
                onChange={(e) => form.setFieldValue('website', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                required
                helperText={form.validationErrors.description}
                error={!!form.validationErrors.description}
                onChange={(e) => form.setFieldValue('description', e.target.value)}
                size="medium"
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
          </Grid>
          <br />
          <Divider color="primary" />
          <br />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {' '}
              <Typography variant="h6">2. Presentation</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FilePond
                label="App Logo Image (512x512)"
                files={form.data.logo_image_square ? [form.data.logo_image_square] : []}
                onaddfilestart={(files) => {
                  const file = files?.[0]?.file;

                  if (file && file.type && file.type.startsWith('image/')) {
                    /* empty */
                  } else {
                    throw new Error('Select a valid image');
                  }
                }}
                onupdatefiles={(files) => {
                  const file = files?.[0]?.file;

                  if (file && file.type && file.type.startsWith('image/')) {
                    form.setFieldValue('logo_image_square', file);
                  } else {
                    form.setFieldError('logo_image_square', 'Select a valid image');
                  }
                }}
                allowMultiple={false}
                maxFiles={1}
                required
                acceptedFileTypes={['image/*']}
                name="logo_image_square"
                labelIdle="App Logo Image"
                helperText="(512x512)"
              />
              <Typography color="error">{form.validationErrors.logo_image_square}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FilePond
                label="App Cover Image (1000x512)"
                files={form.data.cover_image_rect ? [form.data.cover_image_rect] : []}
                onaddfilestart={(files) => {
                  const file = files?.[0]?.file;

                  if (file && file.type && file.type.startsWith('image/')) {
                    /* empty */
                  } else {
                    throw new Error('Select a valid image');
                  }
                }}
                onupdatefiles={(files) => {
                  const file = files?.[0]?.file;

                  if (file && file.type && file.type.startsWith('image/')) {
                    form.setFieldValue('cover_image_rect', file);
                  } else {
                    form.setFieldError('cover_image_rect', 'Select a valid image');
                  }
                }}
                allowMultiple={false}
                maxFiles={1}
                required
                acceptedFileTypes={['image/*']}
                name="cover_image_rect"
                labelIdle="App Cover Image"
                helperText="Image should be (1000x512)"
              />
              <Typography color="error">{form.validationErrors.cover_image_rect}</Typography>
            </Grid>
            <Grid item xs={12}>
              <FilePond
                label="App Screenshots"
                files={form.data.app_screenshots ? [...form.data.app_screenshots] : []}
                onaddfilestart={(files) => {
                  const file = files?.[0]?.file;

                  if (file && file.type && file.type.startsWith('image/')) {
                    /* empty */
                  } else {
                    throw new Error('Select a valid image');
                  }
                }}
                onupdatefiles={(files) => {
                  const file = files?.[0]?.file;

                  if (file && file.type && file.type.startsWith('image/')) {
                    form.setFieldValue('app_screenshots', [...form.data.app_screenshots, file]);
                  } else {
                    form.setFieldError('app_screenshots', 'Select a valid image');
                  }
                }}
                allowMultiple
                maxFiles={8}
                required
                acceptedFileTypes={['image/*']}
                name="app_screenshots"
                labelIdle="App Screenshots"
                helperText="At least four screenshots"
              />
              <Typography color="error">{form.validationErrors.app_screenshots}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="video_trailer_url"
                label="Video Trailer URL"
                helperText={form.validationErrors.video_trailer_url}
                error={!!form.validationErrors.video_trailer_url}
                onChange={(e) => form.setFieldValue('video_trailer_url', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
          <br />
          <Divider color="primary" />
          <br />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {' '}
              <Typography variant="h6">3. Additionnal</Typography>
            </Grid>
            <Grid item xs={6}>
              <FormSelect
                onChange={(value) => {

                  form.setFieldValue('tags', [...(form.data.tags ?? []), ...value]);
                }}
                multiple
                label="Tags *"
                name="tags"
                items={(tags ?? []).map((i) => ({
                  label: i.label,
                  value: i.id,
                }))}
                error={form.validationErrors.tags}
                helperText={form.validationErrors.tags}
                defaultValue={form.data.tags ?? []}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RadioInput
                row
                sx={{ marginY: 1, flexDirection: 'row' }}
                labelSx={{ marginY: 'auto', marginRight: 'auto' }}
                error={form.validationErrors.contains_ads}
                helperText={form.validationErrors.contains_ads}
                label="Contains ads"
                variant="outlined"
                items={[
                  { label: 'YES', value: true },
                  { label: 'NO', value: false },
                ]}
                onChange={(value) => {
                  form.setFieldValue('contains_ads', value);
                }}
                id="contains_ads"
                value={form.data.contains_ads}
                itemValueBuilder={(item) => item.value}
                itemLabelBuilder={(item) => item.label}
                name="contains_ads"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="min_age_requirement"
                label="Min age required"
                type="number"
                required
                helperText={form.validationErrors.min_age_requirement}
                error={!!form.validationErrors.min_age_requirement}
                onChange={(e) => form.setFieldValue('min_age_requirement', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RadioInput
                row
                sx={{ marginY: 1, flexDirection: 'row' }}
                labelSx={{ marginY: 'auto', marginRight: 'auto' }}
                error={form.validationErrors.has_in_app_purchases}
                helperText={form.validationErrors.has_in_app_purchases}
                label="Has in app purchases"
                variant="outlined"
                items={[
                  { label: 'YES', value: true },
                  { label: 'NO', value: false },
                ]}
                onChange={(value) => {
                  form.setFieldValue('has_in_app_purchases', value);
                }}
                id="has_in_app_purchases"
                value={form.data.has_in_app_purchases}
                itemValueBuilder={(item) => item.value}
                itemLabelBuilder={(item) => item.label}
                name="has_in_app_purchases"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="privacy_policy_link"
                label="Privacy policy Link"
                helperText={form.validationErrors.privacy_policy_link}
                error={!!form.validationErrors.privacy_policy_link}
                onChange={(e) => form.setFieldValue('privacy_policy_link', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      )}
      <br />
      <Typography color="error">{form.submitError}</Typography>
      <br />
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={form.submitting}
        onClick={createAppFunc}
      >
        Create new application
      </LoadingButton>
    </Container>
  );
}
