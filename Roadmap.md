# Roadmap

## 1. Análise
- [x] Analisar requisitos
- [x] Definir arquitetura
- [x] Definir estrutura de pastas

## 2. Backend
- [x] Inicializar projeto Node
- [x] Configurar Express
- [x] Configurar MongoDB (com suporte a conexões serverless)
- [x] Criar model (Schema Aparelho com validações e timestamps)
- [x] Criar rotas (/api/health e /api/aparelhos)
- [x] Criar controllers (CRUD completo e regras de validação)
- [x] Implementar validações (modelo, cor, preco >= 0, foto URL)
- [x] Implementar tratamento de erros (errorHandler e validateObjectId)
- [x] Criar health check (GET /api/health)

## 3. Frontend
- [x] Criar HTML (semântico, acessível e com estados visuais)
- [x] Criar CSS (Design System Samsung Tech, responsivo)
- [x] Criar JavaScript (Vanilla JS consumindo API via fetch)
- [x] Implementar listagem (grid de cards com foto, modelo, cor e preço BRL)
- [x] Implementar cadastro (modal com validação e preview de foto)
- [x] Implementar edição (modal com pré-preenchimento e atualização)
- [x] Implementar exclusão (modal de confirmação para evitar cliques acidentais)
- [x] Implementar estados de loading/erro/vazio/sucesso (shimmer skeleton, empty state, toasts)

## 4. Testes
- [x] Testar conexão (MongoDB em memória e status no health check)
- [x] Testar GET (listagem geral e consulta individual por ID)
- [x] Testar POST (criação de aparelhos com campos e timestamps)
- [x] Testar PUT (atualização total/parcial de dados)
- [x] Testar DELETE (exclusão de documento e verificação de 404 subsequente)
- [x] Testar validações (campos obrigatórios, preço negativo, tipos inválidos, URL inválida)
- [x] Testar erros (IDs malformatados 400, IDs inexistentes 404, rotas inexistentes 404)
- [x] Testar frontend (sintaxe JS validada, entrega de arquivos estáticos no Express)

## 5. Deploy
- [x] Preparar Vercel (vercel.json configurado com rotas serverless e arquivos estáticos)
- [x] Configurar variáveis de ambiente (.env.example e carregamento seguro)
- [ ] Fazer deploy (Aguardando credenciais do usuário/CLI da Vercel)
- [ ] Testar API em produção (Executável assim que houver a URL pública)
- [x] Atualizar documentação

## 6. Finalização
- [x] Revisar código (modularidade, boas práticas, segurança sem credenciais expostas)
- [x] Revisar documentação (Roadmap.md, Contexto.md e api.md sincronizados)
- [x] Corrigir problemas (ajustes em rotas e fallbacks)
- [x] Confirmar funcionamento (35 testes automatizados aprovados e smoke test HTTP executado)
