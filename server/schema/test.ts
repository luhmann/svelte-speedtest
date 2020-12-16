export const measurementSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    timestamp: {
      type: 'string',
      format: 'date-time',
    },
    jitter: {
      type: 'number',
    },
    latency: {
      type: 'number',
    },
    downloadBandwidth: {
      type: 'number',
    },
    downloadBytes: {
      type: 'number',
    },
    downloadElapsed: {
      type: 'number',
    },
    uploadBandwidth: {
      type: 'number',
    },
    uploadBytes: {
      type: 'number',
    },
    uploadElapsed: {
      type: 'number',
    },
    packetLoss: {
      type: 'number',
    },
    isp: {
      type: 'string',
    },
    interfaceName: {
      type: 'string',
    },
    externalIp: {
      type: 'string',
    },
    serverName: {
      type: 'string',
    },
    serverId: {
      type: 'number',
    },
    serverIp: {
      type: 'string',
    },
    resultId: {
      type: 'string',
    },
    resultUrl: {
      type: 'string',
    },
  },
  required: [
    'id',
    'timestamp',
    'jitter',
    'latency',
    'downloadBandwidth',
    'downloadBytes',
    'downloadElapsed',
    'uploadBandwidth',
    'uploadBytes',
    'uploadElapsed',
    'packetLoss',
    'isp',
    'interfaceName',
    'externalIp',
    'serverName',
    'serverId',
    'serverIp',
    'resultId',
    'resultUrl',
  ],
  additionalProperties: false,
};
