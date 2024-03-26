import { useMemo, useState } from 'react';

import { paginate } from 'src/utils/functions/collections';

function usePagination({ items = [], itemsPerPage = 6, defaultPage = 1 }) {
  const [page, setPage] = useState(defaultPage);

  const handlePageChange = (value) => {
    setPage(value);
  };

  const paginatedItems = useMemo(
    () => paginate(items, itemsPerPage, page),
    [items, itemsPerPage, page]
  );

  return {
    handlePageChange,
    page,
    items: paginatedItems,
  };
}

export default usePagination;
