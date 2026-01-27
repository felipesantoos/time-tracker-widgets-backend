import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { logger } from './infra/logging/Logger';
import { errorHandler } from './apps/api/middleware/errorHandler';
import { requestId } from './apps/api/middleware/requestId';

// Routes
import apiRouter from './apps/api/routes/router';

const app = express();

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Time Tracker API',
      version: '1.0.0',
      description: 'API documentation for the Time Tracker Widgets Backend',
    },
    servers: [
      {
        url: `http://localhost:${env.port || 3001}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/apps/api/handlers/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Global middlewares
app.use(requestId);
app.use(pinoHttp({
  logger,
  genReqId: (req: any) => req.id,
  customLogLevel: (_req: any, res: any, err: any) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req: any) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
    }),
  },
}));
app.use(cors({
  origin: env.corsOrigin || '*',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRouter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler (must be the last middleware)
app.use(errorHandler);

const PORT = env.port || 3001;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${env.nodeEnv}`);
});
