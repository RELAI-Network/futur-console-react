import { Helmet } from 'react-helmet-async';

import { CreateGameView } from 'src/sections/games/view';

// ----------------------------------------------------------------------

export default function CreateAppPage() {
  return (
    <>
      <Helmet>
        <title> Create game | Futur Store Console </title>
      </Helmet>

      <CreateGameView />
    </>
  );
}
