import { useParams } from 'react-router-dom';

import usePromise from 'src/hooks/use_promise';

import CircularLoader from 'src/components/loader/CircularLoader';

import CreateNewEditBook from './create';
import { getPublisherBook } from '../services/firestore';

export default function EditBook() {
  const { id: bookId } = useParams();

  const { data: book, loading: bookLoaading } = usePromise(() => getPublisherBook({ bookId }));

  return bookLoaading ? <CircularLoader /> : <CreateNewEditBook formData={book} />;
}
