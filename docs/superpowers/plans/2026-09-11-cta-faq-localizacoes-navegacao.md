# CTA, FAQs, localizações e navegação — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Destacar o CTA com a animação fornecida, centralizar as FAQs, adicionar três mapas corretos e tornar o cabeçalho mais translúcido, preservando a identidade do site.

**Architecture:** Manter Astro e CSS nativos. Isolar a animação do CTA dos scripts das FAQs; cadastrar localizações em dados tipados e renderizar os mapas em uma seção própria, depois do CTA e antes do rodapé.

**Tech Stack:** Astro 5, TypeScript, CSS, Figtree local, Vitest e Playwright existentes. Sem novas dependências.

**Spec:** Pedido do usuário de alterações em quatro áreas; especificação visual e funcional abaixo, neste documento.

**Status:** Implementado em 11/09/2026. O usuário confirmou o link da Clínica Sinapse e o endereço da CliniPrev.

## Global Constraints

- Preservar Figtree e os tokens atuais: creme #f7f2ee, azul-marinho #30566a, azul-claro #e3f0f2, grafite #4a4541, oliva #8d805f e pêssego #d7a98d.
- Não copiar conteúdo, fontes ou cores do site de referência ou do CTA.json.
- CTA.json contém um exemplo React, não um arquivo Lottie: aproveitar somente a animação, sem instalar React, Tailwind, shadcn ou dependências indicadas pelo arquivo.
- Preservar os textos do CTA e das FAQs, o WhatsApp (15) 99271-9708, o rastreamento existente e as demais seções.
- Não alterar a foto do Hero ou os arquivos não relacionados que já estão modificados/não rastreados.
- Não publicar, criar repositório ou realizar alterações remotas nesta entrega.
- O site atual tem largura mínima de 1024px. Não ampliar esta tarefa para uma reformulação mobile global.

## Especificação aprovada apenas após confirmação do usuário

### 1. CTA

Manter a âncora #contato e a copy atual de “UM PRIMEIRO PASSO, NO SEU TEMPO”. Remover o PictureFrame e o espaço reservado para a foto somente desta seção. Criar painel centralizado azul-marinho sobre fundo creme, com cantos de 24px, texto creme e botão pêssego com texto escuro. Limitar o texto para leitura confortável, sem ocupar toda a largura do painel.

Entrada única ao entrar na área visível: selo em 100ms, título em 200ms, descrição em 300ms, ação em 500ms e brilho em 700ms. Cada efeito dura 500ms, ease-out. Textos passam de opacity 0/translateY(10px) a opacity 1/translateY(0); brilho passa de scale(.95)/opacity 0 a scale(1)/opacity 1. Brilho interno pêssego, suave, inspirado no arquivo, sem pulsação contínua. O detalhe de contato acompanha o grupo da ação. Informações condicionais de contato continuam disponíveis.

Conteúdo visível sem JavaScript. prefers-reduced-motion elimina movimento e espera. A camada de brilho usa aria-hidden e pointer-events:none; não cobre o botão ou o foco.

### 2. FAQs

Centralizar o conjunto em uma coluna de até 820px: introdução acima, botão atual mantido e acordeão abaixo. Centralizar título, descrição, perguntas e respostas. Preservar seis perguntas, respostas, ordem, primeiro item aberto, exclusividade, navegação por teclado, indicadores e animação por caracteres. Esta tarefa altera somente CSS de alinhamento/disposição; não reescreve dados nem lógica.

Reservar espaço simétrico nas laterais das perguntas para que o indicador à direita não desloque visualmente o centro do texto.

### 3. Localizações

Nova última seção de conteúdo, #localizacoes, entre Contact e Footer. Título sugerido: “Onde encontrar o atendimento”. Três colunas iguais: Clínica Senses à esquerda, Clínica Sinapse no meio, Clínica Prever à direita. Cada bloco contém nome, endereço, iframe real do Google Maps com cantos arredondados e link “Como chegar”. Usar loading="lazy", título acessível e altura explícita de aproximadamente 300px para evitar deslocamento de layout. Endereço e link ficam disponíveis mesmo se o iframe falhar.

A referência usa três mapas simultâneos, não carrossel ou abas. Copiar apenas esse comportamento. Não reutilizar os endereços ou embeds das clínicas do site de referência.

### 4. Navegação

O cabeçalho existente já é sticky, tem 88px e blur de 12px. Manter isso, incluindo logo, links, botão, offsets de âncora e mudança de estado ao rolar. Tornar o fundo creme mais transparente: proposta inicial alpha .72 no topo e .86 após rolagem, com transição suave e fallback creme opaco sem suporte a backdrop-filter. Validar contraste sobre todas as seções.

A barra da referência tem fundo semitransparente e blur; não copiar sua posição absoluta nem sobrepor o Hero, pois isso alteraria outra seção.

## Pesquisa de endereços — 11/09/2026

| Clínica | Evidência encontrada | Decisão |
| --- | --- | --- |
| Senses | Cartão do Google Maps: Alameda Toledo Ribas, 628, Centro, Itapeva–SP, 18400-060. Compartilhamento: https://maps.app.goo.gl/wMjFU8sUqFeVpfbg7 | Usar este local; reabrir o cartão antes de extrair o iframe oficial. |
| Sinapse | O usuário confirmou o cartão do Google Maps com ftid 0x94c38d0fd4dbe463:0x35e0728d81df6a0. | Usar o link fornecido e a localização Sinapse Desenvolvimento Humano, Rua Flauzino Antunes, 14. |
| CliniPrev | O usuário confirmou Rua Santos Dumont, 221, Centro, Itapeva–SP. | Usar o endereço fornecido; não usar o resultado da funerária na numeração 222. |

Fontes auxiliares:

- Referência funcional: https://www.dradalilamota.com.br/
- Sinapse, perfil de profissional: https://www.doctoralia.com.br/leandra-garcia/nutricionista/itapeva2
- Sinapse, registro de alteração de rede: https://unimedsudoestepaulista.coop.br/alteracao-da-rede-credenciada
- Link da própria Sinapse consultado na pesquisa: https://linktr.ee/sinapsedesenvolvimento

Os conflitos são dependências explícitas de dados, não autorização para inventar endereços. Após aprovação, tarefas 1, 2 e 4 podem avançar independentemente. A tarefa 3 só fica concluída com os três locais confirmados e seus embeds conferidos.

## Mapa de arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| src/components/sections/Contact.astro | Painel sem foto, grupos de animação e import do script isolado |
| src/scripts/cta-motion.ts (novo) | Ativação única por IntersectionObserver e fallback |
| src/styles/components.css | Aparência do CTA, alinhamento FAQ, mapas e vidro do header |
| src/styles/motion.css | Keyframes do CTA e redução de movimento |
| src/data/locations.ts (novo) | Dados dos três locais efetivamente confirmados |
| src/components/sections/Locations.astro (novo) | Apresentação acessível dos mapas |
| src/pages/index.astro | Inserir Locations depois de Contact |
| tests/e2e/desktop.spec.ts | Ajustar contratos antigos do CTA e verificar os comportamentos novos |
| docs/release-checklist.md | Atualizar apenas os itens afetados após verificação |

## Tarefa 1 — CTA animado sem foto

**Interface:** consumir content.contact e getWhatsAppUrl() existentes; manter whatsappLocation="contato". O script consulta [data-cta] e adiciona a classe cta-animate uma única vez; os grupos usam data-cta-step.

- [ ] Adaptar os testes que esperam retrato e duas colunas no CTA. Verificar ausência de .contact__portrait, presença da copy atual e link contendo 5515992719708. Executar o teste direcionado e constatar a falha esperada antes da mudança.
- [ ] Em Contact.astro, remover import e instância de PictureFrame. Manter #contato, contact-title, Button e informações condicionais. Agrupar botão e detalhe; adicionar camada decorativa aria-hidden.
- [ ] Em components.css, substituir grid com coluna de foto por painel centralizado. Remover também os overrides de largura de retrato em media queries, sem afetar PictureFrame de outras seções.
- [ ] Em motion.css, criar keyframes exclusivos do CTA:

```css
@keyframes cta-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes cta-scale-in {
  from { opacity: 0; transform: scale(.95); }
  to { opacity: 1; transform: scale(1); }
}
.cta-animate [data-cta-step] {
  animation: cta-fade-up 500ms ease-out both;
  animation-delay: var(--cta-delay, 0ms);
}
.cta-animate .contact__glow {
  animation: cta-scale-in 500ms ease-out 700ms both;
}
@media (prefers-reduced-motion: reduce) {
  .cta-animate [data-cta-step], .cta-animate .contact__glow {
    animation: none;
  }
}
```

- [ ] Criar cta-motion.ts: consultar [data-cta]; sair sem esconder conteúdo se houver movimento reduzido ou IntersectionObserver indisponível. Observar com threshold .12; ao intersectar, adicionar cta-animate e executar unobserve. Não usar o mecanismo de animação das FAQs. Definir delays 100/200/300/500ms nos quatro grupos.
- [ ] Executar o teste ajustado, conferir entrada visual e confirmar que voltar à seção não reinicia a animação. Com JS desativado e com movimento reduzido, todos os textos e o botão devem permanecer legíveis e acionáveis.

## Tarefa 2 — Centralização das FAQs

**Interface:** preservar o DOM e dados de Faq.astro; alterar as regras .faq__layout, .faq__intro, summary e .faq__answer.

- [ ] Registrar o conteúdo e comportamento atuais usando os testes existentes de FAQ como contrato de regressão.
- [ ] Aplicar grid-template-columns: minmax(0, 1fr), max-width: 820px, margin-inline:auto e text-align:center ao conjunto. Centralizar o bloco de descrição com margin-inline:auto.
- [ ] Usar summary como grid de três colunas 28px/minmax(0,1fr)/28px; colocar o primeiro span na coluna 2 e indicador na 3. Trocar padding assimétrico da resposta por padding lateral simétrico.
- [ ] Conferir perguntas e respostas longas sem colisão com os indicadores. Reexecutar os testes existentes de abertura exclusiva, teclado e animação. Não mudar src/scripts/site-interactions.ts ou src/data/content.ts para esta tarefa.

## Tarefa 3 — Mapas das clínicas

**Interface:** criar tipo ClinicLocation com id, name, address, embedUrl e mapsUrl, todos string; exportar locations: readonly ClinicLocation[] na ordem senses, sinapse, prever. Locations.astro consome esse array.

- [ ] Obter do usuário a identificação da Sinapse e Prever. Abrir cada cartão correto no Google Maps, comparar nome/endereço e obter Compartilhar > Incorporar um mapa. Guardar o src real e o link de rotas/compartilhamento. Não fabricar parâmetros pb ou Place IDs.
- [ ] Criar locations.ts somente com os três registros confirmados. Não renderizar registros incompletos ou mapas de busca genérica como se fossem unidades confirmadas.
- [ ] Criar Locations.astro com section#localizacoes, heading e um article por local. Estrutura do mapa:

```astro
<iframe
  src={location.embedUrl}
  title={`Localização da ${location.name} em Itapeva`}
  loading="lazy"
  width="100%"
  height="300"
  referrerpolicy="no-referrer-when-downgrade"
  allowfullscreen
></iframe>
<a href={location.mapsUrl} target="_blank" rel="noopener noreferrer">Como chegar</a>
```

- [ ] Aplicar grid de três colunas iguais, gap de 24px, títulos azul-marinho, textos grafite e bordas discretas da paleta. Inserir o componente após Contact em index.astro, mantendo Footer fora de main.
- [ ] Adicionar verificação de três iframes com titles únicos e loading lazy; nomes na ordem solicitada; links e src iguais aos dados verificados. Conferir manualmente se os pinos apontam às clínicas corretas. Não exigir renderização de pixels de terceiros em teste automatizado.

## Tarefa 4 — Cabeçalho translúcido

**Interface:** preservar .site-header e seu atributo data-scrolled já controlado pelo Header.astro.

- [ ] Ajustar apenas background e transição; preservar sticky, top:0, z-index, altura de 88px e blur de 12px. Usar fundo sólido por padrão e aplicar alpha via @supports de backdrop-filter (incluindo prefixo webkit).
- [ ] Usar .72 no topo e .86 em data-scrolled="true" como ponto inicial. Se contraste ficar insuficiente, aumentar opacidade dentro da mesma cor creme.
- [ ] Executar a verificação existente de estabilidade da altura e de âncoras abaixo do cabeçalho. Conferir visualmente topo, rolagem e foco de teclado sobre fundos claros e escuros.

## Tarefa 5 — Verificação e entrega

- [ ] Rodar npm test, npm run build e npm run test:e2e. Registrar resultados reais e investigar qualquer regressão dentro do escopo antes de declarar conclusão.
- [ ] Conferir a página em 1024, 1280, 1440 e 1920px: CTA sem foto, tipografia e paleta intactas, FAQ central, ordem dos mapas e cabeçalho sem salto de layout.
- [ ] Verificar WhatsApp sem enviar mensagem, movimento reduzido, conteúdo do CTA sem JS e legibilidade dos endereços quando mapas externos não carregam.
- [ ] Revisar git diff para confirmar que alterações não relacionadas foram preservadas. Atualizar apenas itens pertinentes de docs/release-checklist.md; não marcar as localizações como verificadas se ainda houver dúvida.
- [ ] Abrir a prévia local atualizada para avaliação e relatar mudanças e pendências. Sem publicação ou commit de arquivos não relacionados.

## Revisão do plano

As quatro solicitações têm tarefas correspondentes. Não há mudança de paleta, fonte, copy de FAQ ou animação de FAQ. A foto removida pertence somente ao CTA. As pendências de endereço estão delimitadas e impedem a inclusão de mapas incorretos. A implementação aguarda aprovação explícita.
