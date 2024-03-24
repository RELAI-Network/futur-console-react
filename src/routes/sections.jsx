import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import PublicLayout from 'src/layouts/auth';

import DashboardLayout from '../layouts/dashboard';
import PublishersProtectedLayout from '../layouts/protected/publishers';

export const IndexPage = lazy(() => import('src/pages/home'));
export const AccountPage = lazy(() => import('src/pages/account'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const MonetizationPage = lazy(() => import('src/pages/monetization'));
export const SettingsPage = lazy(() => import('src/pages/settings'));

export const AppsPage = lazy(() => import('src/pages/apps'));
export const AppPage = lazy(() => import('src/pages/app'));
export const CreateAppPage = lazy(() => import('src/pages/create-app'));

export const GamesPage = lazy(() => import('src/pages/games'));
export const GamePage = lazy(() => import('src/pages/game'));
export const CreateGamePage = lazy(() => import('src/pages/create-game'));

export const BooksPage = lazy(() => import('src/pages/books'));
export const CreateBookPage = lazy(() => import('src/pages/create-book'));

export const AddNewReleasePage = lazy(() => import('src/pages/add-release'));
export const ReleasePage = lazy(() => import('src/pages/release'));

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
        { element: <ProfilePage />, path: 'profile' },
        { element: <MonetizationPage />, path: 'monetization' },
        { element: <SettingsPage />, path: 'settings' },

        { element: <AppsPage />, path: 'apps' },
        { element: <AppPage />, path: 'apps/view/:id' },
        { element: <CreateAppPage />, path: 'apps/create' },

        { element: <GamesPage />, path: 'games' },
        { element: <GamePage />, path: 'games/view/:id' },
        { element: <CreateGamePage />, path: 'games/create' },
        
        
        { element: <BooksPage />, path: 'books' },
        { element: <CreateBookPage />, path: 'books/create' },

        { element: <AddNewReleasePage />, path: 'apps/view/:id/add-release' },
        { element: <AddNewReleasePage />, path: 'games/view/:id/add-release' },
        { element: <ReleasePage />, path: '/games/view/:application_id/release/:id' },
        { element: <ReleasePage />, path: '/apps/view/:application_id/release/:id' },
      ],
    },
    {
      element: (
        <PublicLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </PublicLayout>
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
