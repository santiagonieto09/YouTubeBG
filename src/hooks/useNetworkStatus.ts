import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export interface NetworkStatus {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    type: string;
    isWifi: boolean;
    isCellular: boolean;
}

export const useNetworkStatus = () => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
        isWifi: false,
        isCellular: false,
    });

    useEffect(() => {
        // Initial fetch
        NetInfo.fetch().then((state: NetInfoState) => {
            updateNetworkStatus(state);
        });

        // Subscribe to network changes
        const unsubscribe: NetInfoSubscription = NetInfo.addEventListener((state: NetInfoState) => {
            updateNetworkStatus(state);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const updateNetworkStatus = (state: NetInfoState) => {
        setNetworkStatus({
            isConnected: state.isConnected,
            isInternetReachable: state.isInternetReachable,
            type: state.type,
            isWifi: state.type === 'wifi',
            isCellular: state.type === 'cellular',
        });
    };

    const checkConnection = async (): Promise<boolean> => {
        const state = await NetInfo.fetch();
        return state.isConnected === true && state.isInternetReachable === true;
    };

    return {
        ...networkStatus,
        checkConnection,
    };
};

export default useNetworkStatus;
