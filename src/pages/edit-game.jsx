import { Helmet } from 'react-helmet-async';

import { EditGameView } from 'src/sections/games/view';

// ----------------------------------------------------------------------

export default function EditGamePage() {
  return (
    <>
      <Helmet>
        <title> Edit Game | Futur Store Console </title>
      </Helmet>

      <EditGameView />
    </>
  );
}
