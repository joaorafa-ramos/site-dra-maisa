# Checklist de publicação

## Gates factuais (revisado em 2026-09-08)

| Item | Estado verificável | Gate |
| --- | --- | --- |
| Número do WhatsApp | Não configurado: `PUBLIC_WHATSAPP_NUMBER` está vazio no ambiente de revisão. | **Bloqueia a publicação como página de conversão.** Configurar somente no ambiente de publicação; não versionar o número. |
| Quem responde no WhatsApp | Não confirmado. | Confirmar responsável e prazo de resposta antes de prometer contato direto ou orientação inicial. |
| CRFa | Não confirmado. | Confirmar antes de publicá-lo como texto legível. |
| Áreas de atuação | Copy presente no desktop, mas sem confirmação clínica/documental no repositório. | Confirmar, em especial, fluência, leitura e escrita e comunicação na deficiência auditiva. |
| Endereço/bairro e acesso | Não configurados. | Confirmar antes de exibir ou adicionar mapa. |
| Horários | Não configurados. | Confirmar antes de exibir. |
| CNPJ | Não configurado. | Confirmar, se aplicável, antes de exibir. |
| URL da política de privacidade | Não configurada; o rodapé não exibe link de política. | Criar conteúdo real e fornecer URL antes de incluir o link. |

## Conteúdo e operação

- [ ] Obter aprovação clínica/editorial para as seis respostas do FAQ antes da publicação; as cinco respostas montadas a partir de copy aprovada (além da única resposta literal do Figma) dependem de validação profissional explícita.
- [ ] Confirmar que não há promessa de serviço, disponibilidade, valor, convênio ou duração de atendimento não documentada.

## Revisão técnica desktop (2026-09-08)

- [x] Capturas de página completa revisadas em 1024 × 900, 1280 × 900, 1366 × 900, 1440 × 900 e 1920 × 1080; sem sobreposição, truncamento ou rolagem horizontal observados. Artefatos: `tmp/task-13-1024.png` a `tmp/task-13-1920.png`.
- [x] Verificados por testes E2E: ordem das seções, grade 3 × 2 de sinais e áreas, fotos 4:5, três etapas de avaliação, FAQ antes da conversão, slot 350 × 438 à direita na seção final, foco visível, cards de áreas expansíveis com teclado/Escape, entrada escalonada e hover; CTA com movimento ligado à rolagem e inerte com movimento reduzido, FAQ nativo, âncoras abaixo do cabeçalho e redução de movimento.
- [x] Verificações em produção: `npm test` (3 testes), `npm run check` (0 erros/avisos), `npm run build` e `npm run test:e2e` (37 testes) concluídos com sucesso. A prévia de produção em 1440 px não registrou erros de console, requisições falhas ou âncoras internas sem destino.
- [ ] Lighthouse: não medido. Não havia binário/pacote Lighthouse disponível no ambiente de revisão; nenhum pacote foi adicionado apenas para a auditoria. As metas Performance ≥ 90 e Accessibility/Best Practices/SEO ≥ 95 continuam gates para a publicação.
