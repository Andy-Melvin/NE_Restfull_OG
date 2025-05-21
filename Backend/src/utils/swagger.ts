import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import YAML from 'yamljs';
import path from 'path';

// Load swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));

export function setupSwagger(app: Express) {
  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "API Documentation",
    customfavIcon: "/favicon.ico"
  }));

  // Serve swagger.json
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });
}
