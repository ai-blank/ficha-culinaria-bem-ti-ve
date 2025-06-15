
# Ficha Técnica Culinária - API

API RESTful completa para sistema de gerenciamento de fichas técnicas culinárias, desenvolvida com Node.js, Express e MongoDB.

## 🚀 Características

- **Autenticação JWT** com registro, login e recuperação de senha
- **Autorização baseada em roles** (admin/usuário comum)
- **CRUD completo** para usuários, ingredientes e fichas técnicas
- **Validação robusta** de dados de entrada
- **Documentação automática** com Swagger
- **Tratamento de erros** padronizado
- **Paginação e busca** em todas as listagens
- **Envio de emails** para verificação e recuperação de senha
- **Segurança** com Helmet e Rate Limiting

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados
- **Swagger** - Documentação da API
- **Nodemailer** - Envio de emails

## 📦 Instalação

### Pré-requisitos
- Node.js (v16 ou superior)
- MongoDB (local ou Atlas)
- Conta de email para envio (Gmail, etc.)

### Configuração

1. **Clone e instale dependências:**
```bash
cd server
npm install
```

2. **Configure variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ficha_tecnica_db
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_ou_app_password
EMAIL_FROM=noreply@fichaTecnica.com
FRONTEND_URL=http://localhost:3000
```

3. **Inicie o servidor:**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📚 Documentação da API

A documentação completa está disponível em: `http://localhost:5000/api-docs`

### Endpoints Principais

#### 🔐 Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/confirm` - Confirmação de email
- `POST /api/auth/forgot-password` - Solicitar reset de senha
- `POST /api/auth/reset-password` - Redefinir senha
- `GET /api/auth/me` - Dados do usuário logado

#### 👤 Usuários
- `GET /api/users` - Listar usuários (admin)
- `PATCH /api/users/:id` - Atualizar usuário
- `PATCH /api/users/:id/status` - Ativar/desativar usuário (admin)

#### 🧂 Ingredientes
- `GET /api/ingredientes` - Listar ingredientes
- `POST /api/ingredientes` - Criar ingrediente
- `PATCH /api/ingredientes/:id` - Atualizar ingrediente
- `PATCH /api/ingredientes/:id/status` - Ativar/desativar ingrediente

#### 📄 Fichas Técnicas
- `GET /api/fichas` - Listar fichas técnicas
- `POST /api/fichas` - Criar ficha técnica
- `PATCH /api/fichas/:id` - Atualizar ficha técnica
- `PATCH /api/fichas/:id/status` - Ativar/desativar ficha
- `POST /api/fichas/:id/clonar` - Clonar ficha técnica

## 🔒 Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer <seu_jwt_token>
```

## 📧 Configuração de Email

Para Gmail, use uma senha de aplicativo:
1. Ative a verificação em duas etapas
2. Gere uma senha de aplicativo
3. Use a senha gerada no `.env`

## 🧪 Testes

```bash
npm test
```

## 🚀 Deploy

### Preparação para produção:
1. Configure `NODE_ENV=production`
2. Use banco MongoDB Atlas
3. Configure serviço de email profissional
4. Ajuste URLs do frontend

## 🔧 Estrutura do Projeto

```
server/
├── src/
│   ├── config/          # Configurações (DB, Swagger)
│   ├── controllers/     # Lógica de negócio
│   ├── middleware/      # Middlewares customizados
│   ├── models/         # Modelos do MongoDB
│   ├── routes/         # Definição das rotas
│   ├── services/       # Serviços auxiliares
│   └── server.js       # Arquivo principal
├── .env.example        # Exemplo de variáveis
├── package.json        # Dependências
└── README.md          # Esta documentação
```

## 🔄 Expansões Futuras

A API está preparada para:
- Sub-fichas técnicas
- Relatórios de custos
- Histórico de preços
- Gestão de fornecedores
- Controle de estoque

## 🐛 Tratamento de Erros

Todas as respostas seguem o padrão:
```json
{
  "success": true/false,
  "message": "Mensagem descritiva",
  "data": { ... },
  "errors": [ ... ]
}
```

## 📊 Status Codes

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.
