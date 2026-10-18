import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { Spin } from 'antd';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import { authRoutes, NotFoundPage, protectedRoutes } from './routeDefinitions';

function RouteFallback() {
  return (
    <div className="route-loader">
      <Spin />
    </div>
  );
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

const suspense = (element: ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

export default function Router() {
  const { settings } = useSettings();
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={suspense(<route.component />)} />
        ))}
      </Route>

      <Route
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        {protectedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={suspense(<route.component />)} />
        ))}
      </Route>

      <Route path="/" element={<Navigate to={settings.landingPage} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
