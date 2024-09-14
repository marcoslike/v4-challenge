import { ProductModel } from '../models/product';
import { IProduct } from '../interfaces/product';
import { INewProduct } from '../interfaces/newProduct';

export class ProductRepository {
  async findAll() {
    try {
      const products = await ProductModel.find();
      return products;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Erro ao buscar produtos');
    }
  }

  async findByCode(code: string): Promise<IProduct | null> {
    try {
      const product = await ProductModel.findOne({ code });
      if (!product) {
        console.error(`Produto com o código ${code} não encontrado.`);
        return null;
      }
      return product;
    } catch (error) {
      console.error('Erro ao buscar produto pelo código:', error);
      throw new Error('Erro ao buscar produto');
    }
  }

  async save(product: INewProduct) {
    try {
      // Criar uma nova instância do modelo sem incluir o _id
      const newProduct = new ProductModel(product);
      
      // O Mongoose vai gerar o _id automaticamente ao salvar
      await newProduct.save();
      return newProduct;
    } catch (error) {
      console.error('Erro ao salvar o produto:', error);
      throw new Error('Erro ao salvar o produto');
    }
  }
  async update(code: string, product: Partial<IProduct>): Promise<IProduct | null> {
    if (!code || typeof code !== 'string') {
      throw new Error('Código do produto inválido');
    }
  
    if (!product || typeof product !== 'object') {
      throw new Error('Dados do produto inválidos');
    }
  
    try {
      const updatedProduct = await ProductModel.findOneAndUpdate(
        { code },
        product,
        { new: true } // Retorna o documento atualizado
      );
  
      if (!updatedProduct) {
        console.warn(`Produto com código ${code} não encontrado`);
        return null; // Ou lançar um erro, se preferir
      }
  
      return updatedProduct;
    } catch (error) {
      if (error instanceof Error) {
        // O erro é uma instância da classe Error
        console.error('Erro ao atualizar o produto:', error.message);
        throw new Error('Erro ao atualizar o produto: ' + error.message);
      } else {
        // O erro não é uma instância da classe Error
        console.error('Erro desconhecido ao atualizar o produto:', error);
        throw new Error('Erro desconhecido ao atualizar o produto');
      }
    }
  }
  
  

  async delete(code: string) {
    try {
      const deletedProduct = await ProductModel.findOneAndUpdate(
        { code },
        { status: 'trash' },
        { new: true }
      );
      return deletedProduct;
    } catch (error) {
      console.error('Erro ao deletar o produto:', error);
      throw new Error('Erro ao deletar o produto');
    }
  }
}
