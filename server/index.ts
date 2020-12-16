import fastify from 'fastify';
import cors from 'fastify-cors';
import speedTestRoutes from './routes/speedtest';

const app = fastify({ logger: true });

void app.register(cors, { origin: '*', methods: ['GET'] });
void app.register(speedTestRoutes, { prefix: 'v1' });

const start = async () => {
  try {
    await app.listen(3000);
    const address = app.server.address();
    const port = typeof address === 'string' ? address : address?.port;
    app.log.info(`server listening on ${String(port)}`);
  } catch (error) {
    app.log.error(error);
    throw error;
  }
};
void start();
