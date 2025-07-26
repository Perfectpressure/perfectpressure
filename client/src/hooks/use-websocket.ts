import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[ws] Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("[ws] Received:", message);

        switch (message.type) {
          case "site-setting-updated":
            // Invalidate site settings queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
            queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
            break;
          
          case "service-pricing-updated":
            // Invalidate service pricing queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: ["/api/admin/service-pricing"] });
            queryClient.invalidateQueries({ queryKey: ["/api/service-pricing"] });
            break;
          
          case "image-asset-updated":
            // Invalidate image asset queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: ["/api/admin/image-assets"] });
            queryClient.invalidateQueries({ queryKey: ["/api/image-assets"] });
            break;
          
          default:
            console.log("[ws] Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("[ws] Error parsing message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("[ws] WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("[ws] WebSocket connection closed");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return wsRef.current;
}