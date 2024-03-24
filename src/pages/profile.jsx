import { Helmet } from 'react-helmet-async';

import ProfileView from 'src/sections/profile/views/profile-view';

// ----------------------------------------------------------------------

export default function ProfilePage() {
  return (
    <>
      <Helmet>
        <title> Profile | Console Futur Store </title>
      </Helmet>

      <ProfileView />
    </>
  );
}
