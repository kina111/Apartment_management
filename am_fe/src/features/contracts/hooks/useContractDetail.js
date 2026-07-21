import { useState, useEffect, useCallback } from 'react';
import { getContractById } from '../services/contractApi';

export default function useContractDetail(contractId) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = useCallback(async () => {
    if (!contractId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getContractById(contractId);
      setContract(data);
    } catch (err) {
      console.error('Failed to fetch contract details:', err);
      setError('Không thể tải thông tin hợp đồng.');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetails();
  }, [fetchDetails]);

  return { contract, loading, error, setError, refetch: fetchDetails };
}
