import { useCallback, useRef } from 'react';
import { App } from 'antd';
import type { ActionType, ParamsType } from '@ant-design/pro-components';
import type { PaginatedResponse } from '@/types';

interface Options<T, U extends ParamsType> {
  fetchData: (params: U) => Promise<PaginatedResponse<T>>;
  headerTitle: string;
}

export function useProTable<T, U extends ParamsType = ParamsType>({
  fetchData,
  headerTitle,
}: Options<T, U>) {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message } = App.useApp();

  // ProTable treats a changed `request` identity as a refetch trigger, so this must stay stable.
  const request = useCallback(
    async (params: U) => {
      try {
        const response = await fetchData(params);
        return { data: response.result, success: true, total: response.total };
      } catch (error) {
        console.error('Unable to load table data', error);
        void message.error('Failed to load table data');
        return { data: [], success: false, total: 0 };
      }
    },
    [fetchData, message],
  );

  return {
    actionRef,
    defaultProTableProps: {
      actionRef,
      request,
      rowKey: 'id',
      headerTitle,
      cardBordered: true,
      dateFormatter: 'string' as const,
      search: {
        labelWidth: 'auto' as const,
        filterType: 'query' as const,
        defaultCollapsed: false,
      },
      pagination: { defaultPageSize: 10, showSizeChanger: true, showQuickJumper: true },
      options: { density: true, fullScreen: true, setting: true },
    },
  };
}
