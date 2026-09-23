# Contexto do Projeto

## Objetivo
Aplicação web completa para gerenciamento (CRUD) de aparelhos Samsung, composta por uma API REST em Node.js com Express e MongoDB (Mongoose), preparada para deploy serverless na Vercel, e um frontend moderno, responsivo e independente desenvolvido em HTML5, CSS3 e JavaScript puro (Vanilla JS).

## Estado atual
Projeto totalmente implementado, testado e documentado. A API conta com suíte de 35 testes automatizados aprovados e smoke test HTTP de ponta a ponta. O frontend possui interface semântica e responsiva com quatro estados visuais (carregamento, vazio, erro e sucesso), além de modais de formulário e confirmação de exclusão. A estrutura está 100% pronta para deploy na Vercel com `vercel.json` configurado.

## Arquitetura
- **Estrutura de Pastas**:
  ```
  /
  ├── backend/
  │   ├── src/
  │   │   ├── config/db.js            # Conexão Mongoose singleton com cache para serverless
  │   │   ├── controllers/aparelhoController.js # Lógica do CRUD e validações
  │   │   ├── middlewares/            # Tratamento global de erros e validação de ObjectId
  │   │   ├── models/Aparelho.js       # Model/Schema com validações e timestamps
  │   │   ├── routes/                 # Rotas /api/health e /api/aparelhos
  │   │   └── app.js                  # Configuração do Express, CORS e entrega de estáticos
  │   ├── api/index.js                # Handler serverless para a Vercel
  │   ├── scripts/                    # Scripts de seed e runner com MongoDB em memória
  │   ├── tests/aparelhos.test.js     # Suíte de testes automatizados (node:test + Supertest)
  │   ├── server.js                   # Entrypoint local persistente
  │   ├── package.json
  │   ├── .env.example
  │   └── .env
  ├── frontend/
  │   ├── index.html                  # Interface semântica acessível
  │   ├── css/style.css               # Design System Samsung Tech responsivo
  │   └── js/app.js                   # JavaScript puro consumindo a API via fetch()
  ├── vercel.json                     # Roteamento e build na Vercel
  ├── .gitignore                      # Proteção de credenciais e exclusão de node_modules
  ├── Roadmap.md                      # Acompanhamento do progresso
  ├── Contexto.md                     # Registro do estado atual e decisões técnicas
  └── api.md                          # Documentação técnica completa da API com curl
  ```

## Backend
- **Status da API**: Operacional e testada.
- **Rotas implementadas**:
  - `GET /api/health`: Health check com indicação de status do banco e timestamp.
  - `GET /api/aparelhos`: Listagem de aparelhos ordenados por data decrescente.
  - `GET /api/aparelhos/:id`: Consulta individual com validação de ObjectId e 404 se inexistente.
  - `POST /api/aparelhos`: Cadastro de aparelho com validação estrita (201 Created).
  - `PUT /api/aparelhos/:id`: Atualização total ou parcial com validação (200 OK).
  - `DELETE /api/aparelhos/:id`: Exclusão permanente do aparelho (200 OK).
- **Modelos**:
  - `Aparelho`: `modelo` (String, obrigatório, não vazio), `cor` (String, obrigatório, não vazio), `preco` (Number, obrigatório, >= 0), `foto` (String, obrigatório, URL válida http/https), timestamps automáticos (`createdAt`, `updatedAt`).
- **Validações e Middlewares**:
  - `validateObjectId`: Rejeita identificadores inválidos com status 400 antes de submeter ao banco.
  - `errorHandler`: Converte erros do Mongoose (`ValidationError`, `CastError`), JSON malformado e falhas de conexão em respostas JSON consistentes.
- **Vercel Serverless**:
  - Handler em `backend/api/index.js` garantindo conexão Mongoose singleton e invocação da aplicação Express.

## Frontend
- **Tecnologias**: HTML5, CSS3, JavaScript puro (Vanilla JS), `fetch()`. Sem frameworks.
- **Estados Visuais**:
  - **Carregamento**: Cards esqueleto (Skeleton Loading) com animação suave de shimmer.
  - **Lista Vazia**: Empty state estilizado com ícone de smartphone e chamada para ação.
  - **Erro**: Alerta visual detalhado com botão "Tentar Novamente".
  - **Sucesso**: Grid de cards responsivo exibindo foto, modelo, badge de cor, preço em Real (BRL) e botões de ação.
- **Funcionalidades da Interface**:
  - Cadastro de novo aparelho via modal.
  - Edição de aparelho existente com pré-carregamento dos dados no formulário.
  - Pré-visualização da foto do aparelho em tempo real conforme a URL é digitada.
  - Modal de confirmação antes de excluir qualquer aparelho.
  - Busca e filtragem em tempo real por modelo ou cor.
  - Indicador de status da conexão com a API no topo (online/offline/conectando).
  - Sistema de notificações flutuantes (Toasts) para feedback imediato de ações.

## Banco de dados
- **SGBD**: MongoDB.
- **ODM**: Mongoose.
- **Collection**: `aparelhos`.
- **Modos de Execução**:
  - Em desenvolvimento local padrão / produção: string `MONGODB_URI` via `.env`.
  - Em desenvolvimento rápido / testes: `npm run start:memory` utiliza instância em memória isolada e já carrega aparelhos de amostra.

## Testes realizados
1. **Suíte Automatizada (`npm test`)**:
   - 35 testes automatizados executados e 100% aprovados com `node:test` e `supertest`.
   - Cobertura de health check, todas as validações unitárias de campos, erros HTTP de entrada (400), validação de ObjectId (400), tratamento de rotas inexistentes (404) e ciclo completo de CRUD no MongoDB em memória.
2. **Smoke Test HTTP de Ponta a Ponta**:
   - Inicialização do servidor na porta 3000 (`npm run start:memory`).
   - `GET /api/health` -> 200 OK com status e indicação de banco conectado.
   - `GET /api/aparelhos` -> 200 OK retornando lista populada.
   - `POST /api/aparelhos` -> 201 Created criando o "Galaxy S25 FE".
   - `GET /api/aparelhos/:id` -> 200 OK recuperando o aparelho recém-criado.
   - `PUT /api/aparelhos/:id` -> 200 OK atualizando preço e cor.
   - `DELETE /api/aparelhos/:id` -> 200 OK excluindo o item.
   - `GET /api/aparelhos/:id` pós-exclusão -> 404 Not Found comprovando a remoção.
   - `GET /` -> 200 OK entregando o HTML da interface para o navegador.

## Problemas conhecidos
- Nenhum problema de código ou teste pendente.
- A máquina local do usuário não possui daemon local `mongod` instalado no PATH do sistema operacional, mas a execução local está 100% resolvida tanto através da variável `MONGODB_URI` (para MongoDB Atlas) quanto pelo comando nativo `npm run start:memory`.

## Próxima tarefa
Fornecer orientações ao usuário sobre como rodar o projeto localmente com um comando e como realizar o deploy na Vercel configurando a variável de ambiente `MONGODB_URI`.

## Decisões técnicas
- **Inclusão do script `start:memory`**: Permite rodar a aplicação imediatamente sem depender de pré-configuração externa no MongoDB Atlas.
- **Cache de Conexão no `db.js`**: Reutiliza instâncias ativas do Mongoose em ambientes serverless, evitando abertura excessiva de conexões.
- **Detecção Automática de Ambiente no Frontend**: O `app.js` identifica se está em `localhost` (apontando para `http://localhost:3000/api`) ou em produção na Vercel (apontando relativamente para `/api`).
