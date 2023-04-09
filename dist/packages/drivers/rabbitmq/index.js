"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
class RabbitMQ {
    constructor(config) {
        this._assertQueueSettings = {};
        this._hostRabbit = undefined;
        //prettier-ignore
        this._hostRabbit = `amqp://${config.user}:${config.password}@${config.host}:${config.port}${config.vhost ? "/" + config.vhost : ""}`;
    }
    get channel() {
        const channel = this._channel;
        return channel;
    }
    setAssertQueueSettings(config) {
        this._assertQueueSettings = config;
    }
    async connect() {
        if (!this._channel) {
            if (!this._hostRabbit) {
                throw new Error("Constructor configuration is not defined!");
            }
            try {
                const connection = await amqplib_1.default.connect(this._hostRabbit);
                this._channel = await connection.createChannel();
            }
            catch (err) {
                console.log("[RabbitMQ] Tentando reconectar", err);
                return await this.connect();
            }
        }
        return this;
    }
    async send(queue, data, options = {}) {
        let msg = JSON.stringify(data);
        try {
            await this.channel.assertQueue(queue, this._assertQueueSettings);
            this.channel.sendToQueue(queue, Buffer.from(msg), options);
        }
        catch (err) {
            throw new Error("Erro ao enviar mensagem para o rabbit " + msg + " - " + err.toString());
        }
    }
    consumer(queue, onMessage) {
        this.channel
            .assertQueue(queue, this._assertQueueSettings)
            .then((res) => {
            this.channel.consume(queue, (data) => {
                onMessage(data.content.toString(), data);
            });
        })
            .catch((err) => {
            console.log(err);
        });
    }
    async ack(data) {
        this.channel.ack(data);
    }
    async disconnect() {
        await this.channel.close();
    }
}
exports.RabbitMQ = RabbitMQ;
