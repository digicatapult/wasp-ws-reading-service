const { Kafka, logLevel: kafkaLogLevels } = require('kafkajs')
const logger = require('./logger')
const { KAFKA_BROKERS, KAFKA_LOG_LEVEL, KAFKA_READINGS_NOTIFICATIONS_TOPIC } = require('./env')

const setupReadingsConsumer = async ({ forwardParams }) => {
  const kafkaLogger = logger.child({ module: 'kafkajs-readings', level: 'error' })
  const logCreator = () => ({ label, log }) => {
    const { message } = log
    kafkaLogger[label.toLowerCase()]({
      message,
    })
  }

  const kafka = new Kafka({
    clientId: 'reading-streaming-service',
    brokers: KAFKA_BROKERS,
    logLevel: kafkaLogLevels[KAFKA_LOG_LEVEL.toUpperCase()],
    logCreator,
  })

  const consumer = kafka.consumer({ groupId: 'reading-streaming-service' })
  await consumer.connect()
  await consumer.subscribe({ topic: KAFKA_READINGS_NOTIFICATIONS_TOPIC, fromBeginning: false })
  await consumer
    .run({
      eachMessage: async ({ message: { key: datasetId, value } }) => {
        try {
          logger.info(`received: ${value} with datasetId: ${datasetId}`)
          forwardParams(Buffer.from(datasetId).toString(), JSON.parse(Buffer.from(value).toString()))
        } catch (err) {
          logger.warn(`Unexpected error processing payload. Error was ${err.message || err}`)
        }
      },
    })
    .then(() => {
      logger.info(`Kafka consumer has started`)
    })
    .catch((err) => {
      logger.fatal(`Kafka consumer could not start consuming. Error was ${err.message || err}`)
    })

  return {
    disconnect: async () => {
      try {
        await consumer.stop()
        await consumer.disconnect()
      } catch (err) {
        logger.warn(`Error disconnecting from kafka: ${err.message || err}`)
      }
    },
  }
}

module.exports = setupReadingsConsumer
