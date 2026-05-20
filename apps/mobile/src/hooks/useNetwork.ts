import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncToServer } from '../services/sync';

export function useNetworkAutoSync(enabled: boolean) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? false;
      if (enabled && online && !isOnline) {
        syncToServer().catch(() => {});
      }
      setIsOnline(online);
    });
    return () => unsub();
  }, [enabled, isOnline]);

  return isOnline;
}
