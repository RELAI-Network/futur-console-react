/* eslint-disable */

export const range = (start, stop, step = 1) =>
    Array.from({length: (stop - start) / step + 1}, (_, i) => start + i * step);

export const paginate = (items = [], perPage, page) => {
    return items
        ? items.length > perPage
            ? items.slice(perPage * (page - 1), page * perPage)
            : items
        : [];
};
