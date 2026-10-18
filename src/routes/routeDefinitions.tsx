import { lazy } from 'react';
import {
  DashboardOutlined,
  IdcardOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const UserList = lazy(() => import('@/pages/users/UserList'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const SecurityPage = lazy(() => import('@/pages/security/SecurityPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const ErrorPage = lazy(() => import('@/pages/errors/ErrorPage'));
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'));

export const protectedRoutes = [
  { path: 'dashboard', name: 'Dashboard', icon: <DashboardOutlined />, component: DashboardPage },
  { path: 'users', name: 'User Management', icon: <TeamOutlined />, component: UserList },
  { path: 'profile', name: 'Profile', icon: <IdcardOutlined />, component: ProfilePage },
  { path: 'security', name: 'Security', icon: <SafetyOutlined />, component: SecurityPage },
  { path: 'settings', name: 'Settings', icon: <SettingOutlined />, component: SettingsPage },
  { path: 'error/500', name: 'Server error', component: ErrorPage, hideInMenu: true },
];
export const authRoutes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
];
export { NotFoundPage };
