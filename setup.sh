#!/bin/bash

# Script para configurar o projeto n8n-nodes-rdstation-marketing

echo "🚀 Configurando projeto n8n-nodes-rdstation-marketing..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18+ antes de continuar."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18 ou superior é necessária. Versão atual: $(node --version)"
    exit 1
fi

# Verificar se pnpm está instalado, caso contrário usar npm
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
else
    PACKAGE_MANAGER="npm"
fi

echo "📦 Usando $PACKAGE_MANAGER como gerenciador de pacotes..."

# Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p credentials
mkdir -p nodes/RdStationMarketing
mkdir -p dist

# Instalar dependências
echo "📦 Instalando dependências..."
$PACKAGE_MANAGER install

# Compilar o projeto
echo "🔨 Compilando projeto..."
$PACKAGE_MANAGER run build

# Executar linter
echo "🔍 Executando linter..."
$PACKAGE_MANAGER run lint

# Verificar se n8n está instalado globalmente
if ! command -v n8n &> /dev/null; then
    echo "⚠️  n8n não encontrado globalmente. Instalando..."
    $PACKAGE_MANAGER install n8n -g
fi

# Instruções finais
echo ""
echo "✅ Configuração concluída com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Adicione o ícone do RD Station (rdstation.svg) em nodes/RdStationMarketing/"
echo "2. Configure suas credenciais OAuth2 no RD Station App Store"
echo "3. Para testar localmente, execute:"
echo "   $PACKAGE_MANAGER link"
echo "   cd /path/to/n8n && $PACKAGE_MANAGER link n8n-nodes-rdstation-marketing"
echo ""
echo "🔗 Links úteis:"
echo "- RD Station App Store: https://appstore.rdstation.com.br/pt-BR/publisher"
echo "- Documentação API: https://developers.rdstation.com/reference/introducao-rdsm"
echo "- Documentação n8n: https://docs.n8n.io/integrations/creating-nodes/"
echo ""
echo "🎉 Pronto para desenvolver!"