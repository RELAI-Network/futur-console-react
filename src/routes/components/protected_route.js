import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../../hooks/use_auth';

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // user is not authenticated
    return <Navigate to="/login" />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};
