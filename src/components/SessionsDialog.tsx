import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon, TrashIcon, CheckIcon } from '@radix-ui/react-icons';
import { usePairing } from '@/hooks/usePairing';
import { cn } from '@/lib/utils';

interface SessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionsDialog({ open, onOpenChange }: SessionsDialogProps) {
  const { sessions, sessionInfo, revokeSession } = usePairing();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMs < 0) return 'Expired';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] overflow-hidden">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Active Sessions
          </Dialog.Title>
          
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {sessions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No active sessions
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    session.current ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {session.deviceName}
                        </h4>
                        {session.current && (
                          <span className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            <CheckIcon className="h-3 w-3" />
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <p>Created: {formatDate(session.createdAt)}</p>
                        <p>Last used: {formatDate(session.lastUsedAt)}</p>
                        <p>Expires in: {formatExpiry(session.expiresAt)}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <button
                        onClick={() => revokeSession(session.id)}
                        className="p-2 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title="Revoke session"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Sessions are automatically removed when they expire
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}