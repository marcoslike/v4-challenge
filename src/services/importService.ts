import axios from 'axios';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import readline from 'readline';
import { ProductService } from './productService';

const TMP_DIR = path.resolve(__dirname, '../../tmp');

// Cria o diretório temporário se não existir
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

const getLatestFile = async (): Promise<string> => {
  try {
    const indexResponse = await axios.get('https://challenges.coode.sh/food/data/json/index.txt');
    const files = indexResponse.data.split('\n').filter(Boolean); // Remove linhas vazias
    const latestFile = files[files.length - 1]; // Obtém o arquivo mais recente
    console.log(`Arquivo mais recente: ${latestFile}`);
    return latestFile;
  } catch (error) {
    throw new Error('Erro ao obter o arquivo mais recente: ' + (error as Error).message);
  }
};

export const importProductsService = async () => {
  try {
    const startTime = Date.now();  // Marca o início do processo
    const latestFile = await getLatestFile();
    const gzFileUrl = `https://challenges.coode.sh/food/data/json/${latestFile}`;
    const gzFilePath = path.join(TMP_DIR, 'products.json.gz');

    // Baixar o arquivo .gz
    const response = await axios({
      method: 'GET',
      url: gzFileUrl,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(gzFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Descompactar e processar o arquivo JSON linha por linha
    const input = fs.createReadStream(gzFilePath);
    const gunzip = zlib.createGunzip();
    const jsonStream = readline.createInterface({
      input: input.pipe(gunzip),
      output: process.stdout,
      terminal: false
    });

    console.log('Processando o arquivo JSON...');

    let count = 0;
    const totalProducts = 100;  // Limite de 100 produtos

    for await (const line of jsonStream) {
      try {
        const productData = JSON.parse(line); // Processa cada linha como um produto

        // Verifica se o produto tem código válido
        if (!productData.code) {
          console.error(`Produto sem código ignorado: ${JSON.stringify(productData)}`);
          continue;
        }

        const productStartTime = Date.now();  // Tempo de início do processamento de cada produto
        console.log(`Processando produto: ${productData.code}`);

        // Passa os dados diretamente para o ProductService para saneamento e salvamento
        await ProductService.createProduct(productData);

        const productEndTime = Date.now();
        const productProcessingTime = (productEndTime - productStartTime) / 1000;  // Tempo em segundos
        console.log(`Produto ${productData.code} processado em ${productProcessingTime.toFixed(2)} segundos`);

        count++;
        const progress = (count / totalProducts) * 100;
        console.log(`Progresso: ${progress.toFixed(2)}% (${count}/${totalProducts})`);

        if (count >= totalProducts) break; // Limitar a 100 produtos
      } catch (error) {
        console.error('Erro ao processar produto:', error);
      }
    }

    const endTime = Date.now();
    const totalProcessingTime = (endTime - startTime) / 1000;  // Tempo total em segundos
    console.log(`Importação concluída com sucesso! Total de produtos processados: ${count}`);
    console.log(`Tempo total de importação: ${totalProcessingTime.toFixed(2)} segundos`);
  } catch (error) {
    console.error('Erro ao importar os produtos:', (error as Error).message);
  }
};
