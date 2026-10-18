import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
export default function ErrorPage() {
  const navigate = useNavigate();
  return (
    <Result
      status="500"
      title="Server error"
      subTitle="This is a template error page. No request was made."
      extra={
        <Button type="primary" onClick={() => void navigate('/dashboard')}>
          Back to dashboard
        </Button>
      }
    />
  );
}
