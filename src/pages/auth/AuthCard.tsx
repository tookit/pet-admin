import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/mocks/api';
import { useSettings } from '@/contexts/SettingsContext';

interface AuthCardProps {
  mode: 'login' | 'register';
}

interface AuthFormValues {
  name?: string;
  email: string;
  password: string;
}

export default function AuthCard({ mode }: AuthCardProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm<AuthFormValues>();
  const isLogin = mode === 'login';
  const { settings } = useSettings();

  const submit = async (values: AuthFormValues) => {
    if (isLogin) await login(values.email);
    else await mockApi.register(values.name ?? 'New user', values.email);
    void message.success(isLogin ? 'Signed in with mock data.' : 'Account created with mock data.');
    void navigate(isLogin ? settings.landingPage : '/login');
  };
  return (
    <div className={isLogin ? 'login-page' : 'page-register'}>
      <div className="auth-page__header">
        <img className="auth-logo" src={settings.logo} alt={settings.name} />
        <Typography.Title level={2}>
          {isLogin ? 'Welcome back' : 'Create an account'}
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          {isLogin
            ? 'Use any valid email and password to enter the local demo.'
            : 'Registration is local only; no account is sent to a server.'}
        </Typography.Paragraph>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => void submit(values)}
        requiredMark={false}
      >
        {!isLogin && (
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a name' }]}>
            <Input prefix={<UserOutlined />} size="large" />
          </Form.Item>
        )}
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
        >
          <Input prefix={<MailOutlined />} size="large" placeholder="admin@example.com" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, min: 6, message: 'Use at least 6 characters' }]}
        >
          <Input.Password prefix={<LockOutlined />} size="large" />
        </Form.Item>
        <Button htmlType="submit" type="primary" size="large" block>
          {isLogin ? 'Sign in' : 'Create account'}
        </Button>
      </Form>
      <Typography.Paragraph className="auth-switch">
        {isLogin ? 'Need an account? ' : 'Already registered? '}
        <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Register' : 'Sign in'}</Link>
      </Typography.Paragraph>
    </div>
  );
}
