import {
  BellOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProConfigProvider, ProLayout } from '@ant-design/pro-components';
import {
  AutoComplete,
  Avatar,
  Badge,
  Button,
  Dropdown,
  Empty,
  Input,
  Popover,
  Space,
  theme,
} from 'antd';
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { displayName } from '@/utils/user';
import { useSettings } from '@/contexts/SettingsContext';
import { protectedRoutes } from '@/routes/routeDefinitions';

const MENU_GROUPS = [
  { key: 'operations', name: 'Operations' },
  { key: 'catalog', name: 'Catalog' },
  { key: 'system', name: 'System' },
] as const;
const menuItems = protectedRoutes
  .filter((route) => !route.hideInMenu)
  .map((route) => ({
    path: `/${route.path}`,
    name: route.name,
    icon: route.icon,
    group: route.group,
  }));
const menuRoutes = MENU_GROUPS.map((group) => ({
  path: `/${group.key}`,
  name: group.name,
  routes: menuItems.filter((item) => item.group === group.key),
}));

export default function MainLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings, preview } = useSettings();
  const { token } = theme.useToken();
  const [search, setSearch] = useState('');

  const isSide = settings.layout === 'side';
  const activeRoute = protectedRoutes.find((route) => `/${route.path}` === pathname);
  const activeGroup = MENU_GROUPS.find((group) => group.key === activeRoute?.group);

  const searchBox = (
    <AutoComplete
      className="global-search"
      value={search}
      options={menuItems
        .filter((route) => route.name.toLowerCase().includes(search.toLowerCase()))
        .map((route) => ({ value: route.path, label: route.name }))}
      onSearch={setSearch}
      onSelect={(path) => {
        setSearch('');
        void navigate(path);
      }}
    >
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search pages…"
        aria-label="Search pages"
        allowClear
      />
    </AutoComplete>
  );

  const actions = [
    <Popover
      key="notifications"
      title="Notifications"
      trigger="click"
      content={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You're all caught up" />}
    >
      <Button
        type="text"
        aria-label="Notifications"
        icon={
          <Badge dot offset={[-1, 2]}>
            <BellOutlined />
          </Badge>
        }
      />
    </Popover>,
  ];

  const avatar = (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          {
            key: 'profile',
            label: 'My profile',
            icon: <UserOutlined />,
            onClick: () => void navigate('/profile'),
          },
          {
            key: 'settings',
            label: 'Settings',
            icon: <SettingOutlined />,
            onClick: () => void navigate('/settings'),
          },
          { type: 'divider' },
          {
            key: 'logout',
            label: 'Log out',
            icon: <LogoutOutlined />,
            onClick: () => {
              logout();
              void navigate('/login');
            },
          },
        ],
      }}
    >
      <Button type="text" className="header-avatar">
        <Space>
          <Avatar size={32} style={{ background: token.colorPrimaryBg, color: token.colorPrimary }}>
            {displayName(user).slice(0, 2).toUpperCase()}
          </Avatar>
          <span className="header-user-name">{displayName(user)}</span>
        </Space>
      </Button>
    </Dropdown>
  );

  /*
   * ProLayout drops its header entirely in desktop `side` layout (Header
   * returns null), so the search/notification/avatar row would fall into the
   * sider footer. Side mode gets our own 56px bar inside the content column;
   * the built-in mobile header still uses these props below 768px, where the
   * custom bar is hidden, and mix/top keep the built-in header.
   */
  const nativeHeaderProps = {
    headerTitleRender: () => (
      <Link to="/dashboard" className="header-brand">
        {settings.logo && <img src={settings.logo} alt="" />}
        <span>{settings.name}</span>
      </Link>
    ),
    headerContentRender: settings.layout === 'top' ? undefined : () => searchBox,
    actionsRender: () => actions,
    avatarProps: { title: displayName(user), render: () => avatar },
  };

  return (
    <ProConfigProvider hashed={false}>
      <ProLayout
        title={settings.name}
        logo={settings.logo || false}
        layout={settings.layout}
        navTheme="light"
        fixSiderbar
        fixedHeader
        siderWidth={216}
        siderMenuType="group"
        collapsed={settings.collapsed}
        onCollapse={(collapsed) => preview({ collapsed })}
        location={{ pathname }}
        route={{ path: '/', routes: menuRoutes }}
        menuItemRender={(item, dom) => <Link to={item.path ?? '/dashboard'}>{dom}</Link>}
        menuHeaderRender={() => (
          <Link to="/dashboard" className="sider-brand" aria-label="Petpallets dashboard">
            {settings.logo && <img src={settings.logo} alt="" />}
            <span>
              Pet<em>pallets</em>
            </span>
          </Link>
        )}
        {...nativeHeaderProps}
        token={{
          header: {
            colorBgHeader: token.colorBgContainer,
            colorHeaderTitle: token.colorText,
            colorTextMenu: token.colorTextSecondary,
            colorTextMenuSelected: token.colorPrimary,
          },
          sider: {
            colorMenuBackground: token.colorBgContainer,
            colorTextMenu: token.colorTextSecondary,
            colorTextMenuSelected: token.colorPrimary,
            colorBgMenuItemSelected: token.colorPrimaryBg,
          },
        }}
      >
        {isSide && (
          <div className="app-header">
            <div className="app-header__crumb">
              {activeGroup && (
                <>
                  <span>{activeGroup.name}</span>
                  <span className="app-header__sep">/</span>
                </>
              )}
              <span className="app-header__current">{activeRoute?.name ?? 'Dashboard'}</span>
            </div>
            <div className="app-header__actions">
              {searchBox}
              {actions}
              {avatar}
            </div>
          </div>
        )}
        <Outlet />
      </ProLayout>
    </ProConfigProvider>
  );
}
