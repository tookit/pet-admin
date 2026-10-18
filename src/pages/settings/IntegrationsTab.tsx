import { ProCard } from '@ant-design/pro-components';
import { Alert, App, Button, List, Tag } from 'antd';

const INTEGRATIONS = [
  { name: 'Slack', detail: 'Send alerts and digests into a channel.', status: 'Not connected' },
  { name: 'Microsoft Teams', detail: 'Post notifications to a team.', status: 'Not connected' },
  { name: 'Google Workspace', detail: 'Sync directory and calendar.', status: 'Not connected' },
  { name: 'GitHub', detail: 'Link deploys and issues to releases.', status: 'Not connected' },
  { name: 'Webhook', detail: 'POST events to your own endpoint.', status: 'Not connected' },
];

/**
 * Every integration here needs a server to hold credentials and tokens, so none of
 * them are wired up — the card says so rather than pretending a connect succeeded.
 */
export default function IntegrationsTab() {
  const { message } = App.useApp();
  return (
    <ProCard
      headerBordered
      title="Integrations"
      subTitle="Connect the tools your team already uses."
    >
      <Alert
        type="info"
        showIcon
        message="Integrations are not connected in this demo."
        description="Connect flows need a backend to store credentials and receive callbacks."
        style={{ marginBottom: 16 }}
      />
      <List
        dataSource={INTEGRATIONS}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                key="connect"
                onClick={() =>
                  void message.info(
                    `Connecting ${item.name} needs a backend, not part of this demo.`,
                  )
                }
              >
                Connect
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <span>
                  {item.name} <Tag>{item.status}</Tag>
                </span>
              }
              description={item.detail}
            />
          </List.Item>
        )}
      />
    </ProCard>
  );
}
