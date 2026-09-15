# Checklist de publicação

Este documento separa duas coisas: **aprovação local** (o código desta branch funciona como especificado, verificado em máquina local) e **prontidão de publicação** (dados reais e decisões necessárias antes de colocar o site no ar). Aprovação local não autoriza publicação.

## 1. Aprovação local (revisado em 2026-09-15, branch `codex/signals-ordered-list`)

### Verificações executadas

- [x] `npm test`: 2 arquivos, 6 testes aprovados (URL do WhatsApp, URL pública, FAQPage JSON-LD e serialização segura).
- [x] `npm run build` (inclui `astro check`): 0 erros, 0 avisos, 0 dicas; build estático concluído.
- [x] `npm run test:e2e`: 66 testes aprovados em 3 arquivos (`desktop.spec.ts`, `evaluation-benefits.spec.ts`, `responsive.spec.ts`).
- [x] Origem do E2E comprovada: o Playwright compila este worktree e sobe `astro preview` na porta dedicada `4337` (sobrescrevível com `E2E_PORT`), sem reutilizar servidor existente. Antes dos testes, `tests/e2e/verify-origin.mjs` compara o HTML servido com `dist/index.html` byte a byte. Porta ocupada gera erro explícito (`is already used`).
- [x] Testes antes instáveis agora medem estado final: cor do `summary` dos sinais lida só após o fim das transições; atrasos de entrada comparados em milissegundos (o build minificado grava `100ms` como `.1s`). Repetidos 5 vezes cada, sem falha.
- [x] QA independente: Farol APROVADO LOCAL; Iris (visual) e Verbo (editorial) APROVADO.
- [ ] Revalidação do Farol para a rodada 2 de correções (F-01 a F-04, I-01): pendente.

### Layout e interações cobertos por E2E

- [x] Página sem rolagem horizontal em 375, 390, 768, 1024, 1280, 1440 e 1920 px; um único H1; seções com H2.
- [x] Menu mobile (até 959 px): botão "Menu" com `aria-expanded`/`aria-controls`, abre por clique e teclado, fecha com Escape em qualquer ponto (foco volta ao botão), ao tocar fora do cabeçalho, quando o foco sai do cabeçalho e ao navegar; links com 48 px de altura. Sem JavaScript, a navegação continua visível, com links azul-marinho sobre fundo claro e, até 959 px, cabeçalho fora do modo fixo. A partir de 960 px, navegação em linha sem botão.
- [x] Cabeçalho: links creme sobre a foto do hero; após o hero, fundo claro e links azul-marinho.
- [x] Sinais: introdução centralizada; retrato 4:5 e lista `ul/li` com `details/summary` em duas colunas no desktop, com topo e base alinhados com todos os itens fechados; cada item abre sem cortar texto, sem rolagem interna e sem mover o retrato; exclusividade entre itens; texto azul-marinho em hover/foco com sublinhado e contorno de foco; indicador de aberto/fechado preservado com movimento reduzido. Em telas estreitas: introdução, retrato, lista e ação empilhados.
- [x] FAQ em 375 e 390 px: pelo menos 12 px entre o texto da pergunta e o indicador +/−.
- [x] Avaliação em azul-claro `#e3f0f2`, Áreas em pêssego suave `#f1e5dd`, FAQ em creme `#f7f2ee`; introduções de Sinais, Áreas e FAQ no mesmo eixo central.
- [x] Áreas: grade 3 × 2 no desktop, 2 colunas em tablet, 1 coluna em telas até 599 px.
- [x] FAQ nativo com uma resposta aberta e teclado; FAQPage JSON-LD gerado de `faqItems`, idêntico ao texto visível, com `<` escapado. A marcação não gera rich result no Google desde maio de 2026; não prometer destaque em buscas.
- [x] Textos aprovados em 14/09/2026 renderizados (About, Avaliação, Áreas, FAQ).
- [x] Localizações: três mapas na ordem Clínica Senses, Clínica Sinapse e CliniPrev, com controle por teclado.
- [x] CTA final com movimento ligado à rolagem, inerte com movimento reduzido e legível sem JavaScript.

## 2. Prontidão de publicação (gates abertos)

| Item | Estado verificável na fonte | Gate |
| --- | --- | --- |
| WhatsApp | `src/config/site.ts` publica `5515992719708` quando `PUBLIC_WHATSAPP_NUMBER` não está definido. Todos os CTAs apontam para `wa.me`. | Confirmar que o número está correto, quem responde e o prazo de resposta. Decidir se o número continua versionado ou passa a vir só do ambiente de publicação. |
| Endereços | `src/data/locations.ts` publica três endereços com mapa: Clínica Senses (Alameda Toledo Ribas, 628 — Centro, CEP 18400-060), Clínica Sinapse (Rua Flauzino Antunes, 14 — Centro, CEP 18400-220) e CliniPrev (Rua Santos Dumont, 221 — Centro, sem CEP). | Confirmar com a profissional os três locais, dias de atendimento e o CEP da CliniPrev. |
| URL pública | `PUBLIC_SITE_URL` ausente no build revisado: `canonical` e `og:url` são omitidos. | Definir o domínio real no ambiente de publicação. Não inventar domínio. |
| CRFa | Não configurado como texto (`siteConfig.crfa` vazio), mas o número "CRFa 2-23944" está embutido na imagem do logotipo (`public/images/logo-maisa.webp`), exibida no cabeçalho e no rodapé. | Confirmar o número mostrado no logotipo antes da publicação; confirmar também antes de publicá-lo como texto legível. |
| Horários e CNPJ | Não configurados; não exibidos. | Confirmar, se aplicável, antes de exibir. |
| Política de privacidade | Sem URL; o rodapé não exibe link. | Criar conteúdo real e fornecer URL antes de incluir o link. |
| `og:image` | Ausente. | Definir imagem de compartilhamento, se desejado. |
| Áreas de atuação | Textos aprovados pelo usuário em 14/09/2026. | Manter validação clínica documentada, em especial fluência, leitura e escrita e deficiência auditiva. |
| Desempenho | Imagem do hero `HERO-extended.png` com 1,58 MB. Lighthouse não medido: não havia ferramenta disponível e nenhum pacote foi adicionado para isso. | Otimizar a imagem do hero e medir Lighthouse (Performance ≥ 90; Accessibility, Best Practices e SEO ≥ 95) antes de publicar. |

## 3. Conteúdo e operação

- [ ] Obter aprovação clínica/editorial para as seis respostas do FAQ antes da publicação.
- [ ] Confirmar que não há promessa de serviço, disponibilidade, valor, convênio ou duração de atendimento não documentada.
