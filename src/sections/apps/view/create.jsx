import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import usePromise from 'src/hooks/use_promise';

import { useFormValidation } from 'src/utils/forms/hooks/useFormValidation';

import FormSelect from 'src/components/form/select';
import RadioInput from 'src/components/form/radio_input';
import CircularLoader from 'src/components/loader/CircularLoader';

import { getTags, getAppsCategories } from '../services/firestore';

// ----------------------------------------------------------------------

export default function CreateNewApp() {
  const form = useFormValidation({});

  const { data: categories, loading: loadingCategories } = usePromise(getAppsCategories);
  const { data: tags, loading: loadingTags } = usePromise(getTags);

  const createAppFunc = async () => {};

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
            <Grid item xs={12} md={4}>
              <RadioInput
                row
                sx={{ marginY: 1, flexDirection: 'row' }}
                labelSx={{ marginY: 'auto', marginRight: 'auto' }}
                error={form.validationErrors.has_ads}
                helperText={form.validationErrors.has_ads}
                label="Contains ads"
                variant="outlined"
                items={[
                  { label: 'YES', value: true },
                  { label: 'NO', value: false },
                ]}
                onChange={(value) => {
                  form.setFieldValue('has_ads', value);
                }}
                id="has_ads"
                value={form.data.has_ads}
                itemValueBuilder={(item) => item.value}
                itemLabelBuilder={(item) => item.label}
                name="has_ads"
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
                  form.setFieldValue('tags', [...(form.data.tags ?? []), value]);
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
            <Grid item xs={12} md={4}>
              <RadioInput
                row
                sx={{ marginY: 1, flexDirection: 'row' }}
                labelSx={{ marginY: 'auto', marginRight: 'auto' }}
                error={form.validationErrors.has_ads}
                helperText={form.validationErrors.has_ads}
                label="Contains ads"
                variant="outlined"
                items={[
                  { label: 'YES', value: true },
                  { label: 'NO', value: false },
                ]}
                onChange={(value) => {
                  form.setFieldValue('has_ads', value);
                }}
                id="has_ads"
                value={form.data.has_ads}
                itemValueBuilder={(item) => item.value}
                itemLabelBuilder={(item) => item.label}
                name="has_ads"
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
