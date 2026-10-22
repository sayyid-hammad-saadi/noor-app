import * as Network from 'expo-network';

const offline = (s: Network.NetworkState) =>
  s.isConnected === false || s.isInternetReachable === false;

/** False only when the device reports no connection (unknown counts as online). */
export function useOnline(): boolean {
  return !offline(Network.useNetworkState());
}

export async function isOnline(): Promise<boolean> {
  try {
    return !offline(await Network.getNetworkStateAsync());
  } catch {
    return true;
  }
}

/** Calls back when the connection comes back. */
export function onReconnect(callback: () => void): () => void {
  let wasOffline = false;
  const sub = Network.addNetworkStateListener((s) => {
    if (offline(s)) wasOffline = true;
    else if (wasOffline) {
      wasOffline = false;
      callback();
    }
  });
  return () => sub.remove();
}
