import { Helmet } from 'react-helmet-async';

import { AppView } from 'src/sections/apps/view/';

// ----------------------------------------------------------------------

export default function AppPage() {
  return (
    <>
      <Helmet>
        <title> Application | Console Futur Store </title>
      </Helmet>

      <AppView />
    </>
  );
}
