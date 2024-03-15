/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';

import Div from './Div';

export const Row = (props) => (
  <Div
    sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: props.alignItems,
      flexWrap: props.flexWrap,
      justifyContent: props.justifyContent,
      ...props.sx,
    }}
  >
    {props.children}
  </Div>
);

Row.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node),
  alignItems: PropTypes.string,
  flexWrap: PropTypes.string,
  justifyContent: PropTypes.string,
  sx: PropTypes.object,
};

Row.defaultProps = {
  children: [],
  alignItems: 'row',
  flexWrap: 'row',
  justifyContent: 'center',
  sx: {},
};
