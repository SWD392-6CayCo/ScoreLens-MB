import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type MessageCallback = (message: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Record<string, StompSubscription> = {};

  connect(onConnectCallback?: () => void) {
    if (this.client?.active) return;

    const socket = new SockJS(process.env.EXPO_PUBLIC_SOCKET_ENDPOINT!, null, {
      transports: ["websocket"],
    });

    this.client = new Client({
      webSocketFactory: () => socket as any, // 👈 cần ép kiểu nếu bị lỗi type ở RN
      debug: (str: string) => console.log("STOMP: " + str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ WebSocket connected");
        if (onConnectCallback) {
          onConnectCallback();
        }
      },
      onStompError: (frame) => {
        console.error("❌ STOMP error: ", frame.headers["message"], frame.body);
      },
    });

    this.client.activate();
  }

  subscribe(destination: string, callback: MessageCallback) {
    if (!this.client?.connected) {
      console.warn("WebSocket not connected yet.");
      return;
    }

    if (this.subscriptions[destination]) {
      console.warn(`Already subscribed to ${destination}`);
      return;
    }

    console.log("📬 Subscribed to:", destination);

    const subscription = this.client.subscribe(destination, (msg: IMessage) => {
      try {
        // Parse JSON nếu message là string
        const parsedMessage =
          typeof msg.body === "string" ? JSON.parse(msg.body) : msg.body;
        console.log("📨 WebSocket parsed message:", parsedMessage);
        callback(parsedMessage);
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
        // Fallback: gửi raw message
        callback(msg.body);
      }
    });

    this.subscriptions[destination] = subscription;
  }

  unsubscribe(destination: string) {
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
      delete this.subscriptions[destination];
    }
  }

  send(destination: string, message: any) {
    if (this.client?.connected) {
      this.client.publish({ destination, body: JSON.stringify(message) });
    } else {
      console.warn("Cannot send, not connected");
    }
  }

  disconnect() {
    this.client?.deactivate();
    this.subscriptions = {};
    this.client = null;
    console.log("✅ WebSocket disconnected");
  }

  get isConnected() {
    return this.client?.connected || false;
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
