import { Request, Response, NextFunction } from 'express';
import { apiKeyMiddleware } from '../src/middlewares/apiKeyMiddleware';

describe('apiKeyMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  // Configura os mocks para req, res, e next antes de cada teste
  beforeEach(() => {
    req = {
      headers: {}, // Inicializa headers como um objeto vazio
    };
    res = {
      status: jest.fn().mockReturnThis(), // Mock do método status do response
      json: jest.fn(), // Mock do método json do response
    };
    next = jest.fn(); // Mock da função next
  });

  it('should return 403 if no API key is provided', () => {
    apiKeyMiddleware(req as Request, res as Response, next);

    // Verifica se o status 403 foi retornado e a mensagem de erro correta foi enviada
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Chave da API inválida' });
    expect(next).not.toHaveBeenCalled(); // Certifica-se de que next não foi chamado
  });

  it('should return 403 if an invalid API key is provided', () => {
    req.headers!['x-api-key'] = 'wrong-api-key'; // Define uma chave API inválida
    
    apiKeyMiddleware(req as Request, res as Response, next);

    // Verifica se o status 403 foi retornado e a mensagem de erro correta foi enviada
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Chave da API inválida' });
    expect(next).not.toHaveBeenCalled(); // Certifica-se de que next não foi chamado
  });

  it('should call next if a valid API key is provided', () => {
    req.headers!['x-api-key'] = process.env.API_KEY || '123456'; // Define uma chave API válida

    apiKeyMiddleware(req as Request, res as Response, next);

    // Verifica se next foi chamado e nenhuma resposta foi enviada
    expect(next).toHaveBeenCalled(); 
    expect(res.status).not.toHaveBeenCalled(); 
    expect(res.json).not.toHaveBeenCalled();
  });
});