import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { registerAPI } from '@/api/modules/auth.api';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

interface AuthCardProps {
  mode: 'login' | 'register';
}

interface AuthFormValues {
  username: string;
  email?: string;
  password: string;
}

const errorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : 'Unable to reach the server. Please try again.';

export default function AuthCard({ mode }: AuthCardProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm<AuthFormValues>();
  const isLogin = mode === 'login';
  const { settings } = useSettings();

  const submit = async (values: AuthFormValues) => {
    try {
      if (isLogin) {
        await login(values.username, values.password);
        void message.success('Signed in successfully.');
        void navigate(settings.landingPage);
      } else {
        await registerAPI({
          username: values.username,
          email: values.email ?? '',
          password: values.password,
        });
        void message.success('Account created. Please sign in.');
        void navigate('/login');
      }
    } catch (error) {
      void message.error(errorMessage(error));
    }
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
            ? 'Sign in with your Petpallets admin account.'
            : 'Register a new account, then sign in.'}
        </Typography.Paragraph>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => void submit(values)}
        requiredMark={false}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, min: 3, message: 'Use at least 3 characters' }]}
        >
          <Input prefix={<UserOutlined />} size="large" autoComplete="username" />
        </Form.Item>
        {!isLogin && (
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input prefix={<MailOutlined />} size="large" autoComplete="email" />
          </Form.Item>
        )}
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, min: 8, message: 'Use at least 8 characters' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            size="large"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
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
