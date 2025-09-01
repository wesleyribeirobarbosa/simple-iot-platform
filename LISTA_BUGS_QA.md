# 🐛 Lista de Bugs Propositais - Avaliação QA

## 📋 Resumo Executivo

Esta aplicação foi **intencionalmente desenvolvida com bugs** para que o estagiário de QA possa praticar testes exploratórios e identificar problemas de segurança, usabilidade, performance e validação.

## 🔒 Bugs de Segurança (Críticos)

### 1. Exposição de Tokens JWT
- **Localização:** Console do navegador, localStorage, variáveis globais
- **Descrição:** Tokens JWT são logados no console e armazenados em variáveis globais
- **Arquivos:** `client/src/App.js:67`, `client/src/Login.js:89`, `server/routes/auth.js:67`
- **Severidade:** Crítico

### 2. Senhas em Texto Plano
- **Localização:** Respostas da API, console, interface
- **Descrição:** Senhas são retornadas em texto plano nas respostas da API
- **Arquivos:** `server/routes/auth.js:89`, `server/routes/users.js:156`
- **Severidade:** Crítico

### 3. Chave JWT Fraca
- **Localização:** Código do servidor
- **Descrição:** Chave JWT muito fraca e hardcoded (`secret123`)
- **Arquivos:** `server/routes/auth.js:8`
- **Severidade:** Crítico

### 4. CORS Mal Configurado
- **Localização:** Servidor
- **Descrição:** CORS permite qualquer origem (`origin: '*'`)
- **Arquivos:** `server/index.js:28`
- **Severidade:** Alto

### 5. Helmet Desabilitado
- **Localização:** Servidor
- **Descrição:** Middleware de segurança Helmet está comentado
- **Arquivos:** `server/index.js:31`
- **Severidade:** Alto

### 6. Rate Limiting Permissivo
- **Localização:** Servidor
- **Descrição:** Rate limiting permite 1000 requisições por 15 minutos
- **Arquivos:** `server/index.js:33-37`
- **Severidade:** Alto

### 7. SQL Injection
- **Localização:** Banco de dados
- **Descrição:** Função `findUserByEmail` vulnerável a SQL injection
- **Arquivos:** `server/database/database.js:89-98`
- **Severidade:** Crítico

### 8. Rota de Debug Pública
- **Localização:** Servidor
- **Descrição:** Rota `/api/debug` expõe tokens ativos
- **Arquivos:** `server/index.js:58-65`
- **Severidade:** Alto

### 9. Rota Pública sem Autenticação
- **Localização:** Servidor
- **Descrição:** Rota `/api/public/devices` permite acesso sem token
- **Arquivos:** `server/index.js:67-75`
- **Severidade:** Alto

### 10. Middleware de Autenticação Falho
- **Localização:** Rotas de usuários e dispositivos
- **Descrição:** Middleware permite acesso mesmo com tokens inválidos
- **Arquivos:** `server/routes/users.js:15-35`, `server/routes/devices.js:15-35`
- **Severidade:** Alto

## 🚨 Bugs de Validação (Altos)

### 11. Validação de Senha Muito Fraca
- **Localização:** Frontend e backend
- **Descrição:** Senhas com apenas 1-3 caracteres são aceitas
- **Arquivos:** `client/src/components/Login.js:25`, `server/routes/auth.js:95`
- **Severidade:** Alto

### 12. Validação de Email Inadequada
- **Localização:** Frontend e backend
- **Descrição:** Apenas verifica se contém '@'
- **Arquivos:** `client/src/components/Login.js:20`, `server/routes/auth.js:100`
- **Severidade:** Médio

### 13. Coordenadas Geográficas Inválidas
- **Localização:** Banco de dados e validações
- **Descrição:** Coordenadas impossíveis são aceitas (999.999, -999.999)
- **Arquivos:** `server/database/database.js:75-77`
- **Severidade:** Médio

### 14. Valores de Telemetria Impossíveis
- **Localização:** Geração de dados e validação
- **Descrição:** Consumo negativo, bateria >100%, sinal >100%
- **Arquivos:** `server/services/telemetryService.js:45-55`
- **Severidade:** Médio

### 15. Falta de Validação de Dados de Entrada
- **Localização:** Rotas de criação e edição
- **Descrição:** Dados não são validados adequadamente antes de inserção
- **Arquivos:** `server/routes/devices.js:85-95`
- **Severidade:** Médio

## ⚡ Bugs de Performance (Médios)

### 16. Intervalos Muito Frequentes
- **Localização:** Frontend e backend
- **Descrição:** Dashboard atualiza a cada 1s, telemetrias a cada 30s
- **Arquivos:** `client/src/components/Dashboard.js:25`, `server/index.js:78`
- **Severidade:** Médio

### 17. Re-renders Desnecessários
- **Localização:** Componentes React
- **Descrição:** useEffect com dependências vazias causa re-renders infinitos
- **Arquivos:** `client/src/components/Dashboard.js:22`, `client/src/components/MapView.js:15`
- **Severidade:** Médio

### 18. Logs Excessivos
- **Localização:** Console e servidor
- **Descrição:** Logs de dados sensíveis e informações desnecessárias
- **Arquivos:** `server/index.js:42-46`, `client/src/components/Dashboard.js:67`
- **Severidade:** Baixo

### 19. Requisições Paralelas sem Controle
- **Localização:** Dashboard
- **Descrição:** Múltiplas requisições simultâneas sem tratamento de erro
- **Arquivos:** `client/src/components/Dashboard.js:50-60`
- **Severidade:** Baixo

## 🎨 Bugs de Usabilidade (Médios)

### 20. Painéis de Debug Sempre Visíveis
- **Localização:** Interface do usuário
- **Descrição:** Informações de debug expostas na interface
- **Arquivos:** `client/src/components/Dashboard.js:200-210`
- **Severidade:** Baixo

### 21. Informações Sensíveis na Interface
- **Localização:** Componentes de navegação e dashboard
- **Descrição:** IDs de usuário, roles e tokens expostos
- **Arquivos:** `client/src/components/Navigation.js:120-130`
- **Severidade:** Médio

### 22. Validações Client-side Inadequadas
- **Localização:** Formulários
- **Descrição:** Validações muito permissivas no frontend
- **Arquivos:** `client/src/components/Login.js:20-25`
- **Severidade:** Médio

### 23. Mensagens de Erro Pobres
- **Localização:** Tratamento de erros
- **Descrição:** Erros não são tratados adequadamente
- **Arquivos:** `client/src/components/Dashboard.js:75-80`
- **Severidade:** Baixo

## 🗄️ Bugs de Banco de Dados (Médios)

### 24. Hash de Senha com Salt Pequeno
- **Localização:** Função de hash
- **Descrição:** Salt muito pequeno (5) para bcrypt
- **Arquivos:** `server/database/database.js:15-17`
- **Severidade:** Alto

### 25. Dados de Teste Inconsistentes
- **Localização:** Inicialização do banco
- **Descrição:** Dados com valores impossíveis são inseridos
- **Arquivos:** `server/database/database.js:75-85`
- **Severidade:** Baixo

### 26. Falta de Verificação de Dependências
- **Localização:** Exclusão de registros
- **Descrição:** Usuários e dispositivos são deletados sem verificar dependências
- **Arquivos:** `server/routes/users.js:180-200`
- **Severidade:** Médio

## 🔍 Como Identificar os Bugs

### Console do Navegador
- Tokens JWT logados
- Dados sensíveis expostos
- Erros JavaScript

### Aba Network
- Requisições excessivas
- Dados sensíveis nas respostas
- Headers de segurança inadequados

### Aba Performance
- Re-renders frequentes
- Uso excessivo de memória
- Intervalos muito frequentes

### Aba Application
- localStorage com dados sensíveis
- Tokens expostos

### Aba Security
- Headers de segurança inadequados
- Políticas CORS permissivas

## 📊 Critérios de Avaliação

### Excelente (90-100%)
- Identifica 80%+ dos bugs críticos e altos
- Documenta bugs com evidências claras
- Categoriza bugs adequadamente
- Fornece recomendações úteis

### Bom (70-89%)
- Identifica 60-79% dos bugs críticos e altos
- Documenta bugs adequadamente
- Categoriza a maioria dos bugs
- Fornece algumas recomendações

### Regular (50-69%)
- Identifica 40-59% dos bugs críticos e altos
- Documentação básica dos bugs
- Categorização parcial
- Poucas recomendações

### Insuficiente (<50%)
- Identifica menos de 40% dos bugs críticos e altos
- Documentação inadequada
- Sem categorização
- Sem recomendações

## 🎯 Pontos de Atenção Especiais

1. **Segurança é prioridade máxima** - Bugs de segurança devem ser identificados primeiro
2. **Console do navegador** - Muitos bugs estão expostos via console.log
3. **DevTools** - Uso adequado das ferramentas de desenvolvedor é essencial
4. **Testes exploratórios** - Não apenas seguir scripts, mas explorar a aplicação
5. **Documentação** - Bugs devem ser documentados com evidências claras

## 📝 Notas para Avaliação

- **Foque na qualidade da documentação** dos bugs encontrados
- **Avalie o uso das ferramentas** de desenvolvimento
- **Considere a metodologia** de teste utilizada
- **Verifique se o QA entendeu** a gravidade dos diferentes tipos de bugs
- **Avalie as recomendações** fornecidas para correção

---

**Total de Bugs Implementados:** 26
**Bugs Críticos:** 8
**Bugs Altos:** 7  
**Bugs Médios:** 8
**Bugs Baixos:** 3
