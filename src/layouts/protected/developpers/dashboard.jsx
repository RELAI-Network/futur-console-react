import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import Nav from 'src/layouts/dashboard/nav';
import Main from 'src/layouts/dashboard/main';
import Header from 'src/layouts/dashboard/header';

import navConfig from './config-navigation';

// ----------------------------------------------------------------------

export default function DevelopersDashboardLayout({ children }) {
  const [openNav, setOpenNav] = useState(false);

  return (
    <>
      <Header onOpenNav={() => setOpenNav(true)} />

      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Nav navConfig={navConfig} openNav={openNav} onCloseNav={() => setOpenNav(false)} />

        <Main>{children}</Main>
      </Box>
    </>
  );
}

DevelopersDashboardLayout.propTypes = {
  children: PropTypes.node,
};
