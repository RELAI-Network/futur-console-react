import { Helmet } from 'react-helmet-async';

import { GameView } from 'src/sections/games/view/';

// ----------------------------------------------------------------------

export default function AppPage() {
  return (
    <>
      <Helmet>
        <title> Game | Console Futur Store </title>
      </Helmet>

      <GameView />
    </>
  );
}
