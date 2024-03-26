import { Navigate } from 'react-router-dom';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/hooks/use_auth';

const ConnectedProtectedLayout = () => {
  const { user, status } = useAuth();

  if (status === 'idle' || status === 'pending') {
    return (
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Navigate to={`/${user.role}`} />;
};

export default ConnectedProtectedLayout;
