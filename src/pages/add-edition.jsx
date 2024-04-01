import { Helmet } from 'react-helmet-async';

import { AddNewEditionView } from 'src/sections/books/view';

// ----------------------------------------------------------------------

export default function AddNewEditionPage() {
  return (
    <>
      <Helmet>
        <title> Create new release | Futur Store Console </title>
      </Helmet>

      <AddNewEditionView />
    </>
  );
}
