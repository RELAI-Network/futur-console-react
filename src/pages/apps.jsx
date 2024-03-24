import { Helmet } from 'react-helmet-async';

import { AppsView } from 'src/sections/apps/view';

// ----------------------------------------------------------------------

export default function AppsPage() {
  return (
    <>
      <Helmet>
        <title> Applications | Futur Store Console </title>
      </Helmet>

      <AppsView />
    </>
  );
}
