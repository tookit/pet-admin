import {
  GithubOutlined,
  GlobalOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  PushpinOutlined,
  TwitterOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import {
  App,
  Avatar,
  Badge,
  Button,
  Col,
  List,
  Progress,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';
import { getProfile } from '@/api/modules/profile.api';
import { STORAGE_KEYS } from '@/constants/app';
import { readPreferences, savePreferences } from '@/utils/storage';
import type { Profile, ProfileSnapshot } from '@/types';

const FIELD_LABELS: Array<{ key: keyof Profile; label: string }> = [
  { key: 'fullName', label: 'Full name' },
  { key: 'displayName', label: 'Display name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company' },
  { key: 'jobTitle', label: 'Job title' },
  { key: 'location', label: 'Location' },
  { key: 'bio', label: 'Bio' },
  { key: 'website', label: 'Website' },
];

/** Completion is the share of profile fields that carry a value — no hidden heuristics. */
const completeness = (profile: Profile) =>
  Math.round(
    (FIELD_LABELS.filter((field) => String(profile[field.key] ?? '').trim()).length /
      FIELD_LABELS.length) *
      100,
  );

const initials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function ProfilePage() {
  const { message } = App.useApp();
  const [snapshot, setSnapshot] = useState<ProfileSnapshot>();
  const [profile, setProfile] = useState<Profile>();
  const [form] = ProForm.useForm<Profile>();
  const [socialForm] = ProForm.useForm<Profile>();

  useEffect(() => {
    let active = true;
    getProfile()
      .then((data) => {
        if (!active) return;
        setSnapshot(data);
        const stored = readPreferences(STORAGE_KEYS.PROFILE, data.profile);
        setProfile(stored);
        form.setFieldsValue(stored);
      })
      .catch(() => void message.error('Unable to load your profile'));
    return () => {
      active = false;
    };
  }, [form, message]);

  const persist = (next: Profile, notice: string) => {
    setProfile(next);
    try {
      savePreferences(STORAGE_KEYS.PROFILE, next);
      void message.success(notice);
    } catch {
      void message.error('Unable to save locally: browser storage is full.');
    }
  };

  const readImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      void message.error('Images must be 5 MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (profile && typeof result === 'string') {
        persist({ ...profile, avatar: result }, 'Profile photo updated');
      }
    };
    reader.readAsDataURL(file);
  };

  if (!profile || !snapshot) {
    return (
      <PageContainer title="Profile" subTitle="Manage your personal information.">
        <ProCard loading />
      </PageContainer>
    );
  }

  const stats = snapshot.stats;

  return (
    <PageContainer title="Profile" subTitle="Manage your personal information.">
      <ProCard className="profile-summary" headerBordered={false}>
        <Space size={24} align="start" wrap>
          <Badge dot color="green" offset={[-6, 72]}>
            <Avatar size={88} src={profile.avatar}>
              {initials(profile.fullName)}
            </Avatar>
          </Badge>
          <div>
            <Space align="center" wrap>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {profile.displayName}
              </Typography.Title>
              <Tag color="blue">{profile.jobTitle}</Tag>
            </Space>
            <div className="profile-meta">
              <span>
                <MailOutlined /> {profile.email}
              </span>
              <span>
                <PhoneOutlined /> {profile.phone}
              </span>
              <span>
                <PushpinOutlined /> {profile.location}
              </span>
              <span>
                <GlobalOutlined /> Joined {profile.joinedAt}
              </span>
            </div>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {profile.bio}
            </Typography.Paragraph>
          </div>
          <Space size={24} wrap className="profile-stats">
            {[
              ['Team Members', stats.teamMembers],
              ['Projects', stats.projects],
              ['Contributions', stats.contributions],
              ['Days Active', stats.daysActive],
            ].map(([label, value]) => (
              <span key={String(label)}>
                <strong>{value}</strong>
                {label}
              </span>
            ))}
          </Space>
        </Space>
      </ProCard>

      <Row gutter={[16, 16]} className="section-card">
        <Col xs={24} xl={16}>
          <ProCard
            title="Edit Profile"
            headerBordered
            extra={
              <Space>
                <span>
                  Profile Completeness <strong>{completeness(profile)}%</strong>
                </span>
                <Progress
                  percent={completeness(profile)}
                  size="small"
                  showInfo={false}
                  style={{ width: 120 }}
                />
              </Space>
            }
          >
            <ProForm<Profile>
              form={form}
              submitter={false}
              onFinish={(values) => persist({ ...profile, ...values }, 'Profile updated')}
            >
              <div className="form-grid">
                <ProFormText name="fullName" label="Full Name" rules={[{ required: true }]} />
                <ProFormText name="displayName" label="Display Name" rules={[{ required: true }]} />
                <ProFormText
                  name="email"
                  label="Email Address"
                  rules={[{ required: true, type: 'email' }]}
                />
                <ProFormText name="phone" label="Phone Number" />
                <ProFormText name="company" label="Company" />
                <ProFormText name="jobTitle" label="Job Title" />
                <ProFormText name="location" label="Location" />
                <ProFormText name="timezone" label="Timezone" />
                <div className="full-width">
                  <ProFormTextArea
                    name="bio"
                    label="Bio"
                    fieldProps={{ rows: 3, maxLength: 200, showCount: true }}
                  />
                </div>
              </div>
              <Space>
                <Button
                  onClick={() => {
                    form.setFieldsValue(profile);
                    void message.info('Changes discarded');
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" onClick={() => void form.submit()}>
                  Save Changes
                </Button>
              </Space>
            </ProForm>
          </ProCard>

          <ProCard title="Recent Activity" headerBordered className="section-card">
            <List
              dataSource={snapshot.activities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge status="processing" />}
                    title={item.title}
                    description={item.detail}
                  />
                  <Typography.Text type="secondary">{item.time}</Typography.Text>
                </List.Item>
              )}
            />
          </ProCard>
        </Col>

        <Col xs={24} xl={8}>
          <ProCard title="Profile Photo" headerBordered>
            <Typography.Paragraph type="secondary">
              Upload a new photo to personalize your account. JPG, PNG or GIF, up to 5 MB.
            </Typography.Paragraph>
            <Upload.Dragger
              accept="image/jpeg,image/png,image/gif"
              maxCount={1}
              showUploadList={false}
              beforeUpload={(file) => {
                readImage(file);
                return false;
              }}
            >
              <p className="ant-upload-text">Click or drag an image here</p>
              <p className="ant-upload-hint">
                Kept in this browser — uploads need file storage on a server.
              </p>
            </Upload.Dragger>
          </ProCard>

          <ProCard title="Social Links" headerBordered className="section-card">
            <ProForm<Profile>
              form={socialForm}
              initialValues={profile}
              submitter={false}
              onFinish={(values) => persist({ ...profile, ...values }, 'Social links updated')}
            >
              <ProFormText
                name="linkedin"
                label="LinkedIn"
                fieldProps={{ prefix: <LinkedinOutlined /> }}
                rules={[{ type: 'url' }]}
              />
              <ProFormText
                name="github"
                label="GitHub"
                fieldProps={{ prefix: <GithubOutlined /> }}
                rules={[{ type: 'url' }]}
              />
              <ProFormText
                name="twitter"
                label="X / Twitter"
                fieldProps={{ prefix: <TwitterOutlined /> }}
                rules={[{ type: 'url' }]}
              />
              <ProFormText
                name="website"
                label="Website"
                fieldProps={{ prefix: <GlobalOutlined /> }}
                rules={[{ type: 'url' }]}
              />
              <Button type="primary" onClick={() => void socialForm.submit()}>
                Save Changes
              </Button>
            </ProForm>
          </ProCard>

          <ProCard title="Skills & Interests" headerBordered className="section-card">
            <Select
              mode="tags"
              className="full-width"
              value={profile.skills}
              maxCount={10}
              placeholder="Add a skill and press Enter"
              onChange={(skills) => persist({ ...profile, skills }, 'Skills updated')}
              options={[]}
            />
            <Typography.Text type="secondary">Up to 10. Press Enter to add.</Typography.Text>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
}
