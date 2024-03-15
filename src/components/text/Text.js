/* eslint-disable */

import React from 'react';

import { Typography } from '@mui/material';

const Text = ({
  mt = 2,
  text,
  primary = false,
  variant = 'h6',
  color = 'text.secondary',
  fontSize,
  fontStyle,
  fontWeight,
  ...props
}) => (
  <Typography
    fontStyle={fontStyle}
    fontWeight={fontWeight}
    fontSize={fontSize}
    variant={primary ? 'text.primary' : variant}
    color={color}
    mt={mt}
    {...props}
  >
    {text}
  </Typography>
);

export default Text;
