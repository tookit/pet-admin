import { App, Checkbox, Empty, List, Tag } from 'antd';
import { useState } from 'react';
import type { Task, TaskPriority } from '@/types';

const PRIORITY: Record<TaskPriority, { color: string; label: string }> = {
  high: { color: 'red', label: 'High' },
  medium: { color: 'blue', label: 'Medium' },
  low: { color: 'default', label: 'Low' },
};

export default function MyTasks({ tasks }: { tasks: Task[] }) {
  const { message } = App.useApp();
  const [items, setItems] = useState(tasks);

  const toggle = (id: number, done: boolean) => {
    setItems((current) => current.map((task) => (task.id === id ? { ...task, done } : task)));
    if (done) void message.success('Task completed');
  };

  return (
    <List
      dataSource={items}
      locale={{ emptyText: <Empty description="No tasks for this range" /> }}
      renderItem={(task) => (
        <List.Item
          className={task.done ? 'task-item task-item-done' : 'task-item'}
          extra={<Tag color={PRIORITY[task.priority].color}>{PRIORITY[task.priority].label}</Tag>}
        >
          <Checkbox checked={task.done} onChange={(event) => toggle(task.id, event.target.checked)}>
            <span className="task-title">{task.title}</span>
            <small>{task.detail}</small>
          </Checkbox>
        </List.Item>
      )}
    />
  );
}
