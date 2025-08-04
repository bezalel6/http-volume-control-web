import { useEffect, useState } from "react";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { apiClient } from "@/api/client";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkConnection = async () => {
    setStatus("checking");
    try {
      await apiClient.health();
      setStatus("connected");
    } catch (e) {
      console.error(e);
      setStatus("disconnected");
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const sessionInfo = apiClient.getSessionInfo();
  const isAuthenticated = apiClient.isAuthenticated();

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        {status === "connected" ? (
          <CheckCircledIcon className="h-4 w-4 text-green-500" />
        ) : status === "disconnected" ? (
          <CrossCircledIcon className="h-4 w-4 text-destructive" />
        ) : (
          <UpdateIcon className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <span
          className={cn(
            "font-medium",
            status === "connected"
              ? "text-green-500"
              : status === "disconnected"
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        >
          {status === "connected"
            ? "Connected"
            : status === "disconnected"
            ? "Disconnected"
            : "Checking..."}
        </span>
      </div>
      {status === "connected" && isAuthenticated && sessionInfo && (
        <span className="text-muted-foreground">
          • {sessionInfo.deviceName}
        </span>
      )}
    </div>
  );
}
