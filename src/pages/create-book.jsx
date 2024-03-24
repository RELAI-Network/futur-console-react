import { Helmet } from 'react-helmet-async';

import { CreateBookView } from 'src/sections/books/view';

// ----------------------------------------------------------------------

export default function CreateBookPage() {
  return (
    <>
      <Helmet>
        <title> Create book | Futur Store Console </title>
      </Helmet>

      <CreateBookView />
    </>
  );
}
