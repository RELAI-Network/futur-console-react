import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from '../layouts/dashboard';
import PublishersProtectedLayout from '../layouts/protected/publishers';

export const AccountPage = lazy(() => import('src/pages/account'));

export const IndexPage = lazy(() => import('src/pages/home'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ForgotPasswordPage = lazy(() => import('src/pages/forgot-password'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      element: (
        <PublishersProtectedLayout>
          <DashboardLayout>
            <Suspense>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </PublishersProtectedLayout>
      ),
      children: [
        { element: <IndexPage />, index: true },
        { element: <AccountPage />, path: 'account' },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'sign-up',
      element: <SignUpPage />,
    },
    {
      path: 'forgot-password',
      element: <ForgotPasswordPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
