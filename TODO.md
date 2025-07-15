# Estrutura do Projeto n8n-nodes-rdstation-marketing

```
n8n-nodes-rdstation-marketing/
├── credentials/
│   └── RdStationMarketingOAuth2Api.credentials.ts
├── nodes/
│   └── RdStationMarketing/
│       ├── RdStationMarketing.node.ts
│       ├── GenericFunctions.ts
│       └── rdstation.svg
├── dist/                    # Gerado automaticamente após build
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── gulpfile.js
├── package.json
├── README.md
└── tsconfig.json
```

## Próximos Passos

### 1. Configurar o ambiente de desenvolvimento

```bash
# Clonar o repositório (após criar no GitHub)
git clone https://github.com/yourusername/n8n-nodes-rdstation-marketing.git
cd n8n-nodes-rdstation-marketing

# Instalar dependências
npm install

# Ou se preferir pnpm
pnpm install
```

### 2. Arquivos de configuração adicionais necessários

#### .eslintrc.js
```javascript
module.exports = {
  extends: ['@n8n_io/eslint-config/node'],
  rules: {
    // Regras específicas do projeto se necessário
  },
};
```

#### .gitignore
```
node_modules/
dist/
.env
.DS_Store
*.log
```

#### .prettierrc
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "useTabs": true,
  "tabWidth": 2,
  "semi": true
}
```

### 3. Ícone do RD Station

Você precisará adicionar o ícone do RD Station (rdstation.svg) na pasta `nodes/RdStationMarketing/`.

### 4. Configurar credenciais OAuth2 no RD Station

1. Acesse [RD Station App Store](https://appstore.rdstation.com.br/pt-BR/publisher)
2. Crie um novo aplicativo
3. Configure as URLs de callback para desenvolvimento local
4. Anote o `client_id` e `client_secret`

### 5. Testar localmente

```bash
# Compilar o código
npm run build

# Executar linter
npm run lint

# Link para teste local com n8n
npm link
cd /path/to/n8n
npm link n8n-nodes-rdstation-marketing
```

### 6. Funcionalidades implementadas

- **Autenticação OAuth2** completa com refresh token
- **Contatos**: Criar/atualizar, buscar por email/UUID, listar todos
- **Eventos**: Criar eventos de conversão e customizados
- **Tratamento de erros** robusto
- **Validação** de dados de entrada
- **Paginação** para listagem de contatos

### 7. Recursos da API RD Station Marketing suportados

- `/platform/contacts` - Gestão de contatos
- `/platform/events` - Gestão de eventos
- `/auth/token` - Autenticação OAuth2

### 8. Melhorias futuras

- Adicionar suporte para segmentação
- Implementar webhooks
- Adicionar campos personalizados
- Suporte para campanhas de email
- Integração com funil de vendas