# 🧪 Guia de Testes para Estagiário de QA

## 📋 Visão Geral da Aplicação

Esta é uma **Plataforma IoT para Gestão de Dispositivos de Medição de Água** desenvolvida especificamente para **testes exploratórios e Black Box**. A aplicação possui um backend em Node.js e um frontend em React.js.

## 🚀 Como Executar a Aplicação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para Execução

1. **Instalar dependências:**
   ```bash
   npm run install-all
   ```

2. **Executar aplicação (backend + frontend):**
   ```bash
   npm run dev
   ```

3. **Acessar a aplicação:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🔑 Credenciais de Teste

### Usuário Administrador
- **Email:** admin@iot.com
- **Senha:** 123456

### Usuário Comum
- **Email:** user@iot.com  
- **Senha:** 123456

## 🎯 Funcionalidades da Aplicação

### 1. Sistema de Autenticação
- Login/Logout
- Registro de novos usuários
- Autenticação JWT

### 2. Gestão de Usuários (CRUD)
- Listagem de usuários
- Criação de novos usuários
- Edição de usuários existentes
- Exclusão de usuários
- Controle de permissões (admin/user)

### 3. Mapa de Dispositivos
- Visualização de dispositivos em mapa
- Informações de localização (latitude/longitude)
- Status dos dispositivos

### 4. Gestão de Dispositivos
- Listagem de dispositivos IoT
- Criação de novos dispositivos
- Edição de dispositivos existentes
- Exclusão de dispositivos

### 5. Telemetrias e Monitoramento
- Dados de consumo de água
- Nível de bateria
- Força do sinal
- Temperatura e umidade
- Histórico de dados
- Atualização automática a cada 30 segundos

## 🐛 Objetivo dos Testes

**IMPORTANTE:** Esta aplicação foi **intencionalmente desenvolvida com bugs** para que você possa praticar testes exploratórios e identificar problemas de:

- **Segurança**
- **Usabilidade** 
- **Performance**
- **Validação de dados**
- **Tratamento de erros**
- **Interface do usuário**

## 🔍 Áreas de Foco para Testes

### Console do Navegador
- Verifique logs de informações sensíveis
- Procure por erros JavaScript
- Analise tokens e dados expostos

### Aba Network (DevTools)
- Monitore requisições HTTP
- Verifique headers de segurança
- Analise respostas da API
- Procure por dados sensíveis nas requisições

### Aba Performance
- Identifique problemas de performance
- Analise re-renders desnecessários
- Verifique uso excessivo de memória

### Aba Application
- Verifique localStorage
- Analise cookies
- Procure por dados sensíveis armazenados

### Aba Security
- Verifique headers de segurança
- Analise políticas de CORS
- Identifique vulnerabilidades

## 📊 Tipos de Bugs a Procurar

### Bugs de Segurança
- Tokens JWT expostos
- Senhas em texto plano
- Validações inadequadas
- Controle de acesso falho
- Dados sensíveis expostos

### Bugs de Usabilidade
- Interface confusa
- Validações client-side inadequadas
- Mensagens de erro pouco claras
- Navegação problemática

### Bugs de Performance
- Requisições excessivas
- Re-renders desnecessários
- Uso excessivo de memória
- Intervalos muito frequentes

### Bugs de Validação
- Dados inválidos aceitos
- Coordenadas geográficas incorretas
- Valores impossíveis permitidos
- Falta de sanitização

## 🧪 Estratégias de Teste

### 1. Testes Exploratórios
- Navegue pela aplicação sem script
- Teste diferentes cenários
- Explore funcionalidades inesperadas

### 2. Testes de Segurança
- Tente acessar rotas protegidas
- Manipule tokens JWT
- Teste validações de entrada

### 3. Testes de Performance
- Monitore o console durante uso
- Verifique requisições excessivas
- Analise uso de memória

### 4. Testes de Usabilidade
- Teste com dados inválidos
- Verifique mensagens de erro
- Teste responsividade

## 📝 Relatório de Testes

Após os testes, prepare um relatório incluindo:

1. **Bugs Encontrados**
   - Descrição detalhada
   - Passos para reproduzir
   - Severidade (Crítico, Alto, Médio, Baixo)
   - Evidências (screenshots, logs)

2. **Categorização**
   - Bugs de Segurança
   - Bugs de Usabilidade
   - Bugs de Performance
   - Bugs de Validação

3. **Recomendações**
   - Prioridades de correção
   - Sugestões de melhoria
   - Boas práticas identificadas

## 🎯 Dicas para Testes

- **Use o DevTools extensivamente**
- **Monitore o console constantemente**
- **Teste cenários extremos**
- **Verifique dados sensíveis**
- **Teste com diferentes usuários**
- **Analise requisições da API**
- **Verifique validações client-side**

## 🚨 Lembre-se

Esta aplicação foi **intencionalmente bugada** para fins de aprendizado. Seu objetivo é **encontrar o máximo de problemas possível** usando técnicas de teste exploratório e análise de código.

**Boa sorte nos testes! 🧪✨**
