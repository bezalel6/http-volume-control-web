import { useState, useEffect } from 'react';
import { VolumeSlider } from './VolumeSlider';
import { useSetDeviceVolume, useSetDeviceMute } from '@/hooks/useDevices';
import { AudioDevice } from '@/types/audio';
import { SpeakerLoudIcon, SpeakerOffIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface DeviceControlProps {
  device: AudioDevice;
}

export function DeviceControl({ device }: DeviceControlProps) {
  const [volume, setVolume] = useState(device.volume);
  const [isMuted, setIsMuted] = useState(device.muted);
  const setDeviceVolume = useSetDeviceVolume();
  const setDeviceMute = useSetDeviceMute();

  useEffect(() => {
    setVolume(device.volume);
    setIsMuted(device.muted);
  }, [device.volume, device.muted]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setDeviceVolume.mutate({ device: device.id, volume: newVolume });
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setDeviceMute.mutate({ device: device.id, muted: newMuted });
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{device.name}</h3>
          {device.default && (
            <span className="text-sm text-muted-foreground">Default Device</span>
          )}
        </div>
        <button
          onClick={handleMuteToggle}
          className={cn(
            "p-2 rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isMuted && "text-destructive"
          )}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <SpeakerOffIcon className="h-5 w-5" />
          ) : (
            <SpeakerLoudIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <VolumeSlider 
          value={volume} 
          onChange={handleVolumeChange}
          disabled={isMuted}
          className="flex-1"
        />
        <span className="text-sm font-medium w-12 text-right">
          {volume}%
        </span>
      </div>
    </div>
  );
}