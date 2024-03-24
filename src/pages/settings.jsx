import { Helmet } from 'react-helmet-async';

import SettingsView from 'src/sections/settings/views/settings-view';

// ----------------------------------------------------------------------

export default function SettingsPage() {
  return (
    <>
      <Helmet>
        <title> Settings | Console Futur Store </title>
      </Helmet>

      <SettingsView />
    </>
  );
}
