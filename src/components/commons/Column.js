/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';

import Div from './Div';

export const Column = (props) => (
  <Div
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: props.alignItems,
      flexWrap: props.flexWrap,
      justifyContent: props.justifyContent,
      ...props.sx,
    }}
  >
    {props.children}
  </Div>
);

Column.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node),
  alignItems: PropTypes.string,
  flexWrap: PropTypes.string,
  justifyContent: PropTypes.string,
  sx: PropTypes.object,
};

Column.defaultProps = {
  children: [],
  alignItems: 'column',
  flexWrap: 'column',
  justifyContent: 'center',
  sx: {},
};
