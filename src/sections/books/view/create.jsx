/* eslint-disable no-debugger */
import { useMemo } from 'react';
import { toInteger } from 'lodash';
import PropTypes from 'prop-types';
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
import FilePondFirebaseInputField from 'src/components/form/filepond_firebase';

import { bookTypes, bookGenres, bookLanguages } from '../constants';
import {
  editBookEdition,
  getBooksCategories,
  addAndPublishNewBookEdition,
} from '../services/firestore';

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

// ----------------------------------------------------------------------

export default function CreateNewEditBook({ formData = {} }) {
  const form = useFormValidation({
    initialData: {
      is_free: true,
      min_age_requirement: 12,
      ...(formData === null ? {} : formData),
    },
  });

  const editing = useMemo(() => !!formData, [formData]);

  const { user } = useAuth();

  const router = useRouter();

  const { data: categories, loading: loadingCategories } = usePromise(getBooksCategories);

  const createBookFunc = async () => {
    if (
      await validateSchemas({
        validationSchemas: {
          // 1 - Information
          title: 'Enter book title.',
          type: 'Select book type.',
          category_id: 'Select book category.',
          description: 'Enter book description.',
          resume: 'Enter book resume.',

          // 2 - Presentation
          cover_url: 'Select your book cover image.',
          ...(editing ? {} : { ebook_file: 'Fill in your book file.' }),

          // 3 - Additionnal
          authors: 'Add book authors.',
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
          genre: 'Indicate book genre.',
          language: 'Indicate book language.',
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
          await editBookEdition({
            book_id: form.data.book_id,
            edition_id: form.data.id,

            cover_url: form.data.cover_url,

            publisher_id: user.publisher_id,
            publisher_name: user.publisher_name ?? user.web3_account_name,
            publisher_address: user.web3_account_address,

            categories,

            onSuccess: ({ id }) => {
              router.push(`/books/view/${id}`);
            },
            onError: (e) => {
              form.setSubmitting(false);

              form.setSubmitError(e?.message ?? 'An error occured while editing the book.');
            },

            ...{ ...form.data, is_free: `${form.data.is_free ?? true}` === 'true' },
          });
        } else {
          await addAndPublishNewBookEdition({
            book_file: form.data.ebook_file,
            book_file_name: form.data.ebook_file.name,
            book_file_extension: form.data.ebook_file.name.split('.').pop(),

            cover_url: form.data.cover_url,

            publisher_id: user.publisher_id,
            publisher_name: user.publisher_name ?? user.web3_account_name,
            publisher_address: user.web3_account_address,

            categories,

            onSuccess: ({ id }) => {
              router.push(`/books/view/${id}`);
            },
            onError: (e) => {
              form.setSubmitting(false);

              form.setSubmitError(e?.message ?? 'An error occured while adding the book.');
            },

            ...{ ...form.data, is_free: `${form.data.is_free ?? true}` === 'true' },
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
      <Typography variant="h4">{editing ? 'Edit book' : 'Add new book'}</Typography>
      <Divider color="primary" />
      <br />
      {loadingCategories ? (
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
                name="title"
                label="Title"
                required
                helperText={form.validationErrors.title}
                error={!!form.validationErrors.title}
                onChange={(e) => form.setFieldValue('title', e.target.value)}
                value={form.data.title}
                focused
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="isbn"
                label="ISBN"
                helperText={form.validationErrors.isbn}
                error={!!form.validationErrors.isbn}
                onChange={(e) => form.setFieldValue('isbn', e.target.value)}
                value={form.data.isbn}
                focused
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormSelect
                onChange={(value) => {
                  form.setFieldValue('type', value);
                }}
                label="Type *"
                name="type"
                items={bookTypes}
                error={form.validationErrors.type}
                helperText={form.validationErrors.type}
                defaultValue={form.data.type}
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

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                required
                helperText={form.validationErrors.description}
                error={!!form.validationErrors.description}
                onChange={(e) => form.setFieldValue('description', e.target.value)}
                value={form.data.description}
                multiline
                rows={3}
                focused
                size="medium"
                fullWidth
                minRows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="resume"
                label="Resume"
                required
                helperText={form.validationErrors.resume}
                error={!!form.validationErrors.resume}
                onChange={(e) => form.setFieldValue('resume', e.target.value)}
                value={form.data.resume}
                focused
                size="large"
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
                label="Book Cover Image"
                hint="Book Cover Image"
                name="cover_url"
                value={form.data.cover_url}
                setValue={(value) => form.setFieldValue('cover_url', value)}
                required
                acceptedFileTypes={['image/*']}
                uploadBasePath={`developers/${user.web3_account_id}/books/covers`}
              />
              <Typography color="error">{form.validationErrors.cover_url}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              {editing || (
                <FilePond
                  files={form.data.ebook_file ? [form.data.ebook_file] : []}
                  onremovefile={() => {
                    form.setFieldValue('ebook_file', null);
                  }}
                  onaddfilestart={({ file }) => {
                    if (
                      file &&
                      file.type &&
                      (file.type === 'application/pdf' || file.type === 'application/epub+zip')
                    ) {
                      /* empty */
                    } else {
                      throw new Error('Select a valid ebook document file.');
                    }
                  }}
                  onupdatefiles={(files) => {
                    const file = files?.[0]?.file;

                    if (file) {
                      if (
                        file.type &&
                        (file.type === 'application/pdf' || file.type === 'application/epub+zip')
                      ) {
                        form.setFieldValue('ebook_file', file);
                      } else {
                        form.setFieldError('ebook_file', 'Select a valid ebook document file.');
                      }
                    }
                  }}
                  allowMultiple={false}
                  maxFiles={1}
                  required
                  acceptedFileTypes={['application/pdf', 'application/epub+zip']}
                  name="ebook_file"
                  labelIdle="Ebook Document File"
                />
              )}
              <Typography color="error">{form.validationErrors.ebook_file}</Typography>
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
              <TextField
                name="authors"
                label="Authors"
                required
                helperText={form.validationErrors.authors}
                error={!!form.validationErrors.authors}
                onChange={(e) => form.setFieldValue('authors', e.target.value)}
                value={form.data.authors}
                focused
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
                  size="small"
                  fullWidth
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <FormSelect
                onChange={(value) => {
                  form.setFieldValue('language', value);
                }}
                label="Language *"
                name="language"
                items={bookLanguages}
                error={form.validationErrors.language}
                helperText={form.validationErrors.language}
                defaultValue={form.data.language}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormSelect
                onChange={(value) => {
                  form.setFieldValue('genre', value);
                }}
                label="Genre *"
                name="genre"
                items={bookGenres}
                error={form.validationErrors.genre}
                helperText={form.validationErrors.genre}
                defaultValue={form.data.genre}
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
        onClick={createBookFunc}
      >
        {editing ? 'Update Book' : 'Add new book'}
      </LoadingButton>
    </Container>
  );
}

CreateNewEditBook.propTypes = {
  formData: PropTypes.object,
};
