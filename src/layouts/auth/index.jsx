import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/hooks/use_auth';


const PublicLayout = ({ children }) => {
  const { user, status } = useAuth();

  if (status === 'idle' || status === 'pending') {
    return (
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (user && user.isActive) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

PublicLayout.propTypes = {
  children: PropTypes.node,
};

export default PublicLayout;
