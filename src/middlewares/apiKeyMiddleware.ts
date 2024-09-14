import { Request, Response, NextFunction } from 'express';

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key']; 
  const validApiKey = process.env.API_KEY || '123456'; 

  if (apiKey !== validApiKey) {
    return res.status(403).json({ error: 'Chave da API inválida' }); 
  }

  next(); 
};
