import express from 'express';
import connectDB from './config/db';  
import productRoutes from './routes/productRoutes'; 
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Caminho para o arquivo de documentação YAML (api.yml)
const apiSpecPath = path.join(__dirname, '../docs/api.yml');
const apiSpec = yaml.parse(fs.readFileSync(apiSpecPath, 'utf8'));

// Configurar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec));

// Conectar ao MongoDB
(async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Erro durante a conexão com MongoDB:', error);
    process.exit(1); 
  }
})();

// Registrar as rotas do produto
app.use('/api', productRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação disponível em http://localhost:${PORT}/api-docs`);
});
