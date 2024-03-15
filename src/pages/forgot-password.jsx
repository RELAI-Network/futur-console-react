import { Helmet } from 'react-helmet-async';

import { ForgotPasswordView } from '../sections/forgot-password';

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Reset my password </title>
      </Helmet>

      <ForgotPasswordView />
    </>
  );
}
