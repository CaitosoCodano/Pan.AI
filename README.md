# 🤖 Chat AI - Sistema de Conversação Inteligente

Um sistema de chat com IA que permite conversas naturais e treinamento personalizado.

## ✨ Funcionalidades

- 💬 **Chat com IA**: Conversas naturais usando Google AI (Gemini)
- 🧠 **Sistema de Treinamento**: Ensine a IA com conhecimento personalizado
- 🎯 **Respostas Inteligentes**: Sistema de fallback com respostas contextuais
- 🌐 **Interface Web**: Frontend moderno e responsivo
- 🔧 **API RESTful**: Backend robusto com Express.js

## 🚀 Como Usar

### Pré-requisitos
- Node.js 18+ instalado
- Chave da API do Google AI (opcional)

### Instalação

1. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd Site
```

2. **Instale as dependências:**
```bash
cd server
npm install
```

3. **Configure as variáveis de ambiente (opcional):**
```bash
# Crie um arquivo .env na pasta server
echo "GOOGLE_AI_KEY=sua_chave_aqui" > .env
```

4. **Inicie o servidor:**
```bash
npm start
```

5. **Acesse a aplicação:**
```
http://localhost:3000
```

## 🎮 Comandos do Chat

- `/treinar` - Ativar modo de treinamento
- `/sair` - Sair do modo de treinamento
- `/listar` - Ver conhecimento aprendido
- `/esquecer [pergunta]` - Esquecer conhecimento específico

## 🛠️ Tecnologias

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript
- **IA**: Google AI (Gemini), Sistema de fallback inteligente
- **Outras**: CORS, dotenv

## 📁 Estrutura do Projeto

```
Site/
├── server/
│   ├── public/          # Frontend (HTML, CSS, JS)
│   ├── index.js         # Servidor principal
│   ├── package.json     # Dependências
│   └── .env            # Variáveis de ambiente (opcional)
├── README.md
└── .gitignore
```

## 🌐 Deploy

Este projeto está configurado para deploy em plataformas como:
- Heroku
- Vercel
- Railway
- Render

## 📝 Licença

ISC License

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.
