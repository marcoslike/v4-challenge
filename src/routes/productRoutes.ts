import { Router } from 'express';
import {
  getProducts,
  getProductByCode,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { ProductRepository } from '../repositories/productRepository';
import { ElasticService } from '../services/elasticService';
import { apiKeyMiddleware } from '../middlewares/apiKeyMiddleware';  // Importando o middleware

const router = Router();
const productRepo = new ProductRepository();
const elasticService = new ElasticService();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         code:
 *           type: string
 *           description: Código único do produto
 *         name:
 *           type: string
 *           description: Nome do produto
 *         brands:
 *           type: string
 *           description: Marca do produto
 *         status:
 *           type: string
 *           description: Status do produto (draft, trash, published)
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retorna a lista de produtos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/products', apiKeyMiddleware, (req, res) => getProducts(req, res, productRepo));

/**
 * @swagger
 * /products/{code}:
 *   get:
 *     summary: Retorna um produto específico pelo código
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: O código do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produto não encontrado
 */
router.get('/products/:code', apiKeyMiddleware, (req, res) => getProductByCode(req, res, productRepo));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       500:
 *         description: Erro ao criar o produto
 */
router.post('/products', apiKeyMiddleware, (req, res) => createProduct(req, res, productRepo, elasticService));


/**
 * @swagger
 * /products/{code}:
 *   put:
 *     summary: Atualiza um produto pelo código
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: O código do produto a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produto não encontrado
 */
router.put('/products/:code', apiKeyMiddleware, (req, res) => updateProduct(req, res, productRepo, elasticService));

/**
 * @swagger
 * /products/{code}:
 *   delete:
 *     summary: Marca um produto como trash pelo código
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: O código do produto a ser marcado como trash
 *     responses:
 *       200:
 *         description: Produto marcado como trash
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produto não encontrado
 */
router.delete('/products/:code', apiKeyMiddleware, (req, res) => deleteProduct(req, res, productRepo, elasticService));

export default router;
