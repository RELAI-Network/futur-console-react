import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/hooks/use_auth';

import AccountPage from 'src/pages/account';
import DashboardNoActionsLayout from 'src/layouts/dashboard/dashboard-no-actions';

const DevelopersProtectedLayout = ({ children }) => {
  const { user, status } = useAuth();

  if (status === 'idle' || status === 'pending') {
    return (
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (!user || user.role !== 'developer') {
    return <Navigate to="/login" />;
  }

  if (user?.paidDeveloperFee ?? false) {
    return <>{children}</>;
  }

  return (
    <DashboardNoActionsLayout>
      <AccountPage />
    </DashboardNoActionsLayout>
  );
};

DevelopersProtectedLayout.propTypes = {
  children: PropTypes.node,
};

export default DevelopersProtectedLayout;
