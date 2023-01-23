import parser from '@asyncapi/parser'
import { version } from '../version.js'

export default parser.parse(`
asyncapi: 2.1.0
info:
  title: WASP Web Sockets Reading Service
  version: ${version}
  description: 'Subscribe to reading updates for specific things and datasets.'
  license:
    name: Apache 2.0
    url: 'https://www.apache.org/licenses/LICENSE-2.0'
servers:
  public:
    url: 'http://localhost:{port}/v1'
    protocol: wss
    description: Public server available without authorization. Once the socket is open you can subscribe to a public channel by sending a subscribe request message. Authentication/authorization is handled at the cluster level.
    variables:
      port:
        description: Websocket connection is available through port 3000.
        default: '3000'
defaultContentType: application/json
channels:
  'thing/{thingId}/dataset/{datasetId}/reading':
    description: The topic on which measured values may be produced and consumed.
    parameters:
      thingId:
        $ref: '#/components/parameters/thingId'
      datasetId:
        $ref: '#/components/parameters/datasetId'
    subscribe:
      summary: >-
        Receive information about a particular thing's dataset.
      operationId: receiveDatasetReading
      message:
        $ref: '#/components/messages/reading'
components:
  messages:
    reading:
      name: reading
      title: Reading
      summary: >-
        JSON payload for a specific dataset.
      contentType: application/json
      payload:
        $ref: '#/components/schemas/readingPayload'
  schemas:
    readingPayload:
      type: object
      properties:
        timestamp:
          type: string
          format: date-time
          example: "2021-09-22T07:59:35.925Z"
          description: Timestamp of reading.
        value:
          type: number
          example: 56897456
          description: JSON encoding of reading value.
        dataset:
          type: object
          properties:
            thingId:
              type: string
              description: 'The ID of the thing.'
              example: '273d814a-e115-4b88-b264-bb2033de21f7'
            type:
              type: string
              description: 'Type of the dataset.'
              example: 'acc_active_energy_delivered_wh'
            label:
              type: string
              example: 'Schneider5111-id1'
              description: 'The label of the dataset.'
  parameters:
    thingId:
      description: The ID of the thing.
      schema:
        type: string
    datasetId:
      description: The ID of the dataset.
      schema:
        type: string
        `)
