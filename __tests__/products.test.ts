import request from 'supertest';
import mongoose from 'mongoose';
import esClient from '../src/config/elasticsearch';
import { ProductModel } from '../src/models/product';
import { IProduct } from '../src/interfaces/product';
import { app } from '../src/app';
import { ProductRepository } from '../src/repositories/productRepository';
import { ElasticService } from '../src/services/elasticService';

const API_KEY = process.env.API_KEY || '123456';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/fitness-foods-test');
    } catch (error) {
      console.error('Erro ao conectar ao MongoDB:', error);
      process.exit(1);
    }
  }
});

afterEach(() => {
  jest.resetAllMocks();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (esClient.close) {
    await esClient.close();
  }
});

beforeEach(async () => {
  await ProductModel.deleteMany({});
  await request(app)
    .post('/api/products')
    .set('x-api-key', API_KEY)
    .send({ code: '001', product_name: 'Test Product', status: 'draft' });
});

describe('App Initialization and Products API', () => {
  it('should return a success message from the root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('API está rodando!');
  });

  it('should return 403 if no API key is provided', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error', 'Chave da API inválida');
  });

  it('should return 200 for a valid API key', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('x-api-key', API_KEY);
    expect(res.statusCode).toEqual(200);
  });
  
  it('should create a new product', async () => {
    const res = await request(app)
      .post('/api/products')  // Altere para '/api/products'
      .set('x-api-key', API_KEY)
      .send({
        code: '002',
        name: 'Another Product',  // Certifique-se de passar o campo "name"
        status: 'draft',
      });
  
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('code', '002');
  });
    
  it('should fetch all products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('x-api-key', API_KEY);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('products');
  });

  it('should return 500 if there is an error fetching products', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(ProductModel, 'find').mockImplementationOnce(() => {
      throw new Error('Database error');
    });
    const res = await request(app)
      .get('/api/products')
      .set('x-api-key', API_KEY);
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error', 'Erro ao buscar produtos');
    consoleErrorSpy.mockRestore();
  });

  const productRepository = new ProductRepository();

  it('should return null when product is not found for update', async () => {
    jest.spyOn(ProductModel, 'findOne').mockResolvedValueOnce(null);
    const product = await productRepository.findByCode('invalid-code');
    expect(product).toBeNull();
  });

  const elasticService = new ElasticService();

  it('should throw an error if product is invalid during indexing', async () => {
    const invalidProduct = {} as IProduct;
    await expect(elasticService.indexProduct(invalidProduct)).rejects.toThrow('Produto inválido, sem código ou sem ID.');
  });

  it('should return 500 if there is an error while creating a product', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(ProductModel.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database error');
    });
    const res = await request(app)
      .post('/api/products')  // Certifique-se de que a rota esteja correta
      .set('x-api-key', API_KEY)
      .send({ code: '003', name: 'Error Product', status: 'draft' });  // Use "name" ao invés de "product_name"
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error', 'Erro ao criar produto');
    consoleErrorSpy.mockRestore();
  });  

  it('should return 404 if product is not found', async () => {
    const res = await request(app)
      .get('/api/products/999')
      .set('x-api-key', API_KEY);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error', 'Produto não encontrado');
  });
});
