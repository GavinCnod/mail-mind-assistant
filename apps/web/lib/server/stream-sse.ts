/**
 * SSE (Server-Sent Events) streaming utilities
 */
import type { StreamEvent } from '@mailmind/contracts';

export function createSSEStream(): {
  stream: ReadableStream<Uint8Array>;
  encoder: TextEncoder;
  controller: ReadableStreamDefaultController<Uint8Array>;
} {
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  
  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
    },
  });
  
  return { stream, encoder, controller };
}

export function encodeSSEEvent(event: StreamEvent, encoder: TextEncoder): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}
