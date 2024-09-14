import express from 'express';
import productRoutes from './routes/productRoutes';
import { apiKeyMiddleware } from './middlewares/apiKeyMiddleware';
import { setupSwagger } from './config/swagger';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();
connectDB();
const app = express();

// Middleware para JSON
app.use(express.json());

// Configurar Swagger
setupSwagger(app);

// Proteger as rotas com API Key
app.use('/api', apiKeyMiddleware, productRoutes);


// Rota para verificar o status da API

app.get('/', (req, res) => {
    res.send('API está rodando!');
});

export { app};
