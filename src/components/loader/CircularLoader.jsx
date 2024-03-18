import React from 'react';
import PropTypes from 'prop-types';

import { Typography, CircularProgress } from '@mui/material';

import Div from '../commons/Div';

const CircularLoader = ({ loadingTextPlaceholder }) => (
  <Div
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: (theme) => theme.spacing(3),
      m: 'auto',
    }}
  >
    <CircularProgress />
    {loadingTextPlaceholder && (
      <Typography variant="h6" color="text.secondary" mt={2}>
        {loadingTextPlaceholder}
      </Typography>
    )}
  </Div>
);

CircularLoader.propTypes = {
  loadingTextPlaceholder: PropTypes.oneOf([PropTypes.string, PropTypes.any]),
};

export default CircularLoader;
