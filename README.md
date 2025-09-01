# 🚰 Plataforma IoT para Gestão de Dispositivos de Medição de Água

## 📋 Descrição

Esta é uma aplicação **intencionalmente desenvolvida com bugs** para fins de **testes exploratórios e Black Box** por estagiários de QA. A plataforma simula um sistema IoT para monitoramento de dispositivos de medição de água, incluindo telemetrias, mapas e gestão de usuários.

## ⚠️ IMPORTANTE

**Esta aplicação contém bugs propositais de segurança, usabilidade, performance e validação.** Ela foi desenvolvida especificamente para que estagiários de QA possam praticar identificação de problemas usando técnicas de teste exploratório.

## 🏗️ Arquitetura

- **Backend:** Node.js + Express + SQLite
- **Frontend:** React.js + Tailwind CSS
- **Autenticação:** JWT
- **Banco de Dados:** SQLite
- **Mapas:** Implementação customizada (não usa Mapbox real)

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos

1. **Instalar dependências:**
   ```bash
   npm run install-all
   ```

2. **Executar aplicação (backend + frontend):**
   ```bash
   npm run dev
   ```

3. **Acessar:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🔑 Credenciais de Teste

- **Admin:** admin@iot.com / 123456
- **Usuário:** user@iot.com / 123456

## 🎯 Funcionalidades

### Sistema de Autenticação
- Login/Logout com JWT
- Registro de usuários
- Controle de permissões (admin/user)

### Gestão de Usuários
- CRUD completo de usuários
- Controle de roles e permissões

### Mapa de Dispositivos
- Visualização de dispositivos em mapa
- Informações de localização
- Status em tempo real

### Gestão de Dispositivos
- CRUD de dispositivos IoT
- Configuração de coordenadas
- Monitoramento de status

### Telemetrias
- Dados de consumo de água
- Nível de bateria
- Força do sinal
- Temperatura e umidade
- Histórico de dados
- Atualização automática a cada 30 segundos

## 📁 Estrutura do Projeto

```
├── server/                 # Backend Node.js
│   ├── routes/            # Rotas da API
│   ├── database/          # Configuração do banco SQLite
│   ├── services/          # Serviços de telemetria
│   └── index.js           # Servidor principal
├── client/                # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── App.js         # Aplicação principal
│   │   └── index.css      # Estilos Tailwind
│   └── package.json
├── GUIA_QA.md             # Guia para o estagiário de QA
├── LISTA_BUGS_QA.md       # Lista de bugs para avaliação
└── package.json           # Scripts principais
```

## 🐛 Objetivo dos Bugs

Os bugs implementados cobrem:

- **Segurança:** Tokens expostos, validações inadequadas, CORS mal configurado
- **Usabilidade:** Interface confusa, validações client-side inadequadas
- **Performance:** Requisições excessivas, re-renders desnecessários
- **Validação:** Dados inválidos aceitos, coordenadas impossíveis
- **Banco de Dados:** Hash fraco, dados inconsistentes

## 📚 Documentação

- **[GUIA_QA.md](GUIA_QA.md)** - Guia completo para o estagiário de QA
- **[LISTA_BUGS_QA.md](LISTA_BUGS_QA.md)** - Lista detalhada de bugs para avaliação

## 🧪 Como Testar

1. **Leia o GUIA_QA.md** para entender como testar
2. **Use o DevTools** extensivamente (Console, Network, Performance, etc.)
3. **Monitore o console** para logs de dados sensíveis
4. **Teste cenários extremos** e dados inválidos
5. **Explore funcionalidades** sem seguir scripts rígidos

## 🎯 Critérios de Avaliação

### Excelente (90-100%)
- Identifica 80%+ dos bugs críticos e altos
- Documenta bugs com evidências claras
- Categoriza bugs adequadamente
- Fornece recomendações úteis

### Bom (70-89%)
- Identifica 60-79% dos bugs críticos e altos
- Documentação adequada
- Categorização da maioria dos bugs

### Regular (50-69%)
- Identifica 40-59% dos bugs críticos e altos
- Documentação básica
- Categorização parcial

### Insuficiente (<50%)
- Identifica menos de 40% dos bugs críticos e altos
- Documentação inadequada

## 🔍 Dicas para QA

- **Console do navegador** é fundamental
- **Aba Network** mostra requisições e dados
- **Aba Performance** revela problemas de performance
- **Aba Application** mostra dados armazenados
- **Teste com diferentes usuários** e permissões
- **Monitore logs do servidor** no terminal

## 📊 Estatísticas dos Bugs

- **Total:** 26 bugs
- **Críticos:** 8 bugs
- **Altos:** 7 bugs
- **Médios:** 8 bugs
- **Baixos:** 3 bugs

## 🚨 Aviso Legal

Esta aplicação é **apenas para fins educacionais e de teste**. Não use em produção ou em ambientes reais, pois contém vulnerabilidades de segurança intencionais.

## 📞 Suporte

Para dúvidas sobre a aplicação ou bugs implementados, consulte a documentação ou entre em contato com o líder do time de desenvolvimento.

---

**Desenvolvido para testes de QA - Não usar em produção! 🚫**
