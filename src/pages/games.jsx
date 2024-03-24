import { Helmet } from 'react-helmet-async';

import { GamesView } from 'src/sections/games/view';

// ----------------------------------------------------------------------

export default function GamesPage() {
  return (
    <>
      <Helmet>
        <title> Games | Futur Store Console </title>
      </Helmet>

      <GamesView />
    </>
  );
}
