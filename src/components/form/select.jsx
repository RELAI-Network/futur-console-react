/* eslint-disable react/prop-types */
import React from 'react';

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { Select, InputLabel, FormHelperText } from '@mui/material';

const FormSelect = ({
  items = [],
  name,
  variant = 'outlined',
  defaultValue = '',
  size = 'small',
  id,
  label = '',
  itemValueBuilder = (item) => item.value,
  itemLabelBuilder = (item) => item.label,
  onChange,
  error = false,
  helperText = '',
  sx = { m: 0 },
  multiple = false,
  focused = true,
  disabled = false,
  ...props
}) => (
  <FormControl
    margin="normal"
    variant={variant}
    fullWidth
    sx={sx}
    size={size}
    focused={focused}
    {...props}
  >
    <InputLabel id={id}>{label}</InputLabel>
    <Select
      disabled={disabled}
      multiple={multiple}
      error={error}
      labelId={id}
      id={id ?? name}
      name={name}
      label={label}
      value={defaultValue}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      {...props}
      MenuProps={{
        PaperProps: {
          sx: {
            backgroundColor: 'white',
            // color: "red"
          },
        },
      }}
    >
      {items.map((item) => (
        <MenuItem
          sx={{
            backgroundColor: 'white',
          }}
          key={`${name ?? id}-${itemValueBuilder(item)}`}
          value={itemValueBuilder(item)}
        >
          {itemLabelBuilder(item)}
        </MenuItem>
      ))}
    </Select>
    <FormHelperText error={error}>{helperText}</FormHelperText>
  </FormControl>
);

export default FormSelect;
