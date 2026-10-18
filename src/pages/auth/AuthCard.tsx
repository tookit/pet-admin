import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { App, Button, Checkbox, Form, Input, Typography } from 'antd';
import { useState } from 'react';
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
  remember?: boolean;
}

const errorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : 'Unable to reach the server. Please try again.';

export default function AuthCard({ mode }: AuthCardProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<AuthFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === 'login';
  const { settings } = useSettings();

  const submit = async (values: AuthFormValues) => {
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(values.username, values.password, values.remember);
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={isLogin ? 'login-page' : 'page-register'}>
      <div className="auth-page__header">
        <Typography.Title level={2} className="auth-form-title">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          {isLogin
            ? 'Sign in to the Petpallets admin console.'
            : 'Register a new account, then sign in.'}
        </Typography.Paragraph>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => void submit(values)}
        requiredMark={false}
        initialValues={{ remember: true }}
      >
        <Form.Item
          name="username"
          label={isLogin ? 'Email / Username' : 'Username'}
          rules={[{ required: true, min: 3, message: 'Use at least 3 characters' }]}
        >
          <Input size="large" autoComplete="username" placeholder="admin@petpallets.com" />
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
            iconRender={(visible) => (visible ? 'Hide' : 'Show')}
          />
        </Form.Item>
        {isLogin && (
          <div className="auth-options">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Keep me signed in</Checkbox>
            </Form.Item>
            <Button
              type="link"
              size="small"
              className="auth-forgot"
              onClick={() => {
                void modal.info({
                  title: 'Password reset',
                  content:
                    'Password resets are handled by a Petpallets administrator. Contact them to regain access.',
                });
              }}
            >
              Forgot password?
            </Button>
          </div>
        )}
        <Button htmlType="submit" type="primary" size="large" block loading={submitting}>
          {isLogin ? 'Log in' : 'Create account'}
        </Button>
      </Form>
      <Typography.Paragraph className="auth-switch">
        {isLogin ? 'Need an account? ' : 'Already registered? '}
        <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Register' : 'Sign in'}</Link>
      </Typography.Paragraph>
      {isLogin && (
        <p className="auth-audit">
          © {new Date().getFullYear()} Petpallets · Authorized personnel only · Sign-ins are
          audited
        </p>
      )}
    </div>
  );
}
