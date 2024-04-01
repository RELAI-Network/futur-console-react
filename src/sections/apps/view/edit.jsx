import { useParams } from 'react-router-dom';

import usePromise from 'src/hooks/use_promise';

import CircularLoader from 'src/components/loader/CircularLoader';

import CreateNewApp from './create';
import { getDeveloperApplication } from '../services/firestore';

export default function EditApplicationView() {
  const { id: applicationId } = useParams();

  const { data: application, loading } = usePromise(() =>
    getDeveloperApplication({ applicationId })
  );

  return loading ? <CircularLoader /> : <CreateNewApp formData={application} />;
}
