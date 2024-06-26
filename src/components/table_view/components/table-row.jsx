import { useState } from 'react';
import PropTypes from 'prop-types';

import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CustomTableRow({ selected, fields, value, handleClick, onClick, onEdit }) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    event.stopPropagation();

    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  return (
    <>
      <TableRow
        sx={{
          cursor: onClick ? 'pointer' : null,
          ':hover': onClick ? { backgroundColor: 'green' } : null,
        }}
        hover
        tabIndex={-1}
        role="checkbox"
        selected={selected}
        onClick={onClick}
      >
        <TableCell padding="checkbox">
          <Checkbox
            disableRipple
            onClick={(event) => event.stopPropagation()}
            checked={selected}
            onChange={handleClick}
          />
        </TableCell>

        {fields.map((item, index) =>
          item.builder ? (
            item.builder(value[item.attribute], value, index)
          ) : (
            <TableCell align={item.textAlign}>{value[item.attribute]}</TableCell>
          )
        )}

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onEdit();
          }}
        >
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

export const RowField = PropTypes.shape({
  attribute: PropTypes.string,
  builder: PropTypes.oneOf([PropTypes.any, PropTypes.func]),
  textAlign: PropTypes.string,
});

CustomTableRow.propTypes = {
  fields: PropTypes.arrayOf(RowField),
  value: PropTypes.any,
  handleClick: PropTypes.func,
  onClick: PropTypes.func,
  onEdit: PropTypes.func,
  selected: PropTypes.any,
};
