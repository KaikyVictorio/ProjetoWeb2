# ProjetoWeb2
<img width="1890" height="860" alt="image" src="https://github.com/user-attachments/assets/53782299-5213-4f56-ba57-b8f4e898d168" />


Sistema web de plataforma social pensada para comunidade geek, onde o usuário consegue registrar e compartilhar o que leu, assistiu e jogou, tudo no mesmo lugar. Inspirada no Letterboxd, mas com foco em livros, séries e jogos invés de filmes. <br> Cada usuário monta seu perfil, loga obras, escreve reviews, visualiza reviews de outros usuários, mantém favoritos e uma wishlist, e descobre outros usuários pela busca e pelas reviews

## Tecnologias
Front-end: React, React Router, Tailwind CSS <br>
Back-end: Node.js 22, Express, SQLite (`node:sqlite`, sem dependência nativa), JWT <br>
Infraestrutura: Docker

## Como executar
### Pré-requisitos
Node.js 22.13 ou superior (para rodar sem Docker) <br>
Docker Desktop (para rodar com Docker)

### Com Docker
```
git clone https://github.com/KaikyVictorio/ProjetoWeb2.git
cd ProjetoWeb2
docker compose up --build
```
Aplicação em http://localhost:5173 (API em http://localhost:3001). O banco fica no volume `dbdata` e sobrevive a reinícios.

### Sem Docker
```
# terminal 1
cd server && cp .env.example .env && npm install && npm run dev
# terminal 2
cd client && npm install && npm run dev
```

### Dados de exemplo
Na primeira execução o banco é populado com obras, usuários, logs, listas etc.
Login de teste: **ana@email.com** / **123456** (outros: anasouza@, brunolima@, carlam@, diegoalves@email.com, mesma senha).
Para começar do zero, apague o volume (`docker compose down -v`) ou a pasta `server/data`. Para subir sem os exemplos, use `SEED=false`.

### Testes da API
```
cd server && npm test
```

## O que é CRUD no sistema
| Recurso | Criar | Ler | Atualizar | Excluir |
| --- | --- | --- | --- | --- |
| Conta | cadastro | perfil público/próprio | editar perfil | excluir conta |
| Obras | cadastrar obra | busca e página da obra | editar (quem cadastrou) | excluir (quem cadastrou) |
| Logs / reviews | modal "novo log" | perfil, página da obra, home | editar log | excluir log |
| Listas | criar lista | listas, perfil | editar lista | excluir lista |
| Favoritos, wishlist, rotação atual | adicionar | perfil | – | remover |
| Nota da obra | dar nota | média na obra | mudar nota | nota 0 remove |
| Seguir | seguir | contadores | – | deixar de seguir |

## API (resumo)
`/api/auth` (cadastro, login, me) · `/api/usuarios` · `/api/obras` · `/api/logs` · `/api/listas` · `/api/me/{favoritos,wishlist,rotacao}`.
Erros voltam como `{ "mensagem": "..." }`. Rotas de escrita exigem `Authorization: Bearer <token>`.
