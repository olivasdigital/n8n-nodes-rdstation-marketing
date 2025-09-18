# Exemplos de Uso - n8n RD Station Marketing Node

## Configuração Inicial

### 1. Credenciais OAuth2

Antes de usar o node, você precisa configurar as credenciais OAuth2:

1. **Criar Aplicativo no RD Station:**
   - Acesse: https://appstore.rdstation.com.br/pt-BR/publisher
   - Crie um novo aplicativo
   - Anote o `Client ID` e `Client Secret`

2. **Configurar Callback URL:**
   - Desenvolvimento: `http://localhost:5678/rest/oauth2-credential/callback`
   - Produção: `https://your-n8n-domain.com/rest/oauth2-credential/callback`

3. **Criar Credencial no n8n:**
   - Nome: "RD Station Marketing OAuth2 API"
   - Client ID: [seu_client_id]
   - Client Secret: [seu_client_secret]

## Exemplos de Workflows

### Workflow 1: Registrando conversão

```json
{
  "nodes": [
    {
      "parameters": {},
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [
        0,
        0
      ],
      "id": "81364b51-2e7d-417e-8af6-e5586bd2776e",
      "name": "When clicking ‘Execute workflow’"
    },
    {
      "parameters": {
        "resource": "event",
        "conversion_identifier": "conversion-identifier",
        "email": "cliente@exemplo.com",
        "additionalFields": {}
      },
      "type": "n8n-nodes-rdstation-marketing.rdStationMarketing",
      "typeVersion": 1,
      "position": [
        224,
        0
      ],
      "id": "f752dd41-a2ae-4f65-aed5-cd127308c0fd",
      "name": "Standard Conversion",
      "credentials": {
        "rdStationMarketingOAuth2Api": {
          "id": "1",
          "name": "RD Station Marketing account"
        }
      }
    }
  ],
  "connections": {
    "When clicking ‘Execute workflow’": {
      "main": [
        [
          {
            "node": "Standard Conversion",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
}
```

### Workflow 2: Buscar Contato pelo e-mail

```json
{
  "nodes": [
    {
      "parameters": {},
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [
        0,
        0
      ],
      "id": "81364b51-2e7d-417e-8af6-e5586bd2776e",
      "name": "When clicking ‘Execute workflow’"
    },
    {
      "parameters": {
        "operation": "get",
        "email": "cliente@exemplo.com"
      },
      "type": "n8n-nodes-rdstation-marketing.rdStationMarketing",
      "typeVersion": 1,
      "position": [
        208,
        0
      ],
      "id": "98604ce6-5970-415f-a6bc-828f0c25116d",
      "name": "Get a contact",
      "credentials": {
        "rdStationMarketingOAuth2Api": {
          "id": "1",
          "name": "RD Station Marketing account"
        }
      }
    }
  ],
  "connections": {
    "When clicking ‘Execute workflow’": {
      "main": [
        [
          {
            "node": "Get a contact",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
}
```

## Exemplos de Código JavaScript

### Validar Email Antes de Criar Contato

```javascript
// Node: Code (JavaScript)
const email = $input.first().json.email;

// Validar formato do email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error(`Email inválido: ${email}`);
}

// Preparar dados do contato
const contactData = {
  email: email,
  name: $input.first().json.name || '',
  job_title: $input.first().json.job_title || '',
  mobile_phone: $input.first().json.phone || '',
  city: $input.first().json.city || '',
  state: $input.first().json.state || '',
  country: 'Brasil',
  tags: 'webhook,validado'
};

return [{ json: contactData }];
```

## Casos de Uso Comuns

### 1. Integração com Formulários Web

- **Trigger**: Webhook recebe dados do formulário
- **Ação**: Criar contato no RD Station
- **Evento**: Registrar conversão

### 2. Sincronização de CRM

- **Trigger**: Schedule (diário)
- **Ação**: Buscar novos leads no CRM
- **Sincronização**: Atualizar contatos no RD Station

### 3. Automação de Email Marketing

- **Trigger**: Novo contato criado
- **Ação**: Adicionar tags específicas
- **Evento**: Criar evento personalizado

### 4. Relatórios e Analytics

- **Trigger**: Schedule (semanal)
- **Ação**: Buscar todos os contatos
- **Análise**: Gerar relatório de performance

## Dicas e Boas Práticas

### 1. Validação de Email

```json
{
  "nodes": [
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "90a30a13-f988-42de-a2cc-2dc1bbcb7018",
              "leftValue": "={{ (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/).test($json.email) }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        208,
        0
      ],
      "id": "b2d4af9f-bd8f-43f0-8503-65bd51d3f9df",
      "name": "validEmail"
    }
  ],
}
```

### 2. Rate Limiting

- O RD Station tem limites de requisições
- Use delays entre requisições em lote
- Implemente retry em caso de erro 429

### 3. Logs e Monitoramento

```javascript
// Sempre logar operações importantes
console.log(`Processando contato: ${$json.email}`);
console.log(`Resultado: ${response.success ? 'Sucesso' : 'Falha'}`);
```

## Troubleshooting

### Problemas Comuns

1. **Erro de Autenticação**
   - Verificar se as credenciais estão corretas
   - Verificar se o token não expirou

2. **Email Inválido**
  - Use um node IF ou Filter para validar se o email é válido
  - RD Station não aceita conversões ou criação de leads sem email