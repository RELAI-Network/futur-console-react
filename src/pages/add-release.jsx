import { Helmet } from 'react-helmet-async';

import { AddNewReleaseView } from 'src/sections/apps/view';

// ----------------------------------------------------------------------

export default function AddNewReleasePage() {
  return (
    <>
      <Helmet>
        <title> Create new release | Futur Store Console </title>
        <script src="/scripts/app-info-parser.js" type="text/javascript" />
      </Helmet>

      <AddNewReleaseView />
    </>
  );
}
