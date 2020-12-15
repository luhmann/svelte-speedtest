import path from 'path';
import fs from 'fs';
import * as glob from 'glob';
import { logger } from './utils/logger';
import { database } from './utils/database-client';
import { mapSpeedtestResult, SpeedtestResult } from './run-speedtest';

const TEST_BASE_PATH = path.join(__dirname, '..', '..', 'speedtests');

const loadTestRecords = () => {
  const fileNames = glob.sync('*.{json,log}', {
    cwd: TEST_BASE_PATH,
  });

  // TODO: sync import will become too slow - switch to direct db import
  const files: SpeedtestResult[] = fileNames
    .map((fileName) => fs.readFileSync(path.join(TEST_BASE_PATH, fileName), 'utf-8'))
    .map((item) => JSON.parse(item) as SpeedtestResult);

  return files;
};

async function importData() {
  const existingDatasets = new Set(
    (await database.test.findMany({ select: { timestamp: true } })).map((row) => row.timestamp.toISOString()),
  );
  logger.info(`Found ${existingDatasets.size} existing speedtest-records`);

  const testResults = loadTestRecords().filter((item) => !existingDatasets.has(new Date(item.timestamp).toISOString()));
  logger.info(`Found ${testResults.length} new speedtest-records`);

  const data = testResults.map((result) => mapSpeedtestResult(result));

  for (const test of data) {
    logger.debug(`Importing ${test.timestamp.toISOString()}`);
    await database.test.create({ data: test });
  }
  logger.info(`New speedtest-records count: ${await database.test.count()}`);
}

void (async function main() {
  try {
    await importData();
  } finally {
    await database.$disconnect();
  }
})();
