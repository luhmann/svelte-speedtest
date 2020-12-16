import { FastifyError, FastifyInstance, FastifyServerOptions } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import { measurementSchema } from '../schema/test';
import { database } from '../utils/database-client';

const QuerySchema = Type.Object({
  since: Type.String({ format: 'date-time' }),
});

type QuerySchema = Static<typeof QuerySchema>;

export default (app: FastifyInstance, options: FastifyServerOptions, done: (error?: FastifyError) => void): void => {
  const measurementOptions = {
    schema: {
      querystring: QuerySchema,
      response: {
        200: {
          type: 'array',
          items: measurementSchema,
          maxItems: 10_000, //TODO: imagined as sanity-check does not work as expected, check
        },
      },
    },
  };
  app.get<{ Querystring: QuerySchema }>('/measurements', measurementOptions, async (request) => {
    console.log(request.query.since);
    const sinceParameter = new Date(request.query.since);
    const result = await database.test.findMany({ where: { timestamp: { gt: sinceParameter } } });

    return result;
  });

  done();
};
