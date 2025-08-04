import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon, LockClosedIcon, ReloadIcon } from '@radix-ui/react-icons';
import { usePairing } from '@/hooks/usePairing';
import { cn } from '@/lib/utils';

interface PairingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PairingDialog({ open, onOpenChange }: PairingDialogProps) {
  const {
    pairingStatus,
    pairingState,
    initiatePairing,
    completePairing,
    cancelPairing,
    isInitiating,
    isCompleting,
  } = usePairing();

  const [deviceName, setDeviceName] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [showInstructions, setShowInstructions] = useState(true);

  // Auto-detect device name
  useEffect(() => {
    if (!deviceName) {
      const userAgent = navigator.userAgent;
      let detectedName = 'Web Browser';
      
      if (userAgent.includes('Chrome')) detectedName = 'Chrome Browser';
      else if (userAgent.includes('Firefox')) detectedName = 'Firefox Browser';
      else if (userAgent.includes('Safari')) detectedName = 'Safari Browser';
      else if (userAgent.includes('Edge')) detectedName = 'Edge Browser';
      
      setDeviceName(detectedName);
    }
  }, [deviceName]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setPairingCode('');
      setShowInstructions(true);
      if (pairingState.sessionId) {
        cancelPairing();
      }
    }
  }, [open, pairingState.sessionId, cancelPairing]);
  
  // Listen for pairing success to close dialog
  useEffect(() => {
    const handlePairingSuccess = () => {
      onOpenChange(false);
    };
    
    window.addEventListener('pairing-success', handlePairingSuccess);
    return () => window.removeEventListener('pairing-success', handlePairingSuccess);
  }, [onOpenChange]);

  const handleInitiate = () => {
    setShowInstructions(false);
    initiatePairing(deviceName);
  };

  const handleComplete = () => {
    if (pairingCode && pairingState.sessionId) {
      completePairing({
        code: pairingCode.toUpperCase(),
        sessionId: pairingState.sessionId,
      });
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric characters
    const filtered = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setPairingCode(filtered.slice(0, pairingStatus?.codeLength || 6));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]">
          <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LockClosedIcon className="h-5 w-5" />
            Pair Device
          </Dialog.Title>
          
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          {showInstructions && !pairingState.sessionId ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To control audio from this device, you need to pair it with the server.
              </p>
              
              <div className="space-y-2">
                <label htmlFor="device-name" className="text-sm font-medium">
                  Device Name
                </label>
                <input
                  id="device-name"
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="My Device"
                />
              </div>

              <div className="bg-muted p-4 rounded-md space-y-2">
                <h4 className="font-medium text-sm">Instructions:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                  <li>Click "Start Pairing" below</li>
                  <li>A 6-character code will appear in the server console</li>
                  <li>Enter the code here to complete pairing</li>
                </ol>
              </div>

              <button
                onClick={handleInitiate}
                disabled={!deviceName || isInitiating}
                className={cn(
                  "w-full px-4 py-2 rounded-md font-medium transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isInitiating ? (
                  <>
                    <ReloadIcon className="h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  'Start Pairing'
                )}
              </button>
            </div>
          ) : pairingState.sessionId ? (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md text-center">
                <p className="text-sm font-medium mb-2">
                  Check the server console for your pairing code
                </p>
                {pairingState.timeRemaining > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Code expires in {formatTime(pairingState.timeRemaining)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="pairing-code" className="text-sm font-medium">
                  Enter Pairing Code
                </label>
                <input
                  id="pairing-code"
                  type="text"
                  value={pairingCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && pairingCode.length === (pairingStatus?.codeLength || 6)) {
                      handleComplete();
                    }
                  }}
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-md bg-background uppercase"
                  placeholder="XXXXXX"
                  maxLength={pairingStatus?.codeLength || 6}
                  autoFocus
                />
              </div>

              {pairingState.error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {pairingState.error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPairingCode('');
                    setShowInstructions(true);
                    cancelPairing();
                  }}
                  className="flex-1 px-4 py-2 rounded-md font-medium transition-colors border hover:bg-accent"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={
                    pairingCode.length !== (pairingStatus?.codeLength || 6) || 
                    isCompleting
                  }
                  className={cn(
                    "flex-1 px-4 py-2 rounded-md font-medium transition-colors",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {isCompleting ? (
                    <>
                      <ReloadIcon className="h-4 w-4 animate-spin" />
                      Pairing...
                    </>
                  ) : (
                    'Complete Pairing'
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}