import { Channel } from "amqplib";
export declare class RabbitMQ {
    private _channel?;
    private _assertQueueSettings?;
    private _hostRabbit;
    constructor(config: RabbitMQ.Config);
    get channel(): Channel;
    setAssertQueueSettings(config: any): void;
    connect(): Promise<RabbitMQ>;
    send(queue: string, data: any, options?: any): Promise<void>;
    consumer(queue: string, onMessage: (decoded: any, originalMessage?: any) => void): void;
    ack(data: any): Promise<void>;
    disconnect(): Promise<void>;
}
declare namespace RabbitMQ {
    type Config = {
        user: string;
        password: string;
        host: string;
        port: number;
        vhost: string;
    };
}
export {};
