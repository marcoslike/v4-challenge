import mongoose from 'mongoose';

const connectToDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fitness-foods';  // Certifique-se de ajustar a URI corretamente
    await mongoose.connect(mongoURI, {
      connectTimeoutMS: 10000, // Definindo o tempo limite de 10 segundos
    });
    console.log('Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1); // Encerra a aplicação em caso de falha
  }
};

// Exporta a função para uso em outros arquivos
export default connectToDatabase;
