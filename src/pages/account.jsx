import { Helmet } from 'react-helmet-async';

import { AccountView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title> Account | Future Store Console</title>
      </Helmet>

    <AccountView />
    </>
  );
}
