import { useState, useEffect } from 'react';
import { VolumeSlider } from './VolumeSlider';
import { useSetApplicationVolume } from '@/hooks/useApplications';
import { AudioApplication } from '@/types/audio';
import { formatProcessName } from '@/lib/utils';

interface ApplicationControlProps {
  application: AudioApplication;
}

export function ApplicationControl({ application }: ApplicationControlProps) {
  const [volume, setVolume] = useState(application.volume);
  const setApplicationVolume = useSetApplicationVolume();

  useEffect(() => {
    setVolume(application.volume);
  }, [application.volume]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setApplicationVolume.mutate({ 
      processPath: application.processPath, 
      volume: newVolume 
    });
  };

  const iconUrl = application.iconPath 
    ? `${import.meta.env.VITE_API_URL || ''}${application.iconPath}`
    : null;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3 mb-4">
        {iconUrl ? (
          <img 
            src={iconUrl} 
            alt={application.displayName}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
            <span className="text-xs font-medium">
              {formatProcessName(application.processPath).charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-medium">
            {application.displayName || formatProcessName(application.processPath)}
          </h3>
          {application.mainWindowTitle && (
            <p className="text-sm text-muted-foreground truncate">
              {application.mainWindowTitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <VolumeSlider 
          value={volume} 
          onChange={handleVolumeChange}
          className="flex-1"
        />
        <span className="text-sm font-medium w-12 text-right">
          {volume}%
        </span>
      </div>
    </div>
  );
}