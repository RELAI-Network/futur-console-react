import { Helmet } from 'react-helmet-async';

import { PublisherHomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

export default function PublisherHomePage() {
  return (
    <>
      <Helmet>
        <title> Console | Futur Store </title>
      </Helmet>

      <PublisherHomeView />
    </>
  );
}
