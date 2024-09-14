import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Open Food Facts API',
      version: '1.0.0',
      description: 'API para importar e gerenciar produtos da Open Food Facts',
    },
  },
  apis: ['./src/routes/*.ts'], // Caminho para os arquivos onde as rotas estão documentadas
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
