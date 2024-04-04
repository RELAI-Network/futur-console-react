import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import FormSelect from 'src/components/form/select';

import { useAuth } from '../../hooks/use_auth';
import { validateSchemas } from '../../utils/forms/validator';
import { registerNewUser } from '../../services/firebase/firestore/auth';
import { useFormValidation } from '../../utils/forms/hooks/useFormValidation';

// ----------------------------------------------------------------------

export default function SignUpView() {
  const theme = useTheme();

  const { login, logout } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const form = useFormValidation({ initialData: { role: 'developer' } });

  const handleClick = async () => {
    if (
      await validateSchemas({
        validationSchemas: {
          name: 'Enter valid name.',
          email: 'Enter valid email.',
          password: 'Enter valid password.',
          website: 'Enter valid website.',
        },
        setFieldError: form.setFieldError,
        stopValidationOnFirstError: true,
        values: form.data,
      })
    ) {
      form.setSubmitting(true);

      registerNewUser({
        formData: form.data,
        onError: (errorMessage) => {
          form.setSubmitError(errorMessage);
        },
        onSuccess: ({ user, userDocId, credential }) => {
          login(user);
        },
        onLogOut: logout,
      }).finally(() => {
        form.setSubmitting(false);
      });
    } else {
      form.setSubmitError('Enter valid informations.');
    }
  };

  const renderForm = (
    <>
      <Stack spacing={3}>
        <FormSelect
          onChange={(value) => {
            form.setFieldValue('role', value);
          }}
          label="Account Type *"
          name="role"
          items={[
            {
              label: 'Developer',
              value: 'developer',
            },
            {
              label: 'Publisher',
              value: 'publisher',
            },
          ]}
          error={form.validationErrors.role}
          helperText={form.validationErrors.role}
          defaultValue={form.data.role}
        />
        <TextField
          name="name"
          label="Name"
          required
          helperText={form.validationErrors.name}
          error={!!form.validationErrors.name}
          onChange={(e) => form.setFieldValue('name', e.target.value)}
        />

        <TextField
          name="email"
          label="Email address"
          required
          helperText={form.validationErrors.email}
          error={!!form.validationErrors.email}
          onChange={(e) => form.setFieldValue('email', e.target.value)}
        />

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          helperText={form.validationErrors.password}
          error={!!form.validationErrors.password}
          onChange={(e) => form.setFieldValue('password', e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          name="website"
          label="Website or Social"
          required
          helperText={form.validationErrors.website}
          error={!!form.validationErrors.website}
          onChange={(e) => form.setFieldValue('website', e.target.value)}
        />
      </Stack>
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
        onClick={handleClick}
      >
        Register
      </LoadingButton>
    </>
  );
  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 700,

        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        overflowY: 'scroll',
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4">Create your developer/publisher account</Typography>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
            You have an account?
            <Link href="/login" variant="subtitle2" sx={{ ml: 0.5 }}>
              Login
            </Link>
          </Typography>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
