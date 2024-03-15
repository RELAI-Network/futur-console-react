/* eslint-disable */

import React from 'react';

import Div from '../commons/Div';
import { Typography } from '@mui/material';

const CenteredText = ({
  content,
  text,
  primary = false,
  variant = 'h6',
  color = 'text.secondary',
  // backgroundColor = "background.paper",
  padding = 3,
  marginTop = 2,
  backgroundColor,
  fontSize,
  fontStyle,
  fontWeight,
}) => (
  <Div
    sx={{
      backgroundColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: (theme) => theme.spacing(padding),
      m: 'auto',
    }}
  >
    {content || (
      <Typography
        fontStyle={fontStyle}
        fontWeight={fontWeight}
        fontSize={fontSize}
        variant={primary ? 'text.primary' : variant}
        color={color}
        mt={marginTop}
      >
        {text}
      </Typography>
    )}
  </Div>
);

export default CenteredText;
