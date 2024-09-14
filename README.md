# Fitness Foods LC - Open Food Facts API

## Descrição

Este projeto foi desenvolvido para a empresa **Fitness Foods LC** com o objetivo de permitir que nutricionistas revisem rapidamente as informações nutricionais de produtos alimentícios que os usuários publicam por meio de um aplicativo móvel. Os dados são obtidos do banco de dados aberto **Open Food Facts**, e a API foi projetada para lidar com importação, gerenciamento e busca de produtos.

## Funcionalidades
- **CRUD de Produtos**: Criação, leitura, atualização e exclusão de produtos alimentícios.
- **Sincronização com ElasticSearch**: Todos os produtos são indexados no **ElasticSearch** para buscas eficientes.
- **Importação de Produtos**: Importa dados de até 100 produtos da Open Food Facts por vez.
- **Autenticação com API Key**: Proteção dos endpoints sensíveis usando API Key.
- **Documentação com Swagger**: A API é documentada usando **OpenAPI 3.0 (Swagger)**.
- **Execução diária automática da importação**: Utiliza CRON para rodar a importação diariamente.
- **Testes Automatizados**: Todos os endpoints foram testados com **Jest** e **Supertest**.

## Tecnologias Utilizadas
- **Node.js** e **Express**: Framework de backend.
- **MongoDB**: Banco de dados NoSQL para armazenar os produtos.
- **ElasticSearch**: Utilizado para buscas rápidas e eficientes nos produtos.
- **Service Layer**: Implementado para isolar a lógica de negócio dos controladores.
- **Repository Pattern**: Gerencia a persistência dos dados no MongoDB.
- **Swagger**: Documentação interativa da API.
- **Docker**: Contêineres para a aplicação, MongoDB e ElasticSearch.
- **Jest** e **Supertest**: Testes automatizados.

## Instalação
### Pré-requisitos
- **Node.js** (v14 ou superior)
- **Docker** (para rodar a aplicação e os serviços como MongoDB e ElasticSearch)
- **npm** ou **yarn**

### Passos para Instalação
1. Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/fitness-foods-api.git
    cd fitness-foods-api
    ```

2. Instale as dependências do projeto:
    ```bash
    npm install
    ```

3. Configure as variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
    ```bash
    MONGO_URI=mongodb://localhost:27017/fitness-foods
    ELASTICSEARCH_HOST=http://localhost:9200
    API_KEY=123456  # Defina uma chave de API para proteger os endpoints
    ```

4. Execute o **Docker Compose** para subir os serviços de MongoDB e ElasticSearch:
    ```bash
    docker-compose up
5. Inicie o servidor de desenvolvimento:
    ```bash
    npm start
6. Acesse a documentação da API em:
    ```bash
    http://localhost:3000/api-docs
## Uso
### Endpoints da API
- `GET /api/products:` Lista todos os produtos com paginação.
- `GET /api/products/:code:` Busca um produto específico pelo código.
- `POST /api/products:` Cria um novo produto.
- `PUT /api/products/:code:` Atualiza um produto pelo código.
- `DELETE /api/products/:code:` Marca um produto como "trash".

Todos os endpoints, exceto o `GET /api-docs`, requerem uma **API Key** no cabeçalho:
`x-api-key: 123456`

### Executar Testes
Os testes verificam a funcionalidade dos endpoints CRUD, importação de produtos e integração com ElasticSearch e MongoDB.
- Para rodar os testes automatizados:
    ```bash
    npm start
### Exemplos de Requisições
Aqui estão alguns exemplos de requisições utilizando **cURL**:

1. #### Exemplo de GET para retornar todos os produtos:
    ```bash
    curl -X GET "http://localhost:3000/api/products" -H "x-api-key: 123456"
2. #### Exemplo de POST para criar um novo produto:
    ```bash
    curl -X POST "http://localhost:3000/api/products" -H "x-api-key: 123456" -H "Content-Type: application/json" -d '{
    "code": "123",
    "name": "Produto Exemplo",
    "status": "draft"
    }'
3. #### Exemplo de DELETE para marcar um produto como "trash":
    ```bash
    curl -X DELETE "http://localhost:3000/api/products/123" -H "x-api-key: 123456"
### CRON - Importação Automática
A importação de produtos do Open Food Facts é agendada para rodar todos os dias às 3h da manhã, utilizando **node-cron**. Para verificar a execução, veja os logs no terminal.

### Docker
A aplicação e os serviços MongoDB e ElasticSearch são executados em contêineres Docker.

- Para rodar a aplicação e os serviços:
    ```bash
    docker-compose up
- Para parar os contêineres:
    ```bash
    docker-compose down
## Desafios e Considerações

- **ElasticSearch** foi utilizado para busca eficiente de produtos, permitindo uma integração rápida e com grande capacidade de escalabilidade.
- A autenticação foi configurada usando uma **API Key** simples, mas isso pode ser aprimorado para soluções mais robustas, como OAuth ou JWT, dependendo da necessidade.
- O projeto foi estruturado utilizando **Domain-Driven Design (DDD)**, garantindo que a lógica de negócio esteja bem separada das camadas de infraestrutura e aplicação, facilitando a manutenção e expansão do sistema.
- **Repository Pattern** foi usado para organizar melhor o acesso aos dados, separando a lógica de interação com o banco de dados MongoDB..
Uma **Camada de Serviço** foi criada para centralizar a lógica de negócios, tornando o código mais reutilizável e fácil de manter. Um exemplo disso é o ElasticService, que gerencia a integração com o ElasticSearch.

### Autor
**Marcos Vinicius Costa Amorim da Silva**
>  This is a challenge by [Coodesh](https://coodesh.com/)