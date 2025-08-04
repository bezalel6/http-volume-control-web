import { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { GearIcon, ReloadIcon, LockClosedIcon, LockOpen1Icon, PersonIcon } from '@radix-ui/react-icons';
import { useDevices } from '@/hooks/useDevices';
import { useApplications } from '@/hooks/useApplications';
import { usePairing } from '@/hooks/usePairing';
import { DeviceControl } from '@/components/DeviceControl';
import { ApplicationControl } from '@/components/ApplicationControl';
import { SettingsDialog } from '@/components/SettingsDialog';
import { PairingDialog } from '@/components/PairingDialog';
import { SessionsDialog } from '@/components/SessionsDialog';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthErrorBoundary } from '@/components/AuthErrorBoundary';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pairingOpen, setPairingOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const { data: devicesData, isLoading: devicesLoading, error: devicesError } = useDevices();
  const { data: applications, isLoading: appsLoading, error: appsError } = useApplications();
  const { isAuthenticated, sessionInfo, logout, isLoggingOut } = usePairing();
  const queryClient = useQueryClient();

  // Show pairing dialog if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setPairingOpen(true);
    }
  }, [isAuthenticated]);

  // Listen for auth errors
  useEffect(() => {
    const handleAuthError = () => {
      setPairingOpen(true);
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Audio Control</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Refresh"
            >
              <ReloadIcon className="h-4 w-4" />
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setSessionsOpen(true)}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  aria-label="Sessions"
                  title={sessionInfo?.deviceName || 'Sessions'}
                >
                  <PersonIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  aria-label="Logout"
                  disabled={isLoggingOut}
                >
                  <LockOpen1Icon className="h-4 w-4" />
                </button>
              </>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => setPairingOpen(true)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Pair Device"
              >
                <LockClosedIcon className="h-4 w-4" />
              </button>
            )}
            <ThemeToggle />
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Settings"
            >
              <GearIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Tabs.Root defaultValue="devices" className="w-full">
          <Tabs.List className="flex items-center gap-1 p-1 bg-muted rounded-lg mb-6">
            <Tabs.Trigger 
              value="devices"
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                "hover:text-foreground",
                "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              )}
            >
              Devices
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="applications"
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                "hover:text-foreground",
                "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              )}
            >
              Applications
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="devices" className="space-y-4">
            {devicesLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading devices...
              </div>
            ) : devicesError ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-2">Failed to load devices</p>
                <p className="text-sm text-muted-foreground">
                  {!isAuthenticated 
                    ? 'Please pair this device to continue' 
                    : 'Make sure the API server is running and accessible'
                  }
                </p>
                {!isAuthenticated && (
                  <button
                    onClick={() => setPairingOpen(true)}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Pair Device
                  </button>
                )}
              </div>
            ) : (
              <>
                {devicesData?.devices.map((device) => (
                  <DeviceControl key={device.id} device={device} />
                ))}
                {devicesData?.devices.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No audio devices found
                  </div>
                )}
              </>
            )}
          </Tabs.Content>

          <Tabs.Content value="applications" className="space-y-4">
            {appsLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading applications...
              </div>
            ) : appsError ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-2">Failed to load applications</p>
                <p className="text-sm text-muted-foreground">
                  {!isAuthenticated 
                    ? 'Please pair this device to continue' 
                    : 'Make sure the API server is running'
                  }
                </p>
                {!isAuthenticated && (
                  <button
                    onClick={() => setPairingOpen(true)}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Pair Device
                  </button>
                )}
              </div>
            ) : (
              <>
                {applications?.map((app, index) => (
                  <ApplicationControl 
                    key={`${app.processPath}-${app.instanceId || index}`} 
                    application={app} 
                  />
                ))}
                {applications?.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No applications with audio found</p>
                    <p className="text-sm mt-2">
                      Play some audio in an application and it will appear here
                    </p>
                  </div>
                )}
              </>
            )}
          </Tabs.Content>
        </Tabs.Root>

        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <PairingDialog open={pairingOpen} onOpenChange={setPairingOpen} />
        <SessionsDialog open={sessionsOpen} onOpenChange={setSessionsOpen} />
        
        {/* Connection Status Footer */}
        <div className="fixed bottom-4 right-4">
          <ConnectionStatus />
        </div>
        
      </div>
    </div>
  );
}

export default App;