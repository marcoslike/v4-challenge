import cron from 'node-cron';
import { importProductsService } from '../services/importService';
import connectDB from './db'; // Conectar ao banco de dados

export const scheduleCronJob = async () => {
  // Conectar ao banco de dados antes de iniciar a tarefa cron
  await connectDB();

  // Agenda a tarefa cron para ser executada às 3:00 AM no fuso horário correto
  cron.schedule('0 3 * * *', async () => {
    console.log('Iniciando a importação diária de produtos...');

    try {
      await importProductsService(); // Executa o serviço de importação
      console.log('Importação diária concluída.');
    } catch (error) {
      console.error('Erro durante a importação diária:', error);
    }
  }, {
    timezone: "America/Sao_Paulo" // Ajuste para o fuso horário apropriado
  });

  console.log('Cron job agendado para rodar todos os dias às 3:00 AM (Horário de São Paulo)');
};

// NÃO CHAME O `importProductsService` DIRETAMENTE AQUI. Só agende a tarefa.
scheduleCronJob();
