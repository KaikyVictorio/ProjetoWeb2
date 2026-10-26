# Telas de login e cadastro (estáticas, prontas para o back-end)

Stack: React + Tailwind CSS v4 (Vite). Testado com React 18 e Tailwind 4.1.
Este pacote **substitui o da tela de login**: as duas telas agora dividem o mesmo layout.

## O que mudou desde a tela de login

| Antes | Agora |
| --- | --- |
| `components/login/PainelBoasVindas.jsx` | Movido para `components/auth/PainelBoasVindas.jsx`, com textos para login e cadastro |
| Layout dentro de `pages/Login.jsx` | `components/auth/LayoutAutenticacao.jsx`, usado pelas duas páginas |
| `ROTAS_LOGIN` dentro do `FormularioLogin.jsx` | `src/rotas.js` (`ROTAS`), usado por todo o projeto |
| Botão "mostrar" escrito no formulário | `components/auth/BotaoMostrarSenha.jsx` |
| `CampoTexto` com erro e elemento à direita | Também aceita `dica` (texto de ajuda) e `prefixo` (ex.: "@") |

Os ids da tela de login continuam os mesmos.

## Arquivos

| Arquivo | O que faz |
| --- | --- |
| `src/pages/Login.jsx` | Página de login |
| `src/pages/Cadastro.jsx` | Página de cadastro |
| `src/components/auth/LayoutAutenticacao.jsx` | Barra do topo + painel + card, comum às duas telas |
| `src/components/auth/PainelBoasVindas.jsx` | Lado esquerdo com as capas livro/série/jogo |
| `src/components/auth/BotaoMostrarSenha.jsx` | Botão mostrar/ocultar senha |
| `src/components/login/FormularioLogin.jsx` | Formulário de login |
| `src/components/cadastro/FormularioCadastro.jsx` | Formulário de cadastro |
| `src/components/ui/CardJanela.jsx` | Card "janela" com as três bolinhas |
| `src/components/ui/CampoTexto.jsx` | Campo com rótulo, dica, erro, prefixo e elemento à direita |
| `src/components/ui/Logo.jsx` | Logo (`NOME_PROJETO`) |
| `src/rotas.js` | Caminhos das páginas |
| `src/utils/validacoes.js` | Regras de login e cadastro |
| `src/services/authService.js` | `entrar` e `cadastrar`: simulados hoje, versão real comentada |
| `src/index.css` | Cores, `font-menu` e classes retrô |

## Cadastro: campos e regras

Os campos seguem a tabela `usuarios` do banco.

| Campo | id | Regra |
| --- | --- | --- |
| Nome de usuário | `cadastro-nome-usuario` | 3 a 30 caracteres; letras minúsculas, números, ponto ou underline. Maiúsculas viram minúsculas e espaços são removidos enquanto a pessoa digita |
| E-mail | `cadastro-email` | Formato nome@dominio.com |
| Senha | `cadastro-senha` | Pelo menos 6 caracteres |
| Confirmar senha | `cadastro-confirmar-senha` | Igual à senha. O botão "mostrar" vale para os dois campos |
| Termos de uso | `cadastro-termos` | Obrigatório marcar |

Outros ids: `formulario-cadastro`, `cadastro-erro-geral`, `botao-criar-conta`,
`botao-mostrar-senha-cadastro`, `link-termos-de-uso`, `link-ir-para-login`, `link-topo-entrar`.

## Como integrar

1. Copie a pasta `src` para o projeto. Se já tiverem copiado a tela de login,
   apague `src/components/login/PainelBoasVindas.jsx` (ele mudou de pasta).
2. **index.css:** junte as variáveis do `@theme` e o bloco `@layer components`, se ainda não estiverem lá.
3. **Fonte Hanken Grotesk** no `<head>` do `index.html`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;700;800&display=swap" rel="stylesheet" />
   ```
4. Rotas (exemplo com React Router):
   ```jsx
   <Route path="/login" element={<Login />} />
   <Route path="/cadastro" element={<Cadastro />} />
   ```

## Quando o back-end existir

1. Em `services/authService.js`, apague os blocos "Simulação" e descomente as linhas "Versão real".
   O cadastro faz `POST /auth/cadastro` com `{ nome_usuario, email, senha }`.
2. Se o e-mail ou o nome de usuário já existir, o back-end deve responder com erro e `{ mensagem }`.
   A mensagem aparece sozinha no topo do formulário (`cadastro-erro-geral`).
3. Crie um `.env` com `VITE_API_USUARIOS_URL` apontando para o serviço de usuários.
4. Em `pages/Cadastro.jsx` (`aoCadastrar`) e `pages/Login.jsx` (`aoEntrar`), salve o token e redirecione.
5. Com React Router, troque os `<a href>` por `<Link to>`; os caminhos ficam em `src/rotas.js`.
