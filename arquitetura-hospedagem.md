# Marquesa Karaokê — Arquitetura do backend hospedado

## 1. Stack recomendada

| Camada | Escolha | Por quê |
|---|---|---|
| Frontend + API | **Next.js**, hospedado na **Vercel** | Deploy automático a cada push, functions serverless integradas nas mesmas rotas do site, e é o ambiente com melhor suporte nativo da Vercel. |
| Banco de dados | **Supabase (Postgres)** | Postgres real, gratuito, já vem com painel para consultar dados. A Vercel descontinuou seu Postgres/KV próprios em dez/2024 e hoje aponta para parceiros como Neon/Supabase — então já começamos direto no Supabase em vez de passar por um serviço descontinuado. |
| Arquivos (mp3/mp4/lrc) | **Supabase Storage** | Fica no mesmo lugar do banco (um único painel/uma única conta para administrar), e evita depender de dois provedores diferentes. |
| Autenticação do admin | Senha única em variável de ambiente + cookie de sessão | Só existe um administrador — não precisa de sistema de contas completo. |
| Fila em tempo real | **Polling** (a cada 3–5s) nas telas de palco e admin | Mais simples e mais robusto de implementar do que WebSockets/Realtime numa Vercel serverless; dá pra evoluir para Supabase Realtime depois, se quiser instantâneo de verdade. |

## 2. Atenção aos limites do plano gratuito

Isso importa porque o app lida com vídeo, que pesa:

- **Supabase free**: 500MB de banco, **1GB de armazenamento de arquivos**, 5GB de tráfego de saída por mês, e o projeto **pausa sozinho após 7 dias sem uso** (basta reabrir no painel antes do evento, ou configurar um "ping" agendado).
- **Vercel free (Hobby)**: 100GB de banda, 1 milhão de invocações de função, uso restrito a projetos não-comerciais.

**Na prática**: 1GB de storage some rápido se cada música tiver um vídeo de fundo exclusivo em alta qualidade. A recomendação é usar **um punhado de vídeos de fundo genéricos e reaproveitáveis** (ex: 4–6 loops de "luzes de palco", "confete", "disco") em vez de um vídeo único por música — isso multiplica o número de músicas que cabem no plano gratuito sem custar nada. Se quiser vídeo exclusivo por música mesmo assim, comprimir o MP4 (resolução menor, poucos segundos em loop) ajuda bastante.

## 3. Estrutura de páginas

```
/admin          → painel do administrador (protegido por senha)
                   - cadastrar música (mp3 + lrc + escolher o estilo, ex: sertanejo/pop/rock)
                   - cadastrar vídeos de fundo por estilo (biblioteca separada da música)
                   - ver fila, remover/chamar ao palco
                   - exibir QR code da página de entrada dos convidados

/entrar         → página pública para convidados
                   - abrir pelo QR code no próprio celular
                   - escolher nome + música da biblioteca
                   - entra na fila

/palco          → tela do palco (TV/computador do evento)
                   - vídeo + áudio sincronizados
                   - letra linha a linha
                   - pontuação por microfone (mantém a lógica já validada no protótipo)
                   - alerta com os próximos da fila, no canto superior
```

## 4. Modelo de dados (Postgres)

```sql
create table songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  style text not null,       -- ex: 'sertanejo', 'pop', 'rock', 'mpb'...
  mp3_path text not null,    -- caminho no Supabase Storage
  lrc_text text not null,
  created_at timestamptz default now()
);

create table background_videos (
  id uuid primary key default gen_random_uuid(),
  style text not null,       -- mesma lista de estilos usada em songs.style
  mp4_path text not null,    -- caminho no Supabase Storage
  created_at timestamptz default now()
);

create table queue (
  id uuid primary key default gen_random_uuid(),
  singer_name text not null,
  song_id uuid references songs(id),
  status text not null default 'waiting',  -- waiting | performing | done
  created_at timestamptz default now()
);
```

## 5. Rotas de API (Next.js route handlers)

```
GET    /api/songs            lista músicas (usado no /admin e no /entrar)
POST   /api/songs            admin cadastra música (mp3 + lrc + estilo)
DELETE /api/songs/:id        admin remove música

GET    /api/videos           lista vídeos de fundo (com o estilo de cada um)
POST   /api/videos           admin cadastra vídeo de fundo (mp4 + estilo)
DELETE /api/videos/:id       admin remove vídeo de fundo

GET    /api/queue            lista a fila (polling do /admin e /palco)
POST   /api/queue            convidado entra na fila (rota pública)
DELETE /api/queue/:id        admin remove alguém da fila
POST   /api/queue/:id/call   admin chama ao palco (status -> performing)
POST   /api/queue/:id/done   encerra a performance atual (status -> done)
```

Todas as rotas de escrita usadas pelo `/admin` (POST/DELETE de songs, chamar/encerrar fila) exigem o cookie de sessão do administrador. `POST /api/queue` (convidado entrando na fila) fica pública, sem senha.

## 6. Variáveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # só no servidor, nunca no client
ADMIN_PASSWORD=
```

## 7. Passos de deploy

1. Criar projeto no Supabase → copiar URL e chaves → criar as tabelas do item 4 → criar um bucket de Storage (`midia`).
2. Criar repositório Git com o projeto Next.js.
3. Importar o repositório na Vercel → colar as variáveis de ambiente do item 6 → deploy.
4. Gerar o QR code da URL `https://SEU-DOMINIO.vercel.app/entrar` para exibir no evento (impresso ou na tela do `/admin`).

## 8. Seleção do vídeo de fundo

Junta as duas ideias — vídeo por estilo **e** aleatório — em vez de escolher uma só:

1. Cada música tem um `style` (ex: "sertanejo").
2. Cada vídeo de fundo cadastrado também tem um `style`. Pode haver **vários vídeos no mesmo estilo**.
3. Na hora de tocar, o `/palco` busca todos os vídeos com o `style` da música e **sorteia um deles**. Se houver 4 vídeos cadastrados como "sertanejo", cada apresentação sertaneja tem chance de vir com um fundo diferente — em vez de repetir sempre o mesmo.
4. Se nenhum vídeo tiver o estilo daquela música (ainda não foi cadastrado nenhum), o sistema sorteia entre **todos** os vídeos disponíveis, como fallback.

Isso resolve o problema de armazenamento (você sobe um punhado de vídeos por estilo, não um por música) e ainda evita que o mesmo fundo apareça toda vez que alguém canta uma música do mesmo estilo.

## 9. O que se mantém do protótipo atual

A lógica de sincronismo vídeo+áudio, o parser de LRC, a detecção de pitch pelo microfone e as mensagens motivacionais (tudo hoje em `karaoke.html`) continuam rodando **inteiramente no navegador** — isso não muda. O que este backend resolve é: persistir músicas e fila, e permitir que convidados entrem na fila pelo próprio celular.
