import amqp, { Channel } from "amqplib"

export class RabbitMQ {
  private _channel?: Channel
  private _assertQueueSettings?: any = {}
  private _hostRabbit: string | undefined = undefined

  constructor(config: RabbitMQ.Config) {
    //prettier-ignore
    this._hostRabbit = `amqp://${config.user}:${config.password}@${config.host}:${config.port}${config.vhost ? "/" + config.vhost : ""}`;
  }

  public get channel(): Channel {
    const channel: any = this._channel
    return channel
  }

  setAssertQueueSettings(config: any): void {
    this._assertQueueSettings = config
  }

  async connect(): Promise<RabbitMQ> {
    if (!this._channel) {
      if (!this._hostRabbit) {
        throw new Error("Constructor configuration is not defined!")
      }
      try {
        const connection = await amqp.connect(this._hostRabbit)
        this._channel = await connection.createChannel()
      } catch (err: any) {
        console.log("[RabbitMQ] Tentando reconectar", err)
        return await this.connect()
      }
    }
    return this
  }

  async send(queue: string, data: any, options: any = {}): Promise<void> {
    let msg = JSON.stringify(data)
    try {
      await this.channel.assertQueue(queue, this._assertQueueSettings)
      this.channel.sendToQueue(queue, Buffer.from(msg), options)
    } catch (err: any) {
      throw new Error(
        "Erro ao enviar mensagem para o rabbit " + msg + " - " + err.toString()
      )
    }
  }

  consumer(
    queue: string,
    onMessage: (decoded: any, originalMessage?: any) => void
  ): void {
    this.channel
      .assertQueue(queue, this._assertQueueSettings)
      .then((res: any) => {
        this.channel.consume(queue, (data: any) => {
          onMessage(data.content.toString(), data)
        })
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  async ack(data: any): Promise<void> {
    this.channel.ack(data)
  }

  async disconnect(): Promise<void> {
    await this.channel.close()
  }
}

namespace RabbitMQ {
  export type Config = {
    user: string
    password: string
    host: string
    port: number
    vhost: string
  }
}
