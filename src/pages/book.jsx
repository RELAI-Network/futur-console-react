import { Helmet } from 'react-helmet-async';

import { BookView } from 'src/sections/books/view';

// ----------------------------------------------------------------------

export default function BookPage() {
  return (
    <>
      <Helmet>
        <title> Book Details | Futur Store Console </title>
      </Helmet>

      <BookView />
    </>
  );
}
