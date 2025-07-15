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

### Workflow 1: Criar/Atualizar Contato

```json
{
  "name": "Criar Contato RD Station",
  "nodes": [
    {
      "parameters": {
        "resource": "contact",
        "operation": "createOrUpdate",
        "email": "cliente@exemplo.com",
        "additionalFields": {
          "name": "João Silva",
          "job_title": "Desenvolvedor",
          "mobile_phone": "+5511999999999",
          "city": "São Paulo",
          "state": "SP",
          "country": "Brasil",
          "tags": "lead,interessado,developer"
        }
      },
      "id": "rd-station-contact",
      "name": "RD Station Marketing",
      "type": "n8n-nodes-rdstation-marketing.rdStationMarketing",
      "position": [250, 300],
      "credentials": {
        "rdStationMarketingOAuth2Api": {
          "id": "1",
          "name": "RD Station Marketing OAuth2 API"
        }
      }
    }
  ]
}
```

### Workflow 2: Buscar Contato e Criar Evento

```json
{
  "name": "Buscar Contato e Criar Evento",
  "nodes": [
    {
      "parameters": {
        "resource": "contact",
        "operation": "get",
        "email": "cliente@exemplo.com"
      },
      "id": "get-contact",
      "name": "Buscar Contato",
      "type": "n8n-nodes-rdstation-marketing.rdStationMarketing",
      "position": [250, 300],
      "credentials": {
        "rdStationMarketingOAuth2Api": {
          "id": "1",
          "name": "RD Station Marketing OAuth2 API"
        }
      }
    },
    {
      "parameters": {
        "resource": "event",
        "operation": "createConversion",
        "event_type": "CONVERSION",
        "email": "={{$node['Buscar Contato'].json.email}}"
      },
      "id": "create-event",
      "name": "Criar Evento",
      "type": "n8n-nodes-rdstation-marketing.rdStationMarketing",
      "position": [450, 300],
      "credentials": {
        "rdStationMarketingOAuth2Api": {
          "id": "1",
          "name": "RD Station Marketing OAuth2 API"
        }
      }
    }
  ],
  "connections": {
    "Buscar Contato": {
      "main": [
        [
          {
            "node": "Criar Evento",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Workflow 3: Sincronizar Contatos de Planilha

```json
{
  "name": "Sincronizar Contatos de Planilha",
  "nodes": [
    {
      "parameters": {
        "filePath": "/tmp/contatos.xlsx",
        "options": {}
      },
      "id": "read-excel",
      "name": "Ler Planilha",
      "type": "n8n-nodes-base.microsoftExcel",
      "position": [250, 300]
    },
    {
      "parameters": {
        "resource": "contact",
        "operation": "createOrUpdate",
        "email": "={{$json.email}}",
        "additionalFields": {
          "name": "={{$json.nome}}",
          "job_title": "={{$json.cargo}}",
          "mobile_phone": "={{$json.telefone}}",
          "city": "={{$json.cidade}}",
          "state": "={{$json.estado}}",
          "country": "Brasil",
          "tags": "planilha,importacao"
        }
      },
      "id": "sync-contacts",
      "name": "Sincronizar Contatos",
      "type": "n8n-nodes-rdstation-marketing.rdStationMarketing",
      "position": [450, 300],
      "credentials": {
        "rdStationMarketingOAuth2Api": {
          "id": "1",
          "name": "RD Station Marketing OAuth2 API"
        }
      }
    }
  ],
  "connections": {
    "Ler Planilha": {
      "main": [
        [
          {
            "node": "Sincronizar Contatos",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
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

### Processar Resposta da API

```javascript
// Node: Code (JavaScript)
const response = $input.first().json;

// Verificar se o contato foi criado/atualizado com sucesso
if (response.uuid) {
  console.log(`Contato processado com sucesso: ${response.uuid}`);
  
  // Preparar dados para próximo node
  return [{
    json: {
      success: true,
      contact_uuid: response.uuid,
      contact_email: response.email,
      message: 'Contato criado/atualizado com sucesso'
    }
  }];
} else {
  throw new Error('Falha ao processar contato');
}
```

## Tratamento de Erros

### Exemplo de Workflow com Tratamento de Erros

```json
{
  "name": "Criar Contato com Tratamento de Erros",
  "nodes": [
    {
      "parameters": {
        "resource": "contact",
        "operation": "createOrUpdate",
        "email": "={{$json.email}}",
        "continueOnFail": true
      },
      "id": "create-contact",
      "name": "Criar Contato",
      "type": "n8n-nodes-rdstation-marketing.rdStationMarketing",
      "position": [250, 300],
      "credentials": {
        "rdStationMarketingOAuth2Api": {
          "id": "1",
          "name": "RD Station Marketing OAuth2 API"
        }
      },
      "continueOnFail": true
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.error}}",
              "operation": "isEmpty"
            }
          ]
        }
      },
      "id": "check-success",
      "name": "Verificar Sucesso",
      "type": "n8n-nodes-base.if",
      "position": [450, 300]
    },
    {
      "parameters": {
        "message": "Contato criado com sucesso!",
        "options": {}
      },
      "id": "success-message",
      "name": "Mensagem de Sucesso",
      "type": "n8n-nodes-base.noOp",
      "position": [650, 250]
    },
    {
      "parameters": {
        "message": "Erro ao criar contato: {{$json.error}}",
        "options": {}
      },
      "id": "error-message",
      "name": "Mensagem de Erro",
      "type": "n8n-nodes-base.noOp",
      "position": [650, 350]
    }
  ]
}
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

### 1. Validação de Dados

```javascript
// Sempre validar email antes de enviar
const email = $json.email;
if (!email || !email.includes('@')) {
  throw new Error('Email inválido');
}
```

### 2. Tratamento de Tags

```javascript
// Normalizar tags antes de enviar
const tags = $json.tags || '';
const normalizedTags = tags
  .split(',')
  .map(tag => tag.trim().toLowerCase())
  .filter(tag => tag.length > 0)
  .join(',');
```

### 3. Rate Limiting

- O RD Station tem limites de requisições
- Use delays entre requisições em lote
- Implemente retry em caso de erro 429

### 4. Logs e Monitoramento

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