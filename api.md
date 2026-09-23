# Documentação da API - Gerenciador de Aparelhos Samsung

API REST desenvolvida em Node.js com Express e MongoDB (Mongoose) para gerenciamento completo (CRUD) de aparelhos Samsung, pronta para execução local e deploy serverless na Vercel.

---

## 1. Visão Geral

- **Objetivo**: Disponibilizar endpoints padronizados em JSON para cadastro, consulta, listagem, atualização e exclusão de aparelhos Samsung.
- **Formato dos Dados**: `application/json` (para corpo de requisições e respostas).
- **URL Base Local**: `http://localhost:3000/api`
- **URL de Produção**: Será gerada automaticamente ao realizar o deploy na Vercel (exemplo: `https://seu-projeto.vercel.app/api`).

---

## 2. Configuração das Variáveis de Ambiente

O arquivo `.env` deve ser configurado dentro da pasta `backend/` com base no [.env.example](file:///c:/Users/Aluno/Documents/brazao1/backend/.env.example):

```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster.mongodb.net/samsung_db?retryWrites=true&w=majority
CORS_ORIGIN=*
```

- `PORT`: Porta onde o servidor HTTP escuta localmente (padrão: `3000`).
- `MONGODB_URI`: String de conexão com o MongoDB (local ou MongoDB Atlas).
- `CORS_ORIGIN`: Origens autorizadas a consumir a API. Use `*` para desenvolvimento ou restrinja ao domínio do seu frontend em produção (ex: `https://meu-catalogo.vercel.app`).

---

## 3. Como Iniciar o Backend Localmente

### Opção A: Execução Imediata (com Banco em Memória e Dados de Amostra)
Ideal para testar a interface e a API instantaneamente sem precisar configurar o MongoDB Atlas antes:
```bash
cd backend
npm run start:memory
```
Abra o navegador em: [http://localhost:3000](http://localhost:3000).

### Opção B: Execução Padrão com MongoDB Próprio
```bash
cd backend
npm install
npm start
# ou com recarregamento automático ao editar arquivos:
npm run dev
```

### Popular Dados de Demonstração (Seed)
Caso utilize seu próprio banco MongoDB configurado no `.env`:
```bash
cd backend
npm run seed
```

### Executar a Suíte de Testes Automatizados
```bash
cd backend
npm test
```

---

## 4. Endpoints da API

### 4.1 Health Check

Verifica se a API está online e o status da conexão com o banco.

- **Método**: `GET`
- **Rota**: `/api/health`
- **Autenticação**: Nenhuma
- **Resposta de Sucesso (200 OK)**:
  ```json
  {
    "status": "ok",
    "database": "connected",
    "timestamp": "2026-09-23T11:02:30.582Z"
  }
  ```
- **Exemplo com cURL**:
  ```bash
  curl http://localhost:3000/api/health
  ```

---

### 4.2 Listar Aparelhos

Retorna a lista de aparelhos cadastrados ordenados decrescentemente pela data de criação.

- **Método**: `GET`
- **Rota**: `/api/aparelhos`
- **Resposta de Sucesso (200 OK)**:
  ```json
  [
    {
      "_id": "6ab3b1b9933b80b60c934d7a",
      "modelo": "Galaxy S25 Ultra",
      "cor": "Titânio Preto",
      "preco": 8999,
      "foto": "https://images.samsung.com/is/image/samsung/p6pim/br/galaxy-s24/gallery/br-galaxy-s24-s928-sm-s928bzkpzto-thumb-539304918",
      "createdAt": "2026-09-23T11:02:17.627Z",
      "updatedAt": "2026-09-23T11:02:17.627Z"
    }
  ]
  ```
- **Exemplo com cURL**:
  ```bash
  curl http://localhost:3000/api/aparelhos
  ```

---

### 4.3 Consultar Aparelho por ID

Retorna os detalhes de um aparelho específico a partir do seu ID do MongoDB.

- **Método**: `GET`
- **Rota**: `/api/aparelhos/:id`
- **Parâmetros**:
  - `id` (path, obrigatório): Identificador de 24 caracteres hexadecimais (ObjectId do MongoDB).
- **Resposta de Sucesso (200 OK)**:
  ```json
  {
    "_id": "6ab3b1b9933b80b60c934d7a",
    "modelo": "Galaxy S25 Ultra",
    "cor": "Titânio Preto",
    "preco": 8999,
    "foto": "https://images.samsung.com/is/image/samsung/p6pim/br/galaxy-s24/gallery/br-galaxy-s24-s928-sm-s928bzkpzto-thumb-539304918",
    "createdAt": "2026-09-23T11:02:17.627Z",
    "updatedAt": "2026-09-23T11:02:17.627Z"
  }
  ```
- **Respostas de Erro**:
  - **400 Bad Request** (formato de ID inválido):
    ```json
    {
      "error": "ID inválido fornecido",
      "detalhes": ["O identificador 'abc123' não possui um formato de ObjectId válido do MongoDB."]
    }
    ```
  - **404 Not Found** (aparelho não cadastrado):
    ```json
    {
      "error": "Aparelho não encontrado",
      "detalhes": ["Nenhum aparelho encontrado com o ID '6ab3b1b9933b80b60c934d7a'."]
    }
    ```
- **Exemplo com cURL**:
  ```bash
  curl http://localhost:3000/api/aparelhos/6ab3b1b9933b80b60c934d7a
  ```

---

### 4.4 Cadastrar Aparelho

Insere um novo aparelho Samsung na base de dados.

- **Método**: `POST`
- **Rota**: `/api/aparelhos`
- **Headers**:
  - `Content-Type: application/json`
- **Corpo da Requisição (JSON)**:
  ```json
  {
    "modelo": "Galaxy S25 FE",
    "cor": "Verde Lima",
    "preco": 3799.90,
    "foto": "https://images.samsung.com/galaxy-s25-fe.jpg"
  }
  ```
- **Regras de Validação no Backend**:
  - `modelo`: Obrigatório, string não-vazia.
  - `cor`: Obrigatória, string não-vazia.
  - `preco`: Obrigatório, número maior ou igual a 0.
  - `foto`: Obrigatória, URL válida com protocolo `http://` ou `https://`.
- **Resposta de Sucesso (201 Created)**:
  ```json
  {
    "_id": "6ab3b1d7933b80b60c934d80",
    "modelo": "Galaxy S25 FE",
    "cor": "Verde Lima",
    "preco": 3799.9,
    "foto": "https://images.samsung.com/galaxy-s25-fe.jpg",
    "createdAt": "2026-09-23T11:02:47.495Z",
    "updatedAt": "2026-09-23T11:02:47.495Z"
  }
  ```
- **Respostas de Erro (400 Bad Request)**:
  ```json
  {
    "error": "Dados inválidos",
    "detalhes": [
      "O campo 'preco' deve ser maior ou igual a zero.",
      "O campo 'foto' deve ser uma URL válida (iniciando com http:// ou https://)."
    ]
  }
  ```
- **Exemplo com cURL**:
  ```bash
  curl -X POST http://localhost:3000/api/aparelhos \
    -H "Content-Type: application/json" \
    -d '{
      "modelo": "Galaxy S25 FE",
      "cor": "Verde Lima",
      "preco": 3799.90,
      "foto": "https://images.samsung.com/galaxy-s25-fe.jpg"
    }'
  ```

---

### 4.5 Editar Aparelho

Atualiza total ou parcialmente os dados de um aparelho existente.

- **Método**: `PUT`
- **Rota**: `/api/aparelhos/:id`
- **Headers**:
  - `Content-Type: application/json`
- **Corpo da Requisição (JSON)**:
  ```json
  {
    "cor": "Verde Floresta",
    "preco": 3499.00
  }
  ```
- **Resposta de Sucesso (200 OK)**:
  ```json
  {
    "_id": "6ab3b1d7933b80b60c934d80",
    "modelo": "Galaxy S25 FE",
    "cor": "Verde Floresta",
    "preco": 3499,
    "foto": "https://images.samsung.com/galaxy-s25-fe.jpg",
    "createdAt": "2026-09-23T11:02:47.495Z",
    "updatedAt": "2026-09-23T11:02:58.643Z"
  }
  ```
- **Respostas de Erro**:
  - **400 Bad Request**: Campos inválidos ou corpo vazio.
  - **404 Not Found**: Aparelho não localizado no banco.
- **Exemplo com cURL**:
  ```bash
  curl -X PUT http://localhost:3000/api/aparelhos/6ab3b1d7933b80b60c934d80 \
    -H "Content-Type: application/json" \
    -d '{
      "cor": "Verde Floresta",
      "preco": 3499.00
    }'
  ```

---

### 4.6 Excluir Aparelho

Remove permanentemente o aparelho da base de dados.

- **Método**: `DELETE`
- **Rota**: `/api/aparelhos/:id`
- **Resposta de Sucesso (200 OK)**:
  ```json
  {
    "mensagem": "Aparelho excluído com sucesso",
    "id": "6ab3b1d7933b80b60c934d80"
  }
  ```
- **Respostas de Erro**:
  - **400 Bad Request**: Formato de ID inválido.
  - **404 Not Found**: Aparelho não localizado.
- **Exemplo com cURL**:
  ```bash
  curl -X DELETE http://localhost:3000/api/aparelhos/6ab3b1d7933b80b60c934d80
  ```

---

## 5. Instruções de Deploy na Vercel

O projeto possui o arquivo [vercel.json](file:///c:/Users/Aluno/Documents/brazao1/vercel.json) e o handler serverless [backend/api/index.js](file:///c:/Users/Aluno/Documents/brazao1/backend/api/index.js) pré-configurados.

1. Conecte o repositório à sua conta na [Vercel](https://vercel.com).
2. Configure a seguinte **Variável de Ambiente** (Environment Variable) no painel do projeto na Vercel:
   - `MONGODB_URI`: String de conexão fornecida pelo MongoDB Atlas (exemplo: `mongodb+srv://<user>:<password>@cluster.mongodb.net/samsung_db?retryWrites=true&w=majority`).
   - `CORS_ORIGIN`: (Opcional) URL pública gerada para seu projeto na Vercel.
3. Conclua o deploy.
4. A interface será servida na raiz (`/`) e a API responderá sob o caminho `/api/` automaticamente.
