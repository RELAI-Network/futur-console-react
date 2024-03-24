import { Helmet } from 'react-helmet-async';

import MonetizationView from 'src/sections/monetization/views/monetization-view';

// ----------------------------------------------------------------------

export default function MonetizationPage() {
  return (
    <>
      <Helmet>
        <title> Monetization | Console Futur Store </title>
      </Helmet>

      <MonetizationView />
    </>
  );
}
