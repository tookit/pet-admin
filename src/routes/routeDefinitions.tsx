import { lazy } from 'react';
import {
  ApartmentOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  FileTextOutlined,
  IdcardOutlined,
  PictureOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  SettingOutlined,
  ShopOutlined,
  SlidersOutlined,
  TagsOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ProductList = lazy(() => import('@/pages/catalog/ProductList'));
const SupplierList = lazy(() => import('@/pages/suppliers/SupplierList'));
const CategoryList = lazy(() => import('@/pages/catalog/CategoryList'));
const TagList = lazy(() => import('@/pages/catalog/TagList'));
const QuoteList = lazy(() => import('@/pages/quotes/QuoteList'));
const RoleList = lazy(() => import('@/pages/rbac/RoleList'));
const MediaList = lazy(() => import('@/pages/media/MediaList'));
const AttributeList = lazy(() => import('@/pages/attributes/AttributeList'));
const UserList = lazy(() => import('@/pages/users/UserList'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const SecurityPage = lazy(() => import('@/pages/security/SecurityPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const ErrorPage = lazy(() => import('@/pages/errors/ErrorPage'));
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'));

export const protectedRoutes = [
  {
    path: 'dashboard',
    name: 'Workbench',
    icon: <DashboardOutlined />,
    group: 'operations',
    component: DashboardPage,
  },
  {
    path: 'quotes',
    name: 'Inquiries',
    icon: <FileTextOutlined />,
    group: 'operations',
    component: QuoteList,
  },
  {
    path: 'products',
    name: 'Products',
    icon: <AppstoreOutlined />,
    group: 'catalog',
    component: ProductList,
  },
  {
    path: 'suppliers',
    name: 'Suppliers',
    icon: <ShopOutlined />,
    group: 'catalog',
    component: SupplierList,
  },
  {
    path: 'categories',
    name: 'Catalog setup',
    icon: <ApartmentOutlined />,
    group: 'catalog',
    component: CategoryList,
  },
  {
    path: 'tags',
    name: 'Tags',
    icon: <TagsOutlined />,
    group: 'catalog',
    component: TagList,
    hideInMenu: true,
  },
  {
    path: 'media',
    name: 'Media',
    icon: <PictureOutlined />,
    group: 'catalog',
    component: MediaList,
  },
  {
    path: 'attributes',
    name: 'Attributes',
    icon: <SlidersOutlined />,
    group: 'catalog',
    component: AttributeList,
    hideInMenu: true,
  },
  {
    path: 'roles',
    name: 'Access Control',
    icon: <SafetyCertificateOutlined />,
    group: 'system',
    component: RoleList,
    hideInMenu: true,
  },
  {
    path: 'users',
    name: 'Users & access',
    icon: <TeamOutlined />,
    group: 'system',
    component: UserList,
  },
  {
    path: 'profile',
    name: 'Profile',
    icon: <IdcardOutlined />,
    group: 'system',
    component: ProfilePage,
    hideInMenu: true,
  },
  {
    path: 'security',
    name: 'Security',
    icon: <SafetyOutlined />,
    group: 'system',
    component: SecurityPage,
    hideInMenu: true,
  },
  {
    path: 'settings',
    name: 'Settings',
    icon: <SettingOutlined />,
    group: 'system',
    component: SettingsPage,
  },
  {
    path: 'error/500',
    name: 'Server error',
    group: 'system',
    component: ErrorPage,
    hideInMenu: true,
  },
];
export const authRoutes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
];
export { NotFoundPage };
