import { ElasticService } from '../src/services/elasticService';
import esClient from '../src/config/elasticsearch';
import { IProduct } from '../src/interfaces/product';

jest.mock('@config/elasticsearch', () => ({
  index: jest.fn(),
  update: jest.fn(),
}));

const elasticService = new ElasticService();

describe('ElasticService', () => {
  const validProduct = {
    _id: '12345',
    code: '001',
    name: 'Test Product',
    status: 'draft',
    imported_t: new Date(),
  } as unknown as IProduct; // Produto válido
  
  const invalidProduct = {
    _id: '',
    code: '',
    name: 'Invalid Product',
    status: 'draft',
    imported_t: new Date(),
  } as unknown as IProduct; // Produto inválido

  beforeEach(() => {
    jest.clearAllMocks(); // Limpar mocks antes de cada teste
  });

  // Teste para indexação bem-sucedida
  it('should index a product successfully', async () => {
    (esClient.index as jest.Mock).mockResolvedValueOnce({ result: 'created' });
    
    const result = await elasticService.indexProduct(validProduct);
    
    expect(result).toEqual({ result: 'created' });
    expect(esClient.index).toHaveBeenCalledWith({
      index: 'products',
      id: validProduct._id.toString(),
      body: {
        code: validProduct.code,
        name: validProduct.name,
        status: validProduct.status,
        imported_t: validProduct.imported_t,
      },
    });
  });

  // Teste para erro ao indexar produto inválido
  it('should throw an error when trying to index an invalid product', async () => {
    await expect(elasticService.indexProduct(invalidProduct)).rejects.toThrow('Produto inválido, sem código ou sem ID.');
  });

  // Teste para erro de falha no Elasticsearch durante a indexação
  it('should throw an error if Elasticsearch fails to index the product', async () => {
    (esClient.index as jest.Mock).mockRejectedValueOnce(new Error('Elasticsearch error'));
    
    await expect(elasticService.indexProduct(validProduct)).rejects.toThrow('Falha ao indexar o produto: Elasticsearch error');
  });

  // Teste para atualização bem-sucedida
  it('should update a product successfully', async () => {
    (esClient.update as jest.Mock).mockResolvedValueOnce({ result: 'updated' });

    const result = await elasticService.updateProduct(validProduct);
    
    expect(result).toEqual({ result: 'updated' });
    expect(esClient.update).toHaveBeenCalledWith({
      index: 'products',
      id: validProduct._id.toString(),
      body: {
        doc: {
          name: validProduct.name,
          status: validProduct.status,
        },
      },
    });
  });

  // Teste para erro ao atualizar produto inválido
  it('should throw an error when trying to update an invalid product', async () => {
    await expect(elasticService.updateProduct(invalidProduct)).rejects.toThrow('Produto inválido, sem código ou sem ID.');
  });

  // Teste para erro de falha no Elasticsearch durante a atualização
  it('should throw an error if Elasticsearch fails to update the product', async () => {
    (esClient.update as jest.Mock).mockRejectedValueOnce(new Error('Elasticsearch update error'));
    
    await expect(elasticService.updateProduct(validProduct)).rejects.toThrow('Falha ao atualizar o produto: Elasticsearch update error');
  });

  const missingFieldsProduct = {} as unknown as IProduct; // Produto com campos ausentes

  describe('Additional tests', () => {
    // Teste para erro com produto null ou undefined durante a indexação
    it('should throw an error if product is null or undefined during indexing', async () => {
      await expect(elasticService.indexProduct(undefined as any)).rejects.toThrow('Produto inválido, sem código ou sem ID.');
      await expect(elasticService.indexProduct(null as any)).rejects.toThrow('Produto inválido, sem código ou sem ID.');
    });

    // Teste para erro com produto null ou undefined durante a atualização
    it('should throw an error if product is null or undefined during updating', async () => {
      await expect(elasticService.updateProduct(undefined as any)).rejects.toThrow('Produto inválido, sem código ou sem ID.');
      await expect(elasticService.updateProduct(null as any)).rejects.toThrow('Produto inválido, sem código ou sem ID.');
    });

    // Teste para erro com produto com campos ausentes durante a indexação
    it('should throw an error if product has missing fields during indexing', async () => {
      await expect(elasticService.indexProduct(missingFieldsProduct)).rejects.toThrow('Produto inválido, sem código ou sem ID.');
    });

    // Teste para erro com produto com campos ausentes durante a atualização
    it('should throw an error if product has missing fields during updating', async () => {
      await expect(elasticService.updateProduct(missingFieldsProduct)).rejects.toThrow('Produto inválido, sem código ou sem ID.');
    });

    // Teste para erro genérico que não é instância de Error durante a indexação
    it('should handle non-Error exceptions during indexing', async () => {
      (esClient.index as jest.Mock).mockRejectedValueOnce('Unexpected error');

      await expect(elasticService.indexProduct(validProduct)).rejects.toThrow('Falha ao indexar o produto: Unexpected error');
    });

    // Teste para erro genérico que não é instância de Error durante a atualização
    it('should handle non-Error exceptions during updating', async () => {
      (esClient.update as jest.Mock).mockRejectedValueOnce('Unexpected update error');

      await expect(elasticService.updateProduct(validProduct)).rejects.toThrow('Falha ao atualizar o produto: Unexpected update error');
    });
  });
});
