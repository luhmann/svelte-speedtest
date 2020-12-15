import { FastifyError, FastifyInstance, FastifyServerOptions } from 'fastify';
import { measurementSchema, timestampSchema } from '../schema/test';
import { database } from '../utils/database-client';

interface MeasurementQuery {
  since: string;
}

export default (app: FastifyInstance, options: FastifyServerOptions, done: (error?: FastifyError) => void): void => {
  const measurementOptions = {
    schema: {
      querystring: {
        since: timestampSchema,
      },
      response: {
        200: {
          type: 'array',
          items: measurementSchema,
          maxItems: 10_000, //TODO: imagined as sanity-check does not work as expected, check
        },
      },
    },
  };
  app.get<{ Querystring: MeasurementQuery }>('/measurements', measurementOptions, async (request) => {
    const sinceParameter = new Date(request.query.since);
    const result = await database.test.findMany({ where: { timestamp: { gt: sinceParameter } } });

    return result;
  });

  done();
};
