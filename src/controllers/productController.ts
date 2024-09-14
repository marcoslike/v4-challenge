import { ProductRepository } from '../repositories/productRepository';
import { ElasticService } from '../services/elasticService';
import { Request, Response } from 'express';
import { IProduct } from '../interfaces/product';
import { INewProduct } from '../interfaces/newProduct';

export const getProducts = async (req: Request, res: Response, productRepo: ProductRepository) => {
  try {
    const products = await productRepo.findAll();
    console.log('Products from DB:', products);  // Verifique se os dados estão corretos aqui
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

export const getProductByCode = async (req: Request, res: Response, productRepo: ProductRepository) => {
  try {
    const product = await productRepo.findByCode(req.params.code);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o produto' });
  }
};

export const createProduct = async (req: Request, res: Response, productRepo: ProductRepository, elasticService: ElasticService) => {
  try {
    const { code, name } = req.body;

    // Verifica se o nome está presente
    if (!name) {
      return res.status(400).json({ error: 'O campo "name" é obrigatório.' });
    }

    // Verifica se o produto com o mesmo código já existe
    const existingProduct = await productRepo.findByCode(code);
    if (existingProduct) {
      return res.status(400).json({ error: 'Código de produto duplicado. Use um código diferente.' });
    }

    const product = await productRepo.save(req.body);

    // Indexa o produto no Elasticsearch
    try {
      await elasticService.indexProduct(product);
    } catch (error) {
      console.error('Erro ao indexar o produto no Elasticsearch:', error);
    }

    return res.status(201).json(product);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return res.status(500).json({ error: 'Erro ao criar produto' });
  }
};

export const updateProduct = async (req: Request, res: Response, productRepo: ProductRepository, elasticService: ElasticService) => {
  try {
    const updatedProduct = await productRepo.update(req.params.code, req.body);

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    try {
      await elasticService.updateProduct(updatedProduct as IProduct);
    } catch (error) {
      if (error instanceof Error && error.message === 'Documento não encontrado no Elasticsearch.') {
        console.warn('Produto não encontrado no Elasticsearch, mas atualizado no MongoDB.');
      } else {
        throw error;
      }
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
};

export const deleteProduct = async (req: Request, res: Response, productRepo: ProductRepository, elasticService: ElasticService) => {
  try {
    const deletedProduct = await productRepo.delete(req.params.code);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    try {
      await elasticService.deleteProduct(deletedProduct._id); // Deletar do Elasticsearch
    } catch (error) {
      if (error instanceof Error && error.message === 'Documento não encontrado no Elasticsearch.') {
        console.warn('Produto não encontrado no Elasticsearch para deletar, mas deletado do MongoDB.');
      } else {
        throw error;
      }
    }

    return res.status(200).json(deletedProduct);
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};
