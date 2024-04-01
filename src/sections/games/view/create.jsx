/* eslint-disable no-debugger */
import { useMemo } from 'react';
import { toInteger } from 'lodash';
import PropTypes from 'prop-types';
import 'filepond/dist/filepond.min.css';
import { registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
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

import Iconify from 'src/components/iconify';
import FormSelect from 'src/components/form/select';
import RadioInput from 'src/components/form/radio_input';
import CircularLoader from 'src/components/loader/CircularLoader';
import FilePondFirebaseInputField from 'src/components/form/filepond_firebase';

import { getTags } from 'src/sections/apps/services/firestore';

import { editGame, addNewGame, getGamesCategories } from '../services/firestore';

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

// ----------------------------------------------------------------------

export default function CreateNewGame({ formData = null }) {
  const { user } = useAuth();

  const form = useFormValidation({
    initialData: {
      contains_ads: false,
      has_in_app_purchases: false,
      is_free: true,
      min_age_requirement: 12,
      ...(formData === null
        ? {
            email: user?.email,
          }
        : formData),
    },
  });

  const editing = useMemo(() => !!formData, [formData]);

  const router = useRouter();

  const { data: categories, loading: loadingCategories } = usePromise(getGamesCategories);
  const { data: tags, loading: loadingTags } = usePromise(getTags);

  const createAppFunc = async () => {
    if (
      await validateSchemas({
        validationSchemas: {
          // 1 - Information
          name: 'Enter game name.',
          category_id: 'Choose game category.',
          email: 'Enter valid email.',
          website: 'Enter valid website.',
          description: 'Enter game description.',

          // 2 - Presentation
          logo_image_square_url: 'Select your game main logo.',
          // cover_image_rect_url: 'Select your game cover image.',
          screenshots: ({ value }) => {
            if (!value || (value ?? []).length < 2) {
              return 'Add at least two screenshot.';
            }

            return undefined;
          },

          // 3 - Additionnal
          tags: 'Add game tags.',

          package_name: ({ value }) => {
            if (!value) {
              return 'Add application Package Name';
            }

            if (value.startsWith('com.example')) {
              return 'Package name must not start with "com.example"';
            }

            return undefined;
          },

          min_age_requirement: 'Indicate min age requirement.',

          is_free: 'Indicates if the book is free.',
          price: ({ value, values }) => {
            if (values.is_free) {
              return undefined;
            }

            if (!value) {
              return 'Enter book price.';
            }

            return toInteger(`${value}`) > 0 ? undefined : 'Enter valid price.';
          },
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

      try {
        if (editing) {
          await editGame({
            formData: form.data,
            gameId: form.data.id,
            categories,
            user,
            onSuccess: ({ id }) => {
              router.push(`/games/view/${id}`);
            },
            onError: (e) => {
              form.setSubmitting(false);

              form.setSubmitError(e?.message ?? 'An error occured while creating the game.');
            },
          });
        } else {
          await addNewGame({
            formData: form.data,
            categories,
            user,
            onSuccess: ({ id }) => {
              router.push(`/games/view/${id}`);
            },
            onError: (e) => {
              form.setSubmitting(false);

              form.setSubmitError(e?.message ?? 'An error occured while creating the game.');
            },
          });
        }
      } catch (error) {
        form.setSubmitting(false);

        form.setSubmitError(error?.message ?? 'An error occured.');
      }
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
          onClick={() => router.push('/apps')}
          cursor="pointer"
        />
        <Typography variant="h4">{editing ? 'Edit game' : 'Create new game'}</Typography>
      </Stack>
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
                value={form.data.name}
                focused
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
                value={form.data.email}
                focused
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
                value={form.data.website}
                focused
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
                value={form.data.description}
                focused
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
              <FilePondFirebaseInputField
                label="Game Logo Image * (512x512)"
                hint="Game Logo Image *"
                name="logo_image_square_url"
                value={form.data.logo_image_square_url}
                setValue={(value) => form.setFieldValue('logo_image_square_url', value)}
                acceptedFileTypes={['image/*']}
                required
                uploadBasePath={`developers/${user.web3_account_id}/apps/logo`}
              />
              <Typography color="error">{form.validationErrors.logo_image_square_url}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FilePondFirebaseInputField
                label="Game Cover Image * (1000x512)"
                hint="Game Cover Image"
                name="cover_image_rect_url"
                value={form.data.cover_image_rect_url}
                setValue={(value) => form.setFieldValue('cover_image_rect_url', value)}
                acceptedFileTypes={['image/*']}
                required
                uploadBasePath={`developers/${user.web3_account_id}/apps/covers`}
              />
              <Typography color="error">{form.validationErrors.cover_image_rect_url}</Typography>
            </Grid>
            <Grid item xs={12}>
              <FilePondFirebaseInputField
                name="screenshots"
                acceptedFileTypes={['image/*']}
                hint="Game Screenshots"
                label="Game Screenshots"
                maxFiles={8}
                multiple
                required
                setValue={(value) => form.setFieldValue('screenshots', value)}
                value={form.data.screenshots}
                validateFile={(file) => {
                  if (file.type && file.type.startsWith('image/')) {
                    /* empty */
                  } else {
                    throw new Error('Select a valid image');
                  }
                }}
                uploadBasePath={`developers/${user.web3_account_id}/apps/screenshots`}
                helperText="At least two screenshots"
              />
              <Typography color="error">{form.validationErrors.screenshots}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="video_trailer_url"
                label="Video Trailer URL"
                helperText={form.validationErrors.video_trailer_url}
                error={!!form.validationErrors.video_trailer_url}
                onChange={(e) => form.setFieldValue('video_trailer_url', e.target.value)}
                value={form.data.video_trailer_url}
                focused
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
                  const prevTags = form.data.tags ?? [];

                  form.setFieldValue('tags', [...prevTags, ...value]);
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
              <RadioInput
                row
                sx={{ marginY: 1, flexDirection: 'row' }}
                labelSx={{ marginY: 'auto', marginRight: 'auto' }}
                error={form.validationErrors.is_free}
                helperText={form.validationErrors.is_free}
                label="Is free"
                variant="outlined"
                items={[
                  { label: 'YES', value: true },
                  { label: 'NO', value: false },
                ]}
                onChange={(value) => {
                  form.setFieldValue('is_free', value);
                }}
                id="is_free"
                value={form.data.is_free}
                itemValueBuilder={(item) => item.value}
                itemLabelBuilder={(item) => item.label}
                name="is_free"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              {`${form.data.is_free ?? true}` === 'true' ? null : (
                <TextField
                  name="price"
                  label="Price in $RL"
                  type="number"
                  required
                  helperText={form.validationErrors.price}
                  error={!!form.validationErrors.price}
                  onChange={(e) => form.setFieldValue('price', e.target.value)}
                  value={form.data.price}
                  focused
                  size="small"
                  fullWidth
                />
              )}
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
                value={form.data.min_age_requirement}
                focused
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
                name="package_name"
                label="Package name"
                helperText={form.validationErrors.package_name}
                error={!!form.validationErrors.package_name}
                onChange={(e) => form.setFieldValue('package_name', e.target.value)}
                value={form.data.package_name}
                focused
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="privacy_policy_link"
                label="Privacy policy Link"
                helperText={form.validationErrors.privacy_policy_link}
                error={!!form.validationErrors.privacy_policy_link}
                onChange={(e) => form.setFieldValue('privacy_policy_link', e.target.value)}
                value={form.data.privacy_policy_link}
                focused
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
        {editing ? 'Update game' : 'Create new game'}
      </LoadingButton>
    </Container>
  );
}

CreateNewGame.propTypes = {
  formData: PropTypes.object,
};
