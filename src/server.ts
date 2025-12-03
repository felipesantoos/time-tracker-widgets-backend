import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Rotas
import projectsRoutes from './modules/projects/routes';
import sessionsRoutes from './modules/sessions/routes';
import reportsRoutes from './modules/reports/routes';
import settingsRoutes from './modules/settings/routes';
import tokensRoutes from './modules/tokens/routes';

const app = express();

// Middlewares globais
app.use(cors({
  origin: env.corsOrigin || '*',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/projects', projectsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/tokens', tokensRoutes);

// Error handler (deve ser o último middleware)
app.use(errorHandler);

const PORT = env.port || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${env.nodeEnv}`);
});

