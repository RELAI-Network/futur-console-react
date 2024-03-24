import { Helmet } from 'react-helmet-async';

import { SignUpView } from 'src/sections/sign-up';

// ----------------------------------------------------------------------

export default function SignUp() {
  return (
    <>
      <Helmet>
        <title> Sign Up | Futur Store </title>
      </Helmet>

      <SignUpView />
    </>
  );
}
