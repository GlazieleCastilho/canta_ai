# Prompt para usar no Claude Code

Copie o texto abaixo e cole no Claude Code, dentro de uma pasta com o `karaoke.html`, `documentacao-karaoke.md` e `arquitetura-hospedagem.md`.

```
Este projeto começou como um protótipo de karaokê em um único arquivo
(karaoke.html — HTML/CSS/JS puro, sem backend). Leia documentacao-karaoke.md
(arquitetura do protótipo) e arquitetura-hospedagem.md (plano do backend
hospedado) nesta pasta antes de mexer em qualquer coisa.

Quero transformar isso em uma aplicação hospedada, seguindo exatamente o
plano descrito em arquitetura-hospedagem.md:

- Next.js, hospedado na Vercel.
- Banco de dados e armazenamento de arquivos (mp3/mp4/lrc) no Supabase
  (Postgres + Storage), conforme o schema já definido no documento.
- Três telas: /admin (protegida por senha única, em variável de ambiente),
  /entrar (pública, para convidados entrarem na fila pelo próprio celular
  via QR code) e /palco (tela do palco, TV/computador do evento).
- Vídeo de fundo não é mais um upload por música: cada música tem um
  "estilo" (ex: sertanejo, pop, rock), e existe uma biblioteca separada de
  vídeos de fundo também taggeados por estilo. Na hora de tocar, o /palco
  sorteia um vídeo entre os cadastrados no estilo da música (e sorteia
  entre todos os vídeos, como fallback, se não houver nenhum vídeo daquele
  estilo ainda). Isso está detalhado na seção 8 de arquitetura-hospedagem.md.
- Atualização da fila por polling (a cada poucos segundos), sem WebSockets
  por enquanto.
- Manter integralmente, rodando no navegador (client-side), a lógica já
  validada no protótipo: parser de LRC, sincronismo vídeo+áudio, detecção
  de pitch pelo microfone para pontuação, mensagens motivacionais e o
  alerta visual da fila no canto superior da tela do palco. Não reescreva
  essa lógica do zero — adapte o que já existe em karaoke.html para
  buscar músicas/fila da API em vez do estado local em memória.
- Manter a identidade visual atual (paleta, tipografia, luzes de marquise
  animadas) do protótipo.

Antes de escrever código:
1. Confirme comigo a estrutura de pastas do projeto Next.js.
2. Me avise sobre a limitação de armazenamento gratuito do Supabase (1GB)
   e me pergunte se quero usar poucos vídeos de fundo reaproveitáveis
   entre músicas (recomendado) ou vídeo exclusivo por música.
3. Só depois de eu confirmar, implemente.

Se algo não estiver claro no protótipo ou no plano de arquitetura, me
pergunte antes de assumir.
```
