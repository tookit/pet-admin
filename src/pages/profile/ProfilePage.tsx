import { CalendarOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { App, Avatar, Button, Col, Row, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '@/api/modules/profile.api';
import { useAuth } from '@/contexts/AuthContext';
import { displayName } from '@/utils/user';
import { GENDER_OPTIONS } from '@/pages/users/options';
import type { ApiUser, UserUpdateParams } from '@/types/api';

interface ProfileFormValues {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  avatar: string;
  gender: string;
}

const FIELDS: Array<keyof ProfileFormValues> = [
  'firstname',
  'lastname',
  'phone',
  'avatar',
  'gender',
];

/** Completion is the share of API-backed fields that carry a value. */
const completeness = (user: ApiUser) =>
  Math.round(
    (FIELDS.filter((field) => String(user[field] ?? '').trim()).length / FIELDS.length) * 100,
  );

const initials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const toForm = (user: ApiUser): ProfileFormValues => ({
  username: user.username,
  email: user.email,
  firstname: user.firstname ?? '',
  lastname: user.lastname ?? '',
  phone: user.phone ?? '',
  avatar: user.avatar ?? '',
  gender: user.gender ?? 'other',
});

export default function ProfilePage() {
  const { message } = App.useApp();
  const { user: sessionUser, updateUser } = useAuth();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = ProForm.useForm<ProfileFormValues>();

  useEffect(() => {
    let active = true;
    getProfile()
      .then((data) => {
        if (!active) return;
        setUser(data);
        form.setFieldsValue(toForm(data));
        updateUser(data);
      })
      .catch(() => void message.error('Unable to load your profile'));
    return () => {
      active = false;
    };
  }, [form, message, updateUser]);

  const save = async (values: ProfileFormValues) => {
    const payload: UserUpdateParams = {
      firstname: values.firstname || null,
      lastname: values.lastname || null,
      phone: values.phone || null,
      avatar: values.avatar || null,
      gender: values.gender || undefined,
    };
    setSaving(true);
    try {
      const updated = await updateProfile(payload);
      setUser(updated);
      form.setFieldsValue(toForm(updated));
      updateUser(updated);
      void message.success('Profile updated');
    } catch {
      void message.error('Unable to update your profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <PageContainer title="Profile" subTitle="Manage your personal information.">
        <ProCard loading />
      </PageContainer>
    );
  }

  const name = displayName(user);
  const roles = user.roles.length ? user.roles.map((role) => role.name).join(', ') : 'No roles';

  return (
    <PageContainer title="Profile" subTitle="Manage your personal information.">
      <ProCard className="profile-summary" headerBordered={false}>
        <Space size={24} align="start" wrap>
          <Avatar size={88} src={user.avatar}>
            {initials(name)}
          </Avatar>
          <div>
            <Space align="center" wrap>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {name}
              </Typography.Title>
              <Tag color="blue">{roles}</Tag>
            </Space>
            <div className="profile-meta">
              <span>
                <UserOutlined /> @{user.username}
              </span>
              <span>
                <MailOutlined /> {user.email}
              </span>
              <span>
                <PhoneOutlined /> {user.phone || 'No phone'}
              </span>
              <span>
                <CalendarOutlined /> Joined {user.created_at?.slice(0, 10) ?? '—'}
              </span>
            </div>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Signed in as {sessionUser?.username ?? user.username}. Company, job title and social
              links are not stored by pet-api, so they are not shown.
            </Typography.Paragraph>
          </div>
        </Space>
      </ProCard>

      <Row gutter={[16, 16]} className="section-card">
        <Col xs={24} xl={16}>
          <ProCard
            title="Edit Profile"
            headerBordered
            extra={
              <span>
                Profile Completeness <strong>{completeness(user)}%</strong>
              </span>
            }
          >
            <ProForm<ProfileFormValues>
              form={form}
              submitter={false}
              onFinish={(values) => void save(values)}
            >
              <div className="form-grid">
                <ProFormText name="username" label="Username" disabled />
                <ProFormText name="email" label="Email Address" disabled />
                <ProFormText name="firstname" label="First Name" />
                <ProFormText name="lastname" label="Last Name" />
                <ProFormText name="phone" label="Phone Number" />
                <ProFormSelect name="gender" label="Gender" options={GENDER_OPTIONS} />
                <div className="full-width">
                  <ProFormText
                    name="avatar"
                    label="Avatar URL"
                    placeholder="https://example.com/photo.jpg"
                    rules={[{ type: 'url', message: 'Enter a valid image URL' }]}
                  />
                </div>
              </div>
              <Space>
                <Button
                  onClick={() => {
                    form.setFieldsValue(toForm(user));
                    void message.info('Changes discarded');
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" loading={saving} onClick={() => void form.submit()}>
                  Save Changes
                </Button>
              </Space>
            </ProForm>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
}
