import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from '../layouts/dashboard';
import PublishersProtectedLayout from '../layouts/protected/publishers';

export const AccountPage = lazy(() => import('src/pages/account'));
export const AppsPage = lazy(() => import('src/pages/apps'));
export const CreateAppPage = lazy(() => import('src/pages/create-app'));

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
        { element: <AppsPage />, path: 'apps' },
        { element: <CreateAppPage />, path: 'apps/create' },
      ],
    },
    {
      element: (
        <PublishersProtectedLayout>
            <Suspense>
              <Outlet />
            </Suspense>
        </PublishersProtectedLayout>
      ),
      children: [
        { element: <LoginPage />, path: 'login' },
        { element: <SignUpPage />, path: 'sign-up' },
        { element: <ForgotPasswordPage />, path: 'forgot-password' },
      ],
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
