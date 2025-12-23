import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export interface NetworkStatus {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    type: string;
    isWifi: boolean;
    isCellular: boolean;
}

const INITIAL_STATE: NetworkStatus = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
};

export const useNetworkStatus = () => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(INITIAL_STATE);
    const isMountedRef = useRef(true);

    // Memoize the update function to prevent recreations
    const updateNetworkStatus = useCallback((state: NetInfoState) => {
        if (!isMountedRef.current) return;

        setNetworkStatus(prev => {
            // Only update if values actually changed (prevent unnecessary re-renders)
            if (
                prev.isConnected === state.isConnected &&
                prev.isInternetReachable === state.isInternetReachable &&
                prev.type === state.type
            ) {
                return prev;
            }

            return {
                isConnected: state.isConnected,
                isInternetReachable: state.isInternetReachable,
                type: state.type,
                isWifi: state.type === 'wifi',
                isCellular: state.type === 'cellular',
            };
        });
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        let unsubscribe: NetInfoSubscription | null = null;

        // Initial fetch
        NetInfo.fetch().then((state: NetInfoState) => {
            updateNetworkStatus(state);
        });

        // Subscribe to network changes
        unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            updateNetworkStatus(state);
        });

        return () => {
            isMountedRef.current = false;
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [updateNetworkStatus]);

    // Memoize checkConnection to prevent recreations
    const checkConnection = useCallback(async (): Promise<boolean> => {
        try {
            const state = await NetInfo.fetch();
            return state.isConnected === true && state.isInternetReachable === true;
        } catch {
            return false;
        }
    }, []);

    return {
        ...networkStatus,
        checkConnection,
    };
};

export default useNetworkStatus;
