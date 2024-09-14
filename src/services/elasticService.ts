import { IProduct } from '../interfaces/product';
import esClient from '../config/elasticsearch';

export class ElasticService {
  // Método para indexar um produto no Elasticsearch
  async indexProduct(product: IProduct) {
    if (!product) {
      throw new Error('Produto inválido, sem código ou sem ID.');
    }
    if (!product._id || !product.code) {
      throw new Error('Produto inválido, sem código ou sem ID.');
    }

    try {
      const result = await esClient.index({
        index: 'products',
        id: product._id.toString(),
        body: {
          code: product.code,
          name: product.name,
          status: product.status,
          imported_t: product.imported_t,
        },
      });
      return result;
    } catch (error: any) {
      // Verifica se o erro é uma instância de Error, caso contrário, usa uma mensagem genérica
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error';
      throw new Error(`Falha ao indexar o produto: ${errorMessage}`);
    }
  }

  // Método para atualizar um produto no Elasticsearch
  async updateProduct(product: IProduct) {
    if (!product) {
      throw new Error('Produto inválido, sem código ou sem ID.');
    }
    if (!product._id || !product.code) {
      throw new Error('Produto inválido, sem código ou sem ID.');
    }

    try {
      const result = await esClient.update({
        index: 'products',
        id: product._id.toString(),
        body: {
          doc: {
            name: product.name,
            status: product.status,
          },
        },
      });
      return result;
    } catch (error: any) {
      // Verifica se o erro é uma instância de Error, caso contrário, usa uma mensagem genérica
      const errorMessage = error instanceof Error ? error.message : 'Unexpected update error';
      throw new Error(`Falha ao atualizar o produto: ${errorMessage}`);
    }
  }

  // Método para deletar um produto no Elasticsearch
  async deleteProduct(productId: string) {
    if (!productId) {
      throw new Error('ID do produto inválido.');
    }

    try {
      const result = await esClient.delete({
        index: 'products',
        id: productId,
      });
      return result;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected delete error';
      throw new Error(`Falha ao deletar o produto: ${errorMessage}`);
    }
  }
}
