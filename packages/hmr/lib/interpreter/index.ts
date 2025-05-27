import type { SerializedMessage, WebSocketMessage } from '../types';
import { DONE_UPDATE } from '../constant';

export default class MessageInterpreter {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static send(message: WebSocketMessage): SerializedMessage {
    return JSON.stringify(message);
  }

  static receive(serializedMessage: SerializedMessage): WebSocketMessage {
    try {
      return JSON.parse(serializedMessage);
    } catch (error) {
      // Handle non-JSON messages (like "test" from Chrome extension)
      console.log(`Received non-JSON message: ${serializedMessage}`);
      return {
        type: DONE_UPDATE,
      };
    }
  }
}
