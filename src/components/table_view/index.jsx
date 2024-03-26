import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from './components/table-no-data';
import TableToolbar from './components/table-toolbar';
import TableEmptyRows from './components/table-empty-rows';
import TableRow, { RowField } from './components/table-row';
import TableHead, { HeaderField } from './components/table-head';
import { emptyRows, applyFilter, getComparator } from './functions/utils';

// ----------------------------------------------------------------------

export default function Tableview({
  items = [],
  headers = [],
  fields = [],
  identifier = 'id',
  title = '',
  addNewBtnLabel = 'Add',
  showHeader = true,
  showSearchAndFilter = true,
  onClickRow,
}) {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('label');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = items.map((n) => n[identifier]);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: items,
        comparator: getComparator(order, orderBy),
        // filterField,
        // filterFieldAttribute,
      }),
    [items, order, orderBy]
  );

  const notFound = useMemo(() => !dataFiltered.length && !!filterName, [dataFiltered, filterName]);

  return (
    <Box sx={{ margin: 0, padding: 0 }}>
      {showHeader && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">{title}</Typography>

          <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />}>
            {addNewBtnLabel}
          </Button>
        </Stack>
      )}

      <Card sx={{ margin: 0, padding: 0 }}>
        {showSearchAndFilter && (
          <TableToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
          />
        )}

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead
                order={order}
                orderBy={orderBy}
                rowCount={items.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headers={headers}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow
                      key={row[identifier]}
                      fields={fields}
                      value={row}
                      identifier={identifier}
                      selected={selected.indexOf(row[identifier]) !== -1}
                      handleClick={(event) => handleClick(event, row[identifier])}
                      onClick={onClickRow ? () => onClickRow(row[identifier], row) : null}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, items.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={items.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
}

Tableview.propTypes = {
  items: PropTypes.array,
  fields: PropTypes.arrayOf(RowField),
  identifier: PropTypes.string,
  title: PropTypes.string,
  addNewBtnLabel: PropTypes.string,
  headers: PropTypes.arrayOf(HeaderField),
  showHeader: PropTypes.bool,
  showSearchAndFilter: PropTypes.bool,
  onClickRow: PropTypes.func,
};
