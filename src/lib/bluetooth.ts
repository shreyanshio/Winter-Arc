/**
 * Web Bluetooth API integration for standard Heart Rate Service (UUID 0x180D).
 * Supported on Chromium-based browsers (Chrome, Edge, Opera on Windows, macOS, Android).
 */

export interface BluetoothHeartRateSession {
  isConnected: boolean;
  deviceName?: string;
  currentBpm: number;
  minBpm: number;
  maxBpm: number;
  avgBpm: number;
  samples: number[];
}

export function isBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

export async function connectHeartRateMonitor(
  onHeartRateUpdate: (bpm: number) => void
): Promise<{ disconnect: () => void; deviceName: string }> {
  if (!isBluetoothSupported()) {
    throw new Error('Web Bluetooth is not supported on this browser/platform.');
  }

  // @ts-ignore
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: ['heart_rate'] }],
    optionalServices: ['battery_service'],
  });

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService('heart_rate');
  const characteristic = await service.getCharacteristic('heart_rate_measurement');

  await characteristic.startNotifications();

  const handleCharacteristicValueChanged = (event: any) => {
    const value = event.target.value;
    // Standard Bluetooth SIG Heart Rate Measurement parse
    // First byte flags: Bit 0 = 0 -> uint8, Bit 0 = 1 -> uint16
    const flags = value.getUint8(0);
    const is16Bit = flags & 0x1;
    const bpm = is16Bit ? value.getUint16(1, true) : value.getUint8(1);

    if (bpm > 30 && bpm < 240) {
      onHeartRateUpdate(bpm);
    }
  };

  characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

  return {
    deviceName: device.name || 'BLE Heart Rate Sensor',
    disconnect: () => {
      try {
        characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        if (device.gatt?.connected) {
          device.gatt.disconnect();
        }
      } catch (err) {
        console.warn('Bluetooth disconnect error:', err);
      }
    },
  };
}
