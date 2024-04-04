import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import PublicLayout from 'src/layouts/auth';

import ConnectedProtectedLayout from '../layouts/protected/connected';
import PublishersProtectedLayout from '../layouts/protected/publishers';
import DevelopersProtectedLayout from '../layouts/protected/developpers';
import PublishersDashboardLayout from '../layouts/protected/publishers/dashboard';
import DevelopersDashboardLayout from '../layouts/protected/developpers/dashboard';

export const IndexPage = lazy(() => import('src/pages/home'));
export const PublisherHomePage = lazy(() => import('src/pages/publisher_home'));
export const AccountPage = lazy(() => import('src/pages/account'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const SettingsPage = lazy(() => import('src/pages/settings'));

export const AppsPage = lazy(() => import('src/pages/apps'));
export const AppPage = lazy(() => import('src/pages/app'));
export const CreateAppPage = lazy(() => import('src/pages/create-app'));
export const EditAppPage = lazy(() => import('src/pages/edit-app'));

export const GamesPage = lazy(() => import('src/pages/games'));
export const GamePage = lazy(() => import('src/pages/game'));
export const CreateGamePage = lazy(() => import('src/pages/create-game'));
export const EditGamePage = lazy(() => import('src/pages/edit-game'));

export const BooksPage = lazy(() => import('src/pages/books'));
export const BookPage = lazy(() => import('src/pages/book'));
export const CreateBookPage = lazy(() => import('src/pages/create-book'));
export const EditBookPage = lazy(() => import('src/pages/edit-book'));
export const AddNewEditionPage = lazy(() => import('src/pages/add-edition'));

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
        <ConnectedProtectedLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </ConnectedProtectedLayout>
      ),
      children: [{ element: <IndexPage />, index: true }],
    },
    {
      element: (
        <DevelopersProtectedLayout>
          <DevelopersDashboardLayout>
            <Suspense>
              <Outlet />
            </Suspense>
          </DevelopersDashboardLayout>
        </DevelopersProtectedLayout>
      ),
      children: [
        { element: <IndexPage />, path: '/developer' },
        { element: <AccountPage />, path: 'developer/account' },
        { element: <ProfilePage />, path: 'developer/profile' },
        { element: <SettingsPage />, path: 'developer/settings' },

        { element: <AppsPage />, path: 'apps' },
        { element: <AppPage />, path: 'apps/view/:id' },
        { element: <EditAppPage />, path: 'apps/edit/:id' },
        { element: <CreateAppPage />, path: 'apps/create' },

        { element: <GamesPage />, path: 'games' },
        { element: <GamePage />, path: 'games/view/:id' },
        { element: <EditGamePage />, path: 'games/edit/:id' },
        { element: <CreateGamePage />, path: 'games/create' },

        { element: <AddNewReleasePage />, path: 'apps/view/:id/add-release' },
        { element: <AddNewReleasePage />, path: 'games/view/:id/add-release' },
        { element: <ReleasePage />, path: '/games/view/:application_id/release/:id' },
        { element: <ReleasePage />, path: '/apps/view/:application_id/release/:id' },
      ],
    },
    {
      element: (
        <PublishersProtectedLayout>
          <PublishersDashboardLayout>
            <Suspense>
              <Outlet />
            </Suspense>
          </PublishersDashboardLayout>
        </PublishersProtectedLayout>
      ),
      children: [
        { element: <PublisherHomePage />, path: 'publisher' },
        { element: <AccountPage />, path: 'publisher/account' },
        { element: <ProfilePage />, path: 'publisher/profile' },
        { element: <SettingsPage />, path: 'publisher/settings' },

        { element: <BooksPage />, path: 'books' },
        { element: <BookPage />, path: 'books/view/:id' },
        { element: <CreateBookPage />, path: 'books/create' },
        { element: <EditBookPage />, path: 'books/edit/:id' },
        { element: <AddNewEditionPage />, path: 'books/view/:id/add-edition' },
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
