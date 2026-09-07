# Revisão integral — site Dra. Maisa Palma
Data: 6 de setembro de 2026

## Parecer

A identidade visual é apropriada para mães que buscam orientação: cores suaves, tipografia com personalidade e presença da profissional. A melhoria mais importante é tornar a jornada mais clara: reconhecer a dúvida, conhecer quem atende, entender a avaliação e encontrar um próximo passo simples no WhatsApp.

A base está bem encaminhada, mas “todas as seções desenhadas” ainda não significa frontend finalizado. A revisão encontrou conteúdo incompleto no FAQ, credencial provisória, contraste insuficiente em alguns elementos e excesso de repetição. Animação deve apoiar essa leitura, não ser o principal argumento do site.

## Escopo e evidências

- Inspeção visual das 20 telas principais do Figma: dez blocos desktop e os respectivos mobile, incluindo hero e rodapé.
- Extração da copy desktop e inspeção programática de fontes, tamanhos, preenchimentos, visibilidade e animações.
- Leitura de arquitetura-site-gemini.md e da nota do Obsidian. A nota está desatualizada sobre a conclusão das últimas seções.
- Arquivo Figma: https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV
- A pasta original contém imagens, logo e documentos, mas não contém frontend executável ou configuração de aplicação. Logo, esta é uma auditoria do projeto visual/editorial e dos requisitos de implementação, não de um site publicado.
- Não foram medidos Lighthouse, indexação, tráfego, conversas ou conversão real.
- Fotografias provisórias não foram avaliadas como defeitos; há um brief para a produção definitiva.
- As mudanças de copy e estrutura abaixo são propostas. O arquivo original do Figma permanece preservado nesta revisão.
- Entrega executável: demonstração independente de avaliação, flip cards, FAQ e feedback de CTA em motion-preview/. Não é o site completo nem integração com WhatsApp.

## Prioridades

| Prioridade | Achado | Ação |
|---|---|---|
| Alta | Cinco perguntas do FAQ têm apenas o estado fechado; há somente um nó de resposta no desktop | Redigir e validar todas as respostas; implementar accordion funcional |
| Alta | Texto “CRFa da profissional” na apresentação | Conferir a identificação oficial na logo e com a profissional; exibir como texto legível |
| Alta | Diversos CTAs usam navy sobre pêssego, contraste aproximado 3,73:1 | Escurecer o texto mantendo o fundo e a identidade |
| Alta | Eyebrows pêssego sobre creme e vários textos de 11–14 px | Corrigir contraste e aumentar os textos informativos |
| Alta | Promessa de “orientação inicial” e contato “direto” não tem operação confirmada | Descrever o que acontece no WhatsApp e confirmar quem responde |
| Alta | Cards de áreas incluem serviços cuja confirmação não está documentada | Validar cada área com a Dra. antes de publicar |
| Média | Hero acolhedora, mas complemento genérico | Acrescentar situações reconhecíveis pela mãe |
| Média | Avaliação e benefícios repetem argumentos | Separar “como acontece” de “o que a família ganha em clareza e apoio” |
| Média | Conversão final aparece antes do FAQ e contato repete a mesma persuasão | Propor FAQ antes da conversão e contato mais prático |
| Média | Conversão mobile tem texto decorativo sobreposto à microcopy | Reposicionar ou remover as palavras decorativas nessa versão |

## Revisão do começo ao fim

### 1. Header e hero

**Manter:** logo, headline “Cada pequena voz merece ser ouvida”, composição desktop com a profissional à esquerda e o texto à direita, transição entre foto e texto no mobile.

**Melhorar:**

- Deixar a especialidade e Itapeva–SP legíveis. No layout, alguns detalhes de credencial chegam a 11 px.
- A headline deve ser texto HTML sobreposto à imagem, nunca gravada no arquivo da foto. Assim continua editável, selecionável, acessível e compreensível para buscadores.
- A navegação com quatro itens é suficiente. Prever estado fixo discreto e menu mobile com nome acessível, foco visível, fechamento por Escape e retorno do foco.
- O CTA da hero mobile hoje tem fundo navy, enquanto o desktop usa pêssego. Padronizar a família de botões; o navy pode continuar nos títulos e fundos, pois faz parte da marca. A proposta é evitar cores elétricas e não eliminar cores existentes.
- Não introduzir carrossel, vídeo automático ou animação letra por letra na headline.
- A hero deve mostrar a mensagem e o CTA imediatamente; não depender da conclusão da animação.

**Complemento sugerido, preservando a headline:**

> Seu filho fala pouco, troca sons ou nem sempre é compreendido? A avaliação fonoaudiológica ajuda a entender suas necessidades e orientar os próximos passos.

**CTA de conversa sugerido:**

> Conversar pelo WhatsApp

**Microcopy:**

> Conte o que você tem observado e saiba como agendar uma avaliação.

É uma hipótese de redução de atrito, não uma promessa de ganho percentual. “Agendar avaliação” pode permanecer nos pontos de maior intenção, desde que fique claro que o clique abre uma conversa e não confirma um horário.

Figma: [desktop](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=2-2) · [mobile](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=6-2).

### 2. Sinais percebidos em casa

Os seis cards estão visíveis tanto no desktop quanto no mobile. A distribuição desktop de texto/foto, com cards em duas linhas de três, funciona.

- Manter todos os sinais visíveis na frente dos cards. O flip deve ficar reservado às áreas de atuação; aqui a mãe precisa reconhecer sua dúvida rapidamente.
- Retirar a repetição “SINAL PERCEBIDO EM CASA” em cada card; o título da seção já informa isso.
- Os números 01–06 sugerem sequência ou classificação. Usar marcadores/ícones simples, porque os sinais não são etapas nem gravidade crescente.
- No mobile, trazer o aviso tranquilizador para antes dos cards. Hoje ele aparece depois dos seis, deixando a contextualização importante muito abaixo.
- Elevar descrições de 14 para aproximadamente 16 px e ajustar a altura pelo conteúdo.
- “Troca ou omite sons” e “Nem sempre é compreendida” se aproximam. Podem ficar, mas devem apresentar observações complementares.

**Ajustes de redação para avaliação da Dra.:**

Antes: “Evita conversar — Prefere apontar, gesticular ou se afastar das interações.”

> Evita participar de conversas — Você percebe que a criança se incomoda ou deixa de participar quando precisa falar.

O objetivo é não tratar o uso de gestos, isoladamente, como problema.

Antes: “Fala pouco — Usa poucas palavras ou encontra dificuldade para formar frases.”

> Fala pouco — Você tem dúvidas sobre a quantidade de palavras ou a formação de frases para a idade do seu filho.

Aviso sugerido:

> Um sinal isolado não define um diagnóstico. A avaliação considera a idade, o desenvolvimento e a realidade de cada criança.

Não adicionar marcos etários ou diagnósticos rígidos sem revisão clínica.

Figma: [desktop](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=30-2) · [mobile](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=32-2).

### 3. Apresentação da Dra. Maisa

A posição é boa: depois da identificação com a dúvida, a mãe conhece quem poderá ajudar.

- Preservar a voz em primeira pessoa e a copy já aprovada; qualquer enxugamento deve ser analisado como proposta editorial.
- Corrigir “avaliação fonoaudiológica: Uma escuta” para “avaliação fonoaudiológica: uma escuta”.
- Substituir “CRFa da profissional”. O número deve ficar legível também fora da logo.
- Conferir a formação e a apresentação como “especializada” com os dados oficiais. Não inferir titulação a partir de referência de terceiros.
- Reduzir os vazios entre parágrafos e aumentar texto corrido mobile de 15 para cerca de 16 px.
- Usar no máximo duas credenciais comprovadas próximas à apresentação; evitar uma lista de cursos.
- A nova fotografia deve mostrar presença humana e contexto real do trabalho.

Figma: [desktop](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=60-3) · [mobile](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=62-2).

### 4. Como funciona a avaliação

O conteúdo é um dos blocos mais fortes. Os três passos e o aviso “A criança não precisa acertar nada” ajudam a explicar o atendimento.

A referência da Graciele foi observada no navegador: linha vertical central, etapas alternadas no desktop e progressão visual ao rolar. A adaptação para Maisa deve preservar os três passos e a leitura mais compacta.

- Linha de percurso que se revela gradualmente.
- Cada etapa ganha destaque ao entrar na região de leitura.
- Os textos continuam disponíveis mesmo antes do destaque.
- Desktop: preservar três etapas lado a lado se isso favorecer a continuidade atual.
- Mobile: linha vertical, etapas empilhadas e espaçamento menor que o atual.
- Entrada única de 10–12 px, com duração aproximada de 450 ms e pequenos intervalos. Sem travar a rolagem.
- Evitar o termo “mágica” e não importar protocolos, técnicas, resultados ou credenciais da referência.
- Manter o ponto 2 já aprovado. Uma alternativa mais simples seria “dificuldades relatadas” no lugar de “queixa”, caso a cliente queira revisar depois.

Figma: [desktop](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=72-2) · [mobile](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=74-2).

### 5. Benefícios e diferenciais

A lista é clara, mas o título é longo e os argumentos se repetem em relação à apresentação e avaliação.

**Título sugerido:**

> Cuidado para a criança. Orientação para a família.

**Direção para os itens:**

- Clareza sobre os próximos passos: entender o que foi observado e o que pode ser indicado.
- Apoio para o dia a dia: orientações que façam sentido na rotina da família.
- Participação da família: compreender os objetivos do acompanhamento.
- Atividades adequadas à criança: mostrar a utilidade da abordagem lúdica.

Estas formulações dependem das práticas efetivamente adotadas. “Formação contínua” deve ter sustentação em credenciais confirmadas; sem isso, é pouco distintivo.

Manter poucos itens objetivos, fontes maiores e movimento mínimo. Não transformar todos os benefícios em componentes clicáveis se não houver informação adicional.

Figma: [desktop](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=83-2) · [mobile](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=83-3).

### 6. Áreas de atuação — principal interação

Implementar o flip solicitado, limitado a esta seção.

**Frente:** área + título compreensível + resumo curto. A mãe deve conseguir reconhecer o assunto sem interagir.

**Verso:** informação complementar de 2–3 linhas explicando o que pode ser observado na avaliação. Não levar a artigo nem outra página.

**Exemplo de proposta:**

- Frente: “Fala — Trocas e dificuldades nos sons da fala.”
- Verso: “A avaliação observa como a criança produz os sons e como isso afeta a compreensão da fala no dia a dia.”
- Controle: “Ver como a avaliação ajuda”; após abrir, “Voltar ao resumo”.

Regras:

- Clique/toque e Enter/Espaço acionam a mudança; Escape pode voltar.
- Não girar automaticamente nem depender somente de hover.
- Frente e verso ocupam o mesmo espaço; dimensões comportam o maior texto.
- Foco fica no controle. A face que não está ativa não deve ser lida junto à face ativa pelo leitor de tela.
- Desktop: 3 × 2; tablet: 2 colunas; mobile: 1 coluna.
- Transição de aproximadamente 560 ms, sem brilho, inclinação seguindo o cursor ou bounce.
- Para movimento reduzido, trocar o conteúdo sem rotação.
- Com JavaScript indisponível, manter o conteúdo acessível em fluxo normal.
- Textos de ambas as faces devem estar no HTML, sem depender de requisição após o clique.

Os serviços “gagueira/taquifemia”, “leitura/escrita/dislexia” e “perda auditiva/implantes” constam no design, mas sua confirmação não foi localizada nos materiais desta revisão. Validar com a Dra.; não significa que estejam incorretos. Não adicionar TEA, apraxia ou métodos vistos nos sites de referência.

O site Rose Rebelo não respondeu tanto no navegador quanto na consulta web desta sessão. Portanto, a proposta de flip segue a descrição explícita do usuário; a duração e o comportamento exatos da referência não foram verificados.

Figma: [desktop](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=83-4) · [mobile](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=83-5).

### 7. Conversão final

A headline atual é acolhedora, porém ocupa muitas linhas no celular.

**Versão mais curta sugerida:**

> Você não precisa ter todas as respostas para dar o primeiro passo.

**Complemento sugerido:**

> Pelo WhatsApp, você pode contar sua dúvida, conhecer o atendimento e consultar os horários disponíveis para avaliação.

Essa redação esclarece a função do contato sem prometer orientação clínica gratuita ou imediata. Confirmar quem responde antes de prometer contato diretamente com a Dra.

No mobile, “OUVIR / COMPREENDER / EXPRESSAR” ocupa a mesma região da microcopy sob o CTA. Evidência: nós 121:12 e 121:13 têm retângulos sobrepostos. Remover as palavras decorativas nessa versão ou afastá-las da área de leitura.

Recomendo posicionar este bloco depois do FAQ.

Figma: [desktop](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=114-2) · [mobile](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=114-3).

### 8. FAQ

No arquivo inspecionado há seis perguntas e apenas uma resposta escrita. O aspecto visual de accordion está pronto; o conteúdo e a interação ainda precisam ser concluídos no frontend.

- Título mais direto: “Dúvidas sobre o atendimento”.
- Preservar “Quando procurar?”; diferenciar sua resposta da pergunta sobre idade.
- Completar como funciona a avaliação, necessidade de terapia, duração do acompanhamento e participação da família.
- Incluir explicitamente “Quanto duram as sessões e com que frequência acontecem?”. Duração total do acompanhamento é uma pergunta diferente.
- Não inventar minutos, número de sessões, valores, convênios ou encaminhamento.
- Accordion com abertura suave, uma resposta por vez, botão amplo e sinal +/−.
- Evitar que o header fixo ou WhatsApp persistente encubram a pergunta focada.

Figma: [desktop](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=129-2) · [mobile](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=130-2).

### 9. Contato

O bloco atual repete a persuasão da conversão final. Recomendo torná-lo mais útil para a decisão prática.

> Atendimento em Itapeva–SP

WhatsApp, Instagram e, quando confirmados, bairro/endereço, horários e informações de acesso relevantes. Mapa somente se facilitar a decisão; considerar link para rota antes de carregar um mapa pesado.

Confirmar “sem compromisso” e qualquer expectativa sobre tempo de resposta. A microcopy pode simplesmente informar como agendar.

No mobile, reduzir os grandes intervalos entre heading, parágrafo e contatos, sem apertar a leitura.

Figma: [desktop](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=134-2) · [mobile](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=135-2).

### 10. Rodapé e navegação

- Manter logo, nome, especialidade, localização, Instagram, WhatsApp e links úteis.
- CRFa também em texto, após conferência.
- Cada item de navegação precisa ser um link individual. Hoje há vários itens dentro de uma única camada de texto, o que é suficiente para mockup, mas não para implementação.
- Ampliar a área de toque no mobile; as linhas atuais são visualmente compactas.
- Política de privacidade deve apontar para conteúdo real; o texto de link desenhado não representa página pronta.
- Não exibir dados fiscais pessoais ou criar obrigações legais a partir do blueprint sem necessidade e validação.
- Sem animação decorativa no rodapé.

Figma: [desktop](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=136-2) · [mobile](https://www.figma.com/design/pysdVguPuRqwQpCHUzCwJV?node-id=137-2).

## Sistema visual e contraste

Manter Newsreader nos títulos e Manrope no corpo. A combinação transmite cuidado com boa leitura. Ajustar escala e contraste é mais útil que trocar fontes.

Proposta de base: corpo 16–18 px, entrelinha em torno de 1,55, títulos mobile proporcionais ao conteúdo, legendas essenciais de 13–14 px com contraste suficiente. Fontes menores que 16 px não são automaticamente infração WCAG, mas os blocos de 13 px atuais exigem esforço desnecessário.

| Combinação sólida, 100% opacidade | Contraste aproximado | Uso |
|---|---:|---|
| Navy #30566A / creme #F7F2EE | 7,09:1 | Texto normal aprovado |
| Grafite #4A4541 / creme | 8,51:1 | Texto normal aprovado |
| Navy / pêssego #D7A98D | 3,73:1 | Insuficiente para rótulos pequenos |
| Grafite / pêssego | 4,48:1 | Insuficiente, ainda que por pouco |
| Oliva #8D805F / creme | 3,51:1 | Insuficiente para texto normal |
| Pêssego / creme | 1,90:1 | Reservar a decoração |
| Marrom derivado #453F3B / pêssego | 4,91:1 | Proposta para rótulo dos CTAs |

O CTA desktop da hero já usa um texto mais escuro diferente do navy padrão; não está incluído automaticamente na falha navy/pêssego. O problema foi confirmado, por exemplo, no CTA dos sinais (30:12). O gradiente sobre fotos exige verificação própria na imagem definitiva.

Referência: [WCAG — contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).

## Plano de movimento por seção

| Elemento | Movimento recomendado | Intenção |
|---|---|---|
| Hero | Deslocamento de até 8 px no conjunto de texto, opcional e único | Entrada calma, CTA já disponível |
| Sinais | Entrada única de 10–12 px por grupo; sombra discreta somente onde houver interação | Apoiar leitura sem esconder sinais |
| Apresentação | Transição curta do bloco, sem animar palavras ou rosto | Reforçar presença da profissional |
| Avaliação | Percurso progressivo e destaque das três etapas | Explicar a sequência |
| Benefícios | Entrada simples por linha, sem movimento contínuo | Escaneabilidade |
| Áreas | Flip acionado pela pessoa, cerca de 560 ms | Informação complementar |
| FAQ | Abertura/fechamento em torno de 240–280 ms | Mudança previsível |
| CTA | Cor/sombra suaves, deslocamento até 2 px no hover e feedback no toque | Indicar ação disponível |
| Contato/rodapé | Estáticos, foco e hover claros | Decisão e navegação |

Não aplicar uma animação diferente em cada elemento. No máximo um ou dois focos de movimento por tela; sem scroll forçado, rotação contínua, cursor especial, pulso infinito ou botão saltando. O botão persistente fica discreto, respeita a área segura do celular e não cobre texto, foco ou outros CTAs.

Usar transformação/opacidade com parcimônia e respeitar movimento reduzido. Estas durações são decisões de design a testar, não regras universais de SEO. Fontes: [web.dev — animações eficientes](https://web.dev/articles/animations-guide), [W3C — animações em interações](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

## SEO e preparação técnica

### Proposta editorial

Title:
> Fonoaudióloga infantil em Itapeva | Maisa Palma

Meta description:
> Seu filho fala pouco ou é difícil compreendê-lo? Conheça o atendimento infantil da fonoaudióloga Maisa Palma, em Itapeva. Converse pelo WhatsApp.

O buscador pode reescrever title e snippet. Não há garantia de exibição exata nem de posição. Fontes: [Google — títulos](https://developers.google.com/search/docs/appearance/title-link), [Google — snippets](https://developers.google.com/search/docs/appearance/snippet).

### Implementação e validação futura

- HTML em pt-BR; H1 principal, H2 para seções, H3 para itens; texto real na hero e cards.
- Conteúdo equivalente entre desktop e mobile, inclusive versos e respostas, entregue no HTML.
- Imagens responsivas WebP/AVIF, dimensões reservadas, sem lazy-loading na principal candidata a LCP; carregar demais imagens conforme necessidade.
- Poucos pesos das duas fontes, arquivos otimizados e fallback para evitar saltos.
- Navegação por âncoras com compensação para header fixo.
- WhatsApp real com mensagem inicial genérica: “Olá, Dra. Maisa! Vim pelo site e gostaria de saber como funciona a avaliação fonoaudiológica infantil.”
- Mensagem apenas preparada, nunca enviada automaticamente.
- Domínio, HTTPS, canonical, sitemap, robots e Search Console conferidos após implantação.
- Dados locais e Perfil da Empresa no Google coerentes.
- Dados estruturados de negócio local apenas com informações confirmadas. Não inventar endereço, avaliações, serviços ou horários.
- FAQ serve à usuária independentemente da apresentação em resultados de pesquisa. Não prometer rich results.
- Propor acompanhamento de cliques no WhatsApp por posição. Clique não equivale a lead qualificado, conversa ou agendamento; não mandar queixas de saúde para eventos de analytics.
- Medir experiência após implementar. Objetivos de Core Web Vitals: LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 no percentil 75; não são resultados desta auditoria.

Fontes: [Google — mobile-first](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing), [Google — negócio local](https://developers.google.com/search/docs/appearance/structured-data/local-business), [web.dev — Core Web Vitals](https://web.dev/articles/vitals), [W3C — accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).

## Brief das fotografias definitivas

### Hero — proximidade imediata

Dra. olhando para a câmera, sorriso natural, postura aberta, mãos relaxadas/visíveis, consultório real com fundo organizado. Foto horizontal com profissional à esquerda e área de fundo pouco movimentada à direita para a copy. Produzir também uma foto vertical própria para mobile, centralizada e com espaço abaixo do rosto.

Luz natural suave, roupa lisa em tons da paleta, sem filtros que alterem a pele. Rosto é o centro da confiança; evitar textos sobre ele.

### Sinais — confiança na relação com a criança

Dra. sentada à altura da criança, compartilhando livro, jogo ou atividade; expressão atenta e olhar dirigido à criança. Foto 4:5 com mãos e atividade no enquadramento. Cena que mostre escuta/interação, não só a profissional mostrando um brinquedo para a câmera.

É possível enquadrar a criança de costas ou de perfil. Providenciar autorização apropriada de uso e não apresentar uma encenação como caso clínico real.

### Apresentação — competência e acolhimento

Retrato individual da cintura para cima ou plano médio mais próximo que o da hero. Levemente voltada para o texto, ombros relaxados e contato visual com a câmera. Consultório ao fundo. Evitar repetir a mesma pose da hero.

Usar elementos verdadeiros da prática da profissional; instrumentos ou adereços clínicos só quando fizerem sentido no trabalho dela. Livros e jogos adequados à idade escolar ajudam a incluir o público até 12 anos, sem uma aparência restrita a bebês.

## Ordem recomendada após a revisão

Header/hero → sinais → apresentação → avaliação → benefícios → áreas → FAQ → conversão → contato compacto → rodapé.

É uma proposta de jornada: reconhecer a dúvida, confiar na profissional, entender o atendimento, esclarecer objeções e iniciar contato. A recomendação não pressupõe que a mãe precise ler tudo para poder falar no WhatsApp.

## Próximas ações para integrar no site completo

1. Escolher as propostas editoriais da revisão e validar dados profissionais/operacionais.
2. Completar as respostas do FAQ.
3. Aplicar ajustes de contraste, tipografia e sobreposição mobile no layout.
4. Integrar a direção de motion demonstrada ao frontend completo.
5. Ligar CTAs ao WhatsApp confirmado e concluir contatos/privacidade.
6. Testar responsividade, teclado, toque, movimento reduzido, links e carregamento.
7. Substituir fotos quando disponíveis, conferindo recorte e contraste da hero novamente.

Skills que orientaram a revisão: UI UX Pro Max, frontend-design, copy-editing, CRO, seo-audit e figma-use; a análise do movimento existente utilizou figma-use-motion. A UI UX Pro Max priorizou legibilidade, interação por toque/teclado e redução de movimento; copy-editing/CRO orientaram as propostas sem promessas clínicas ou urgência artificial.

