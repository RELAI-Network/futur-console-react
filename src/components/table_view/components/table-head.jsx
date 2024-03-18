import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableSortLabel from '@mui/material/TableSortLabel';

import { visuallyHidden } from '../functions/utils';

// ----------------------------------------------------------------------

export default function CustomTableHead({
  order,
  orderBy,
  rowCount,
  headers,
  numSelected,
  onRequestSort,
  onSelectAllClick,
}) {
  const onSort = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>

        {[...headers, { attribute: '' }].map((headCell) => (
          <TableCell
            key={headCell.attribute}
            align={headCell.textAlign || 'left'}
            sortDirection={orderBy === headCell.attribute ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.attribute}
              direction={orderBy === headCell.attribute ? order : 'asc'}
              onClick={onSort(headCell.attribute)}
            >
              {headCell.label}
              {orderBy === headCell.attribute ? (
                <Box sx={{ ...visuallyHidden }}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export const HeaderField = PropTypes.shape({
  attribute: PropTypes.string,
  label: PropTypes.string,
  textAlign: PropTypes.string,
});

CustomTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  rowCount: PropTypes.number,
  headers: PropTypes.arrayOf(HeaderField),
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func,
  onSelectAllClick: PropTypes.func,
};
