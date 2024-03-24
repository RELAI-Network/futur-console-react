import { Helmet } from 'react-helmet-async';

import { CreateAppView } from 'src/sections/apps/view';

// ----------------------------------------------------------------------

export default function CreateAppPage() {
  return (
    <>
      <Helmet>
        <title> Create application | Futur Store Console </title>
      </Helmet>

      <CreateAppView />
    </>
  );
}
