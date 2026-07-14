# Canta Aí 🎤

Karaokê hospedado com fila ao vivo: convidados entram na fila pelo celular (QR code),
o anfitrião controla tudo por um painel, e o telão toca a música com letra sincronizada,
pontuação por microfone e vídeos de fundo sorteados por estilo.

Evolução hospedada do protótipo de arquivo único (`prototype-karaoke.html`), seguindo o
plano de `arquitetura-hospedagem.md`.

## Telas

| Rota | Quem usa | O que faz |
|---|---|---|
| `/entrar` | Convidados (celular) | Escolher nome + música e entrar na fila. |
| `/admin` | Anfitrião (senha) | Cadastrar músicas (mp3 + lrc + estilo) e vídeos de fundo por estilo, gerenciar a fila, exibir o QR code. |
| `/palco` | TV / telão do evento | Vídeo + áudio sincronizados, letra linha a linha, pontuação por microfone, próximos da fila. |

## Rodando localmente

1. Crie um projeto no [Supabase](https://supabase.com) e rode `supabase/schema.sql` no SQL Editor
   (cria as tabelas e o bucket público `midia`).
2. Copie `.env.local.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (Settings → API — **nunca** exponha no client)
   - `ADMIN_PASSWORD` (a senha do painel `/admin`)
3. `npm install && npm run dev` → http://localhost:3000

## Deploy na Vercel

1. Suba este repositório no GitHub.
2. Importe na [Vercel](https://vercel.com) e cole as 4 variáveis de ambiente.
3. Deploy — o QR code do `/admin` já aponta para `https://SEU-DOMINIO.vercel.app/entrar`.

## Avisos do plano gratuito

- **Supabase free**: 1GB de Storage e pausa o projeto após ~7 dias sem uso
  (reabra no painel antes do evento). Prefira poucos vídeos de fundo genéricos
  e reaproveitáveis por estilo em vez de um vídeo por música.
- **Vercel Hobby**: uso não-comercial.

## Como o vídeo de fundo é escolhido

Cada música tem um estilo; a biblioteca de vídeos também é taggeada por estilo.
Na hora de tocar, o `/palco` sorteia um vídeo entre os do estilo da música — e,
se ainda não houver nenhum daquele estilo, sorteia entre todos (fallback).

## Uploads

Os arquivos mp3/mp4 sobem **direto do navegador para o Supabase Storage** via URL
assinada gerada pelo servidor (`/api/upload-url`) — isso evita o limite de ~4,5MB
de body das functions da Vercel.
