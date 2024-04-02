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
import FormSelect from 'src/components/form/select';
import CircularLoader from 'src/components/loader/CircularLoader';

import { bookLanguages } from '../constants';
import { getPublisherBook, addAndPublishNewBook } from '../services/firestore';
// ----------------------------------------------------------------------

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);
export default function AddNewReleaseView() {
  const form = useFormValidation({});

  const { user } = useAuth();

  const { id: bookId } = useParams();

  const router = useRouter();

  const { data: book, loading: bookLoading } = usePromise(() => getPublisherBook({ bookId }));

  const onUploadProgress = (progress) => {
    form.setFieldValue('file_upload_progress', progress);
  };

  const addNewEditionFunc = async () => {
    if (
      await validateSchemas({
        validationSchemas: {
          title: 'Enter edition title.',
          authors: 'Add edition authors.',

          cover_image: 'Choose edition cover image.',
          ebook_file: 'Choose ebook document file.',

          language: 'Indicate edition language.',
          description: 'Enter edition description.',
          resume: 'Enter edition resume.',
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
        await addAndPublishNewBook({
          publisher_id: user.publisher_id,
          publisher_name: user.publisher_name,

          title: form.data.title,
          authors: form.data.authors,
          language: form.data.language,
          description: form.data.description,
          resume: form.data.resume,

          book_file: form.data.ebook_file,
          book_file_name: form.data.ebook_file.name,
          book_file_extension: form.data.ebook_file.name.split('.').pop(),
          book_cover_file: form.data.cover_image,
          book_cover_file_name: form.data.cover_image.name,

          onUploadProgress,

          onSuccess: ({ id }) => {
            router.push(`/books/view/${id}`);
          },
          onError: (e) => {
            form.setSubmitting(false);

            form.setSubmitError(
              e?.message ?? 'An error occured while publishing this book edition.'
            );
          },

          category: book.category,
          genre: book.genre,
          isbn: book.isbn,
          price: book.price,
          type: book.type,
        });
      } catch (e) {
        form.setSubmitError(e?.message ?? 'An error occured while publishing this book edition.');

        form.setSubmitting(false);
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
          onClick={() => router.push(`/books/view/${bookId}`)}
          cursor="pointer"
        />
        <Typography variant="h4">Add new edition</Typography>
      </Stack>
      <Divider color="primary" />
      <br />
      {bookLoading ? (
        <CircularLoader />
      ) : (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="title"
                label="Title"
                required
                helperText={form.validationErrors.title}
                error={!!form.validationErrors.title}
                onChange={(e) => form.setFieldValue('title', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="authors"
                label="Authors"
                required
                helperText={form.validationErrors.authors}
                error={!!form.validationErrors.authors}
                onChange={(e) => form.setFieldValue('authors', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FilePond
                label="Book Cover Image"
                files={form.data.cover_image ? [form.data.cover_image] : []}
                onaddfilestart={({ file }) => {
                  if (file && file.type && file.type.startsWith('image/')) {
                    /* empty */
                  } else {
                    throw new Error('Select a valid image');
                  }
                }}
                onupdatefiles={(files) => {
                  const file = files?.[0]?.file;

                  if (file && file.type && file.type.startsWith('image/')) {
                    form.setFieldValue('cover_image', file);
                  } else {
                    form.setFieldError('cover_image', 'Select a valid image');
                  }
                }}
                allowMultiple={false}
                maxFiles={1}
                required
                acceptedFileTypes={['image/*']}
                name="cover_image"
                labelIdle="Book Cover Image"
              />
              <Typography color="error">{form.validationErrors.cover_image}</Typography>
            </Grid>
            <Typography color="error">
              {form.validationErrors.ebook_file ?? form.validationErrors.package_file_info}
            </Typography>
            <Grid item xs={12} md={6}>
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
              <Typography color="error">{form.validationErrors.ebook_file}</Typography>
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
            <Grid item xs={6}>
              <TextField
                name="description"
                label="Description"
                required
                helperText={form.validationErrors.description}
                error={!!form.validationErrors.description}
                onChange={(e) => form.setFieldValue('description', e.target.value)}
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
                size="large"
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
        form.data.file_upload_progress ? (
          form.data.file_upload_progress === 100 ? (
            <Typography align="center">Finalizing...</Typography>
          ) : (
            <Stack>
              <LinearProgress
                variant="determinate"
                color="primary"
                value={form.data.file_upload_progress}
                sx={{
                  height: 6,
                  borderRadius: 2,
                  backgroundColor: '#E9EEEF',
                  mb: 1,
                }}
              />
              <Typography align="center">Uploading ebook file...</Typography>
            </Stack>
          )
        ) : (
          <Typography align="center">Processing ebook file pre-analysis...</Typography>
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
        onClick={addNewEditionFunc}
      >
        Add new edition
      </LoadingButton>
    </Container>
  );
}
