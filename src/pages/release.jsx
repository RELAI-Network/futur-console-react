import { Helmet } from 'react-helmet-async';

import { ReleaseView } from 'src/sections/apps/view/';

// ----------------------------------------------------------------------

export default function ReleasePage() {
  return (
    <>
      <Helmet>
        <title> Release | Console Futur Store </title>
      </Helmet>

      <ReleaseView />
    </>
  );
}
