import {
  BellOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProConfigProvider, ProLayout } from '@ant-design/pro-components';
import { AutoComplete, Avatar, Button, Dropdown, Empty, Input, Popover, Space, theme } from 'antd';
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '@/constants/app';
import TemplateSettingsDrawer from '@/components/TemplateSettingsDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { protectedRoutes } from '@/routes/routeDefinitions';
const menuRoutes = protectedRoutes
  .filter((route) => !route.hideInMenu)
  .map((route) => ({ path: `/${route.path}`, name: route.name, icon: route.icon }));
export default function MainLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings, preview } = useSettings();
  const { token } = theme.useToken();
  const [search, setSearch] = useState('');
  const [templateSettingsOpen, setTemplateSettingsOpen] = useState(false);
  /*
   * No `locale` on `ProConfigProvider`: it has no such prop (it takes `intl`), and
   * ProComponents derives its own intl from the antd `ConfigProvider` above us —
   * which is why `localeFor` has to return a locale whose `.locale` key is real.
   */
  return (
    <ProConfigProvider hashed={false}>
      <ProLayout
        title={settings.name}
        logo={settings.logo || false}
        layout={settings.layout}
        navTheme="light"
        fixSiderbar
        fixedHeader
        siderWidth={224}

        collapsed={settings.collapsed}
        onCollapse={(collapsed) => preview({ collapsed })}
        location={{ pathname }}
        route={{ path: '/', routes: menuRoutes }}
        menuItemRender={(item, dom) => <Link to={item.path ?? '/dashboard'}>{dom}</Link>}
        headerTitleRender={() => (
          <Link to="/dashboard" className="header-brand">
            {settings.logo && <img src={settings.logo} alt="" />}
            <span>{settings.name}</span>
          </Link>
        )}
        headerContentRender={
          settings.layout === 'top'
            ? undefined
            : () => (
                <AutoComplete
                  className="global-search"
                  value={search}
                  options={menuRoutes
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
              )
        }
        actionsRender={() => [
          <Popover
            key="notifications"
            title="Notifications"
            trigger="click"
            content={
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You're all caught up" />
            }
          >
            <Button type="text" icon={<BellOutlined />} aria-label="Notifications" />
          </Popover>,
          <Button
            key="settings"
            type="text"
            icon={<SettingOutlined />}
            aria-label="Template settings"
            onClick={() => setTemplateSettingsOpen(true)}
          />,
        ]}
        avatarProps={{
          title: user?.name,
          render: () => (
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
                  <Avatar
                    size={32}
                    style={{ background: token.colorPrimaryBg, color: token.colorPrimary }}
                  >
                    {user?.name.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <span className="header-user-name">{user?.name}</span>
                </Space>
              </Button>
            </Dropdown>
          ),
        }}
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
        menuFooterRender={(props) =>
          props?.collapsed ? null : (
            <div className="layout-version">
              {settings.name}
              <br />v{APP_CONFIG.version} © {new Date().getFullYear()}
            </div>
          )
        }
      >
        <Outlet />
      </ProLayout>
      <TemplateSettingsDrawer
        open={templateSettingsOpen}
        onClose={() => setTemplateSettingsOpen(false)}
      />
    </ProConfigProvider>
  );
}
