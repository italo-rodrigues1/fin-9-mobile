import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { errorMessage } from '../utils/errorMessage';
export function useResource<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null);
  const version = useRef(0);
  const reload = useCallback(async () => {
    const current = ++version.current;
    setLoading(true);
    setError(null);
    try {
      const next = await load();
      if (current === version.current) setData(next);
    } catch (err) {
      if (current === version.current)
        setError(
          errorMessage(err, 'Não foi possível carregar as informações.'),
        );
    } finally {
      if (current === version.current) setLoading(false);
    }
  }, [load]);
  useFocusEffect(
    useCallback(() => {
      void reload();
      return () => {
        version.current++;
      };
    }, [reload]),
  );
  return { data, loading, error, reload };
}
