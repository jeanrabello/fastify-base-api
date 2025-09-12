# Módulo de Autenticação (Auth)

Este módulo implementa o sistema de autenticação usando JWT (JSON Web Tokens) para a API.

## Funcionalidades

- **Login**: Autenticação de usuários usando email + senha
- **Validação de Token**: Verifica se um token JWT é válido
- **Refresh Token**: Renovação de tokens de acesso usando refresh tokens

## Estrutura

```
src/modules/auth/
├── auth.routes.ts              # Definições de rotas
├── controllers/                # Controladores HTTP
│   ├── LoginController.ts
│   ├── ValidateTokenController.ts
│   └── RefreshTokenController.ts
├── useCases/                   # Lógica de negócio
│   ├── LoginUseCase.ts
│   ├── ValidateTokenUseCase.ts
│   └── RefreshTokenUseCase.ts
├── services/                   # Serviços auxiliares
│   ├── JWTAuthService.ts       # Manipulação de tokens JWT
│   └── UserService.ts          # Busca de usuários via axios
├── models/                     # Modelos de dados
│   ├── Request/
│   │   ├── LoginRequest.model.ts
│   │   ├── ValidateTokenRequest.model.ts
│   │   └── RefreshTokenRequest.model.ts
│   └── Response/
│       ├── LoginResponse.model.ts
│       ├── ValidateTokenResponse.model.ts
│       └── RefreshTokenResponse.model.ts
├── schemas/                    # Validação e documentação OpenAPI
│   ├── loginSchema.ts
│   ├── validateTokenSchema.ts
│   ├── refreshTokenSchema.ts
│   └── index.ts
├── types/                      # Interfaces e tipos
│   ├── IAuthTranslation.ts
│   └── IAuthService.ts
└── lang/                       # Internacionalização
    ├── pt-br.ts
    ├── en-us.ts
    └── index.ts
```

## Endpoints

### POST /auth/login

Autentica um usuário e retorna tokens de acesso.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

### GET /auth/validate

Valida um token JWT.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

### POST /auth/refresh

Renova tokens usando um refresh token.

**Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

## Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```bash
# JWT Authentication
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# User Service
USER_SERVICE_URL=http://localhost:3000/api/users
```

## Dependências

- `jsonwebtoken`: Para criação e validação de tokens JWT
- `axios`: Para buscar dados de usuários via HTTP
- `bcrypt`: Para verificação de senhas

## Arquitetura

O módulo segue os princípios de Clean Architecture:

1. **Controllers**: Manipulam requisições HTTP e delegam para use cases
2. **Use Cases**: Contêm a lógica de negócio
3. **Services**: Serviços auxiliares (JWT e busca de usuários)
4. **Models**: Objetos de transferência de dados
5. **Schemas**: Validação de entrada e documentação

## Desacoplamento

O módulo auth é completamente desacoplado do módulo user. Para buscar informações de usuários, ele utiliza o `UserService` que faz requisições HTTP via axios, respeitando os princípios de arquitetura modular.

## Segurança

- Tokens de acesso têm vida curta (15 minutos por padrão)
- Refresh tokens têm vida longa (7 dias por padrão)
- Senhas são verificadas usando bcrypt
- Tokens são validados antes de cada operação
