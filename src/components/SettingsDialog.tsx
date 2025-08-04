import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useProcesses } from '@/hooks/useApplications';
import { GearIcon, Cross2Icon, CheckIcon } from '@radix-ui/react-icons';
import { formatProcessName } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: processes, isLoading: processesLoading } = useProcesses();
  const updateSettings = useUpdateSettings();
  
  const [mode, setMode] = useState<'whitelist' | 'all'>('all');
  const [whitelist, setWhitelist] = useState<string[]>([]);

  useEffect(() => {
    if (settings) {
      setMode(settings.processes.mode);
      setWhitelist(settings.processes.whitelist);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      processes: {
        mode,
        whitelist
      }
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  const toggleProcess = (processPath: string) => {
    setWhitelist(prev => 
      prev.includes(processPath)
        ? prev.filter(p => p !== processPath)
        : [...prev, processPath]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-accent rounded-md"
          >
            <Cross2Icon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Application Filter Mode</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={mode === 'all'}
                    onChange={() => setMode('all')}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show All Applications</div>
                    <div className="text-sm text-muted-foreground">
                      Display all applications with audio sessions
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={mode === 'whitelist'}
                    onChange={() => setMode('whitelist')}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Whitelist Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Only show selected applications
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {mode === 'whitelist' && (
              <div>
                <h3 className="text-lg font-medium mb-2">Select Applications</h3>
                {processesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading processes...
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2">
                    {processes?.map(process => {
                      const isSelected = whitelist.includes(process.processPath);
                      return (
                        <button
                          key={process.processPath}
                          onClick={() => toggleProcess(process.processPath)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors text-left",
                            isSelected && "bg-accent"
                          )}
                        >
                          {process.iconPath ? (
                            <img 
                              src={`${import.meta.env.VITE_API_URL || ''}${process.iconPath}`}
                              alt={process.displayName}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                              <span className="text-xs">
                                {formatProcessName(process.processPath).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium">
                              {process.displayName || formatProcessName(process.processPath)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatProcessName(process.processPath)}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckIcon className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}