import { promisify } from 'util';
import { exec as defaultExec } from 'child_process';
import * as dotenv from 'dotenv';
import { database, Test } from './utils/database-client';
import { logger } from './utils/logger';

dotenv.config();
const exec = promisify(defaultExec);

export interface SpeedtestResult {
  type: string;
  timestamp: string;
  ping: SpeedtestPing;
  download: SpeedtestBandwidthResult;
  upload: SpeedtestBandwidthResult;
  packetLoss: number;
  isp: string;
  interface: SpeedtestInterface;
  server: SpeedtestServer;
  result: SpeedtestResultInfo;
}

interface SpeedtestBandwidthResult {
  bandwidth: number;
  bytes: number;
  elapsed: number;
}

interface SpeedtestInterface {
  internalIp: string;
  name: string;
  macAddr: string;
  isVpn: boolean;
  externalIp: string;
}

interface SpeedtestPing {
  jitter: number;
  latency: number;
}

interface SpeedtestResultInfo {
  id: string;
  url: string;
}

interface SpeedtestServer {
  id: number;
  name: string;
  location: string;
  country: string;
  host: string;
  port: number;
  ip: string;
}

export const mapSpeedtestResult = (test: SpeedtestResult): Omit<Test, 'id'> => ({
  timestamp: new Date(test.timestamp),
  jitter: test.ping.jitter,
  latency: test.ping.latency,
  downloadBandwidth: test.download.bandwidth,
  downloadBytes: test.download.bytes,
  downloadElapsed: test.download.elapsed,
  uploadBandwidth: test.upload.bandwidth,
  uploadBytes: test.upload.bytes,
  uploadElapsed: test.upload.elapsed,
  packetLoss: test.packetLoss,
  isp: test.isp,
  interfaceName: test.interface.name,
  externalIp: test.interface.externalIp,
  serverName: test.server.name,
  serverId: test.server.id,
  serverIp: test.server.ip,
  resultId: test.result.id,
  resultUrl: test.result.url,
});

// ? account for different network-card-names for dev and prod-env
const networkInterface = process.env.NETWORK_INTERFACE ?? 'eth0';
const speedtestBin = process.env.SPEEDTEST_BINARY ?? '/usr/local/bin/speedtest';

export async function run(): Promise<void> {
  try {
    const { stdout, stderr } = (await exec(
      `${speedtestBin} --interface=${networkInterface} --progress=no --format=json-pretty --server-id=28622`,
      {
        cwd: __dirname,
        shell: '/bin/bash',
      },
    )) as { stdout: string; stderr: string };

    if (stderr) {
      throw new Error('Could not run speedtest');
    }

    const parsed = JSON.parse(stdout) as SpeedtestResult;

    await database.test.create({ data: mapSpeedtestResult(parsed) });

    logger.debug(`Created new speedtest-record`);
  } finally {
    await database.$disconnect();
  }
}
