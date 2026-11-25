import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export default function useCollection(resource) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.list(resource));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = async (doc) => {
    const item = await api.create(resource, doc);
    setItems((xs) => [item, ...xs]);
    return item;
  };
  const update = async (id, patch) => {
    const item = await api.update(resource, id, patch);
    setItems((xs) => xs.map((x) => (x._id === id ? item : x)));
    return item;
  };
  const remove = async (id) => {
    await api.remove(resource, id);
    setItems((xs) => xs.filter((x) => x._id !== id));
  };

  return { items, loading, error, reload, create, update, remove, setItems };
}
