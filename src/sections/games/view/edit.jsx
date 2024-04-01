import { useParams } from 'react-router-dom';

import usePromise from 'src/hooks/use_promise';

import CircularLoader from 'src/components/loader/CircularLoader';

import CreateNewGame from './create';
import { getDeveloperGame } from '../services/firestore';

export default function EditGameView() {
  const { id: applicationId } = useParams();

  const { data: game, loading } = usePromise(() => getDeveloperGame({ applicationId }));

  return loading ? <CircularLoader /> : <CreateNewGame formData={game} />;
}
