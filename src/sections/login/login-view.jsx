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

import { useAuth } from '../../hooks/use_auth';
import { validateSchemas } from '../../utils/forms/validator';
import { signInUser } from '../../services/firebase/firestore/auth';
import { useFormValidation } from '../../utils/forms/hooks/useFormValidation';

// ----------------------------------------------------------------------

export default function LoginView() {
  const theme = useTheme();

  const { login, logout } = useAuth();

  const form = useFormValidation({});

  const [showPassword, setShowPassword] = useState(false);

  const handleClick = async () => {
    if (
      await validateSchemas({
        validationSchemas: {
          email: 'Enter valid email.',
          password: 'Enter valid password.',
        },
        setFieldError: form.setFieldError,
        stopValidationOnFirstError: true,
        values: form.data,
      })
    ) {
      form.setSubmitting(true);

      signInUser({
        formData: form.data,
        onError: (errorMessage) => {
          form.setSubmitError(errorMessage);
        },
        onSuccess: ({ user, userDocId, credential, errorMessage }) => {
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
          required
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
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}>
        <Link href="/forgot-password" variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack>
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
        Login
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
        height: 1,
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
            <Typography variant="h4">Sign in to Futur Console</Typography>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
            Don’t have an account?
            <Link href="/sign-up" variant="subtitle2" sx={{ ml: 0.5 }}>
              Get started
            </Link>
          </Typography>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
