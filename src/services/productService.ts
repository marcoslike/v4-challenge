import { ProductRepository } from '../repositories/productRepository';
import { ElasticService } from '../services/elasticService';
import { IProduct } from '../interfaces/product';
import { INewProduct } from '../interfaces/newProduct';

const productRepo = new ProductRepository();
const elasticService = new ElasticService();

export const ProductService = {
  createProduct: async (data: any) => {
    // Verifica se o produto com o mesmo código já existe
    const existingProduct = await productRepo.findByCode(data.code);

    if (existingProduct) {
      console.log(`Produto com o código ${data.code} já existe. Ignorando inserção.`);
      // Se necessário, retorne o produto existente ou jogue uma exceção
      throw new Error(`Produto com o código ${data.code} já existe.`);
    }

    const nutriments = data.nutriments || {};
    
    const productForMongo: Omit<INewProduct, '_id'> = {
      code: data.code,
      name: data.name || 'Produto Desconhecido',
      nutriments: {
        energy_kj_100g: nutriments.energy_kj_100g ?? 0,
        fat_100g: nutriments.fat_100g ?? 0,
        sugars_100g: nutriments.sugars_100g ?? 0,
        proteins_100g: nutriments.proteins_100g ?? 0,
        salt_100g: nutriments.salt_100g ?? 0,
        saturated_fat_100g: nutriments.saturated_fat_100g ?? 0,
        energy_kcal_100g: nutriments.energy_kcal_100g ?? 0,
        carbohydrates_100g: nutriments.carbohydrates_100g ?? 0,
        sodium_100g: nutriments.sodium_100g ?? 0,
        fiber_100g: nutriments.fiber_100g ?? 0,
      },
      countries: data.countries ? data.countries.split(',') : [],
      image_url: data.image_url || '',
      imported_t: new Date(),
      status: 'draft',
    };

    // Salvar o produto no MongoDB
    const savedProduct = await productRepo.save(productForMongo as INewProduct);

    const productForElastic: IProduct = {
      _id: savedProduct._id, // Usamos o _id gerado pelo MongoDB
      ...productForMongo,
    };

    // Indexar no Elasticsearch
    const response = await elasticService.indexProduct(productForElastic);

    if (response.body && response.body.errors) {
      console.error('Erro ao indexar o produto:', response.body.errors);
      throw new Error('Erro ao indexar o produto no Elasticsearch.');
    } else {
      console.log('Produto indexado com sucesso:', response.body);
    }
    
    return savedProduct;
  },

  updateProductByCode: async (code: string, data: any) => {
    const sanitizedProduct: Partial<IProduct> = {
      ...data,
      name: data.name || 'Produto Desconhecido',
    };

    // Atualizar o produto no banco de dados
    const updatedProduct = await productRepo.update(code, sanitizedProduct);

    if (!updatedProduct) {
      throw new Error('Produto não encontrado.');
    }

    // Atualizar o produto no Elasticsearch
    await elasticService.updateProduct(updatedProduct);
    return updatedProduct;
  },
};
