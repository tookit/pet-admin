import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="Page not found"
      extra={
        <Button type="primary" onClick={() => void navigate('/dashboard')}>
          Back to dashboard
        </Button>
      }
    />
  );
}
