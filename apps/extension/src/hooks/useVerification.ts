import { useState, useEffect } from 'react';
import { verifyClaim } from '@/api';
import { FactCheckResult } from '@/types';

export const useVerification = (claim: string) => {
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!claim) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await verifyClaim(claim);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [claim]);

  return { result, loading, error };
};