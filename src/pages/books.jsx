import { Helmet } from 'react-helmet-async';

import { BooksView } from 'src/sections/books/view';

// ----------------------------------------------------------------------

export default function BooksPage() {
  return (
    <>
      <Helmet>
        <title> Books | Futur Store Console </title>
      </Helmet>

      <BooksView />
    </>
  );
}
