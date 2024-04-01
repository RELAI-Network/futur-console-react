import { Helmet } from 'react-helmet-async';

import { EditApplicationView } from 'src/sections/apps/view';

// ----------------------------------------------------------------------

export default function EditAppPage() {
  return (
    <>
      <Helmet>
        <title> Edit App | Futur Store Console </title>
      </Helmet>

      <EditApplicationView />
    </>
  );
}
