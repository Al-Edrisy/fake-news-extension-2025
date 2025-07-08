import { useState, useEffect } from 'react';

export function useChromeStorage<T>(key: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await chrome.storage.local.get(key);
        setData(result[key] !== undefined ? result[key] : defaultValue);
      } catch (error) {
        console.error(`Error reading from storage for key ${key}:`, error);
        setData(defaultValue);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === 'local' && changes[key]) {
        setData(changes[key].newValue !== undefined ? changes[key].newValue : defaultValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [key, defaultValue]);

  const setDataAndStore = async (newValue: T) => {
    try {
      setData(newValue);
      await chrome.storage.local.set({ [key]: newValue });
    } catch (error) {
      console.error(`Error writing to storage for key ${key}:`, error);
      setData(data);
    }
  };

  return { data, setData: setDataAndStore, isLoading };
}