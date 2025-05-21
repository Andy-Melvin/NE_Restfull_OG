import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth';
import parkingRoutes from './routes/parking';
import carRoutes from './routes/car';
import reportRoutes from './routes/report';

const app = express();

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/parking', parkingRoutes);
app.use('/api/v1/cars', carRoutes);
app.use('/api/v1/reports', reportRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Parking System API',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

// Swagger setup
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));

// Error handling
app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
