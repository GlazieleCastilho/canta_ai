-- Canta Aí — schema do banco (rodar no SQL Editor do painel do Supabase)

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

-- Todo acesso ao banco passa pelo servidor (service role), que ignora RLS.
-- Ligar RLS sem políticas bloqueia acesso direto com a chave anon.
alter table songs enable row level security;
alter table background_videos enable row level security;
alter table queue enable row level security;

-- Bucket público de mídia (leitura pública para tocar mp3/mp4 no navegador;
-- escrita só via URLs assinadas geradas pelo servidor).
insert into storage.buckets (id, name, public)
values ('midia', 'midia', true)
on conflict (id) do nothing;
