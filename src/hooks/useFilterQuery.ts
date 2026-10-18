import { useEffect, useState } from 'react';
import type { FormInstance } from 'antd';
import { useSearchParams } from 'react-router-dom';

const isEmpty = (value: unknown) => value === undefined || value === null || value === '';

/**
 * Keeps list filters in the URL so a filtered view can be shared. The URL is
 * read once on mount; later edits live in the form and table state.
 */
export function useFilterQuery<T extends object>(
  form: FormInstance,
  decode: (search: URLSearchParams) => T,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [initial] = useState(() => decode(searchParams));
  const [params, setParams] = useState<T>(initial);

  useEffect(() => {
    form.setFieldsValue(initial);
  }, [form, initial]);

  const apply = (values: T) => {
    const next = Object.fromEntries(
      Object.entries(values).filter(([, value]) => !isEmpty(value)),
    ) as T;
    setParams(next);
    setSearchParams(
      Object.fromEntries(Object.entries(next).map(([key, value]) => [key, String(value)])),
      { replace: true },
    );
  };

  const clear = () => {
    form.resetFields();
    setParams({} as T);
    setSearchParams({}, { replace: true });
  };

  return {
    params,
    apply,
    clear,
    hasFilters: Object.values(params).some((value) => !isEmpty(value)),
  };
}
