import { Helmet } from 'react-helmet-async';

import { EditBookView } from 'src/sections/books/view';

// ----------------------------------------------------------------------

export default function EditBookPage() {
  return (
    <>
      <Helmet>
        <title> Edit book | Futur Store Console </title>
      </Helmet>

      <EditBookView />
    </>
  );
}
