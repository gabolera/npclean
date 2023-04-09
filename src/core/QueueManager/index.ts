export interface QueueManager {
  connect(): Promise<QueueManager>
  send(queue: string, msg: any, options?: any): Promise<void>
  consumer(queue: string, onMessage: (decoded: any, originalMessage?: any) => void): void
  ack(data: any): Promise<void>
  disconnect(): Promise<void>
}

export namespace QueueManager{
  export type Options = {
    prefetch?: number,
    queue: string,
  }
}