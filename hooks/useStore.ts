import { useState, useEffect } from "react";

const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const [loading, setLoading] = useState(true);
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setLoading(true);
    setData(result);
    setLoading(false);
  }, [result]);

  return { data, loading };
};

export default useStore;
