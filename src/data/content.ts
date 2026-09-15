import type { SignalIconName } from '../types/signals';
import type { AreaIconName } from '../components/ui/AreaIcon.astro';

export interface Signal {
  title: string;
  description: string;
  icon: SignalIconName;
}

export interface EvaluationStep {
  step: string;
  title: string;
  description: string;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface Area {
  slug: string;
  icon: AreaIconName;
  title: string;
  front: string;
  back: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const signals: Signal[] = [
  {
    title: 'Fala pouco',
    description:
      'Você tem dúvidas sobre a quantidade de palavras ou a formação de frases para a idade do seu filho.',
    icon: 'few-words',
  },
  {
    title: 'Troca ou omite sons',
    description: 'Algumas palavras ficam difíceis de entender no dia a dia.',
    icon: 'sound-change',
  },
  {
    title: 'Nem sempre é compreendida',
    description: 'Pessoas próximas pedem para repetir com frequência.',
    icon: 'clarity',
  },
  {
    title: 'Fica frustrada ao tentar falar',
    description: 'Chora, se irrita ou desiste quando não consegue se expressar.',
    icon: 'frustration',
  },
  {
    title: 'Entende, mas não consegue responder',
    description:
      'Parece compreender, porém encontra dificuldade para organizar a fala.',
    icon: 'understanding',
  },
  {
    title: 'Evita participar de conversas',
    description:
      'Você percebe que a criança se incomoda ou deixa de participar quando precisa falar.',
    icon: 'conversation-avoidance',
  },
];

export const evaluationSteps: EvaluationStep[] = [
  {
    step: '01',
    title: 'Conversa com a família',
    description:
      'Começamos ouvindo você: a rotina, o histórico do desenvolvimento e as situações que mais preocupam a família.',
  },
  {
    step: '02',
    title: 'Avaliação lúdica',
    description:
      'Por meio de recursos e protocolos adequados à idade e à queixa, a Dra. Maisa observa como a criança compreende, interage e se comunica.',
  },
  {
    step: '03',
    title: 'Devolutiva e próximos passos',
    description:
      'Você recebe uma explicação clara sobre o que foi observado e, quando indicado, uma proposta de acompanhamento individualizado.',
  },
];

export const benefits: Benefit[] = [
  {
    title: 'Avaliação individualizada',
    description: 'Um olhar atento para compreender a criança além da queixa inicial.',
  },
  {
    title: 'Estratégias lúdicas',
    description:
      'Brincadeiras e recursos adequados à idade tornam a sessão mais natural.',
  },
  {
    title: 'Respeito ao ritmo da criança',
    description:
      'Cada avanço é construído sem comparações e com objetivos possíveis.',
  },
  {
    title: 'Orientações claras para a família',
    description:
      'Você entende o que está sendo trabalhado e como apoiar no dia a dia.',
  },
  {
    title: 'Objetivos terapêuticos claros',
    description:
      'Com brincadeiras, vínculo e objetivos terapêuticos claros, construímos um caminho para que ela possa se comunicar com mais segurança.',
  },
];

export const areas: Area[] = [
  {
    slug: 'linguagem',
    // No pictogram fits "linguagem" directly (the logo has eye/ear/mouth/nose/hand); hand is the closest
    // left over once mouth (fala/fluência), ear (audição), eye (aprendizagem) and nose (orofacial) are
    // taken — registered here per Iris's instruction to pick the closest and document it.
    icon: 'hand',
    title: 'Desenvolvimento da fala e da linguagem',
    front:
      'Crianças que falam pouco, têm dificuldade para formar frases ou compreender e usar a linguagem.',
    back:
      'A avaliação fonoaudiológica ajuda a compreender o que está acontecendo e quais são os próximos passos.',
  },
  {
    slug: 'fala',
    icon: 'mouth',
    title: 'Trocas e dificuldades nos sons da fala',
    front:
      'Avaliação e terapia para omissões, substituições ou produção imprecisa de sons que dificultam entender a fala.',
    back:
      'A avaliação considera a idade, o desenvolvimento e a realidade de cada criança.',
  },
  {
    slug: 'fluencia',
    icon: 'mouth',
    title: 'Gagueira e taquifemia',
    front:
      'Cuidado com repetições, bloqueios ou fala acelerada, favorecendo uma comunicação mais confortável e segura.',
    back:
      'A avaliação é um momento de observação, vínculo e compreensão.',
  },
  {
    slug: 'aprendizagem',
    icon: 'eye',
    title: 'Dificuldades de leitura e escrita',
    front:
      'Suporte para dificuldades na alfabetização, leitura, compreensão e escrita, incluindo sinais relacionados à dislexia.',
    back:
      'Cada criança tem seu próprio ritmo. A avaliação ajuda a compreender o que está acontecendo.',
  },
  {
    slug: 'funcoes-orofaciais',
    icon: 'nose',
    title: 'Motricidade orofacial',
    front:
      'Avaliação das estruturas e funções de lábios, língua e bochechas, além de mastigação, deglutição e respiração.',
    back:
      'A avaliação acontece com escuta, brincadeiras e respeito ao ritmo da criança.',
  },
  {
    slug: 'audicao',
    icon: 'ear',
    title: 'Comunicação na deficiência auditiva',
    front:
      'Estimulação da fala e da linguagem para crianças que utilizam AASI (aparelho de amplificação sonora individual), implante coclear ou ambos.',
    back:
      'Você recebe uma explicação clara sobre o que foi observado e os próximos passos.',
  },
];

export const faqItems: FaqItem[] = [
  {
    question: 'Pode ser só uma fase? Devo esperar?',
    answer:
      'É natural pensar assim — muitas crianças realmente evoluem sozinhas. Mas esperar sem uma avaliação pode adiar um cuidado que faria diferença agora. A avaliação não obriga a nada: ela mostra se há motivo para acompanhar de perto ou se está tudo dentro do esperado.',
  },
  {
    question: 'Existe idade certa para fazer a avaliação?',
    answer:
      'Não existe uma idade mínima nem um prazo para "esperar mais um pouco". Cada fase do desenvolvimento tem marcos próprios, e a avaliação considera isso desde bebês até a fase escolar. Quanto antes a dúvida for esclarecida, mais cedo a família fica tranquila — em qualquer direção que a resposta apontar.',
  },
  {
    question: 'Como é a avaliação? Meu filho vai se sentir bem?',
    answer:
      'O encontro é conduzido como uma brincadeira, com atividades escolhidas para a idade da criança — sem provas cronometradas ou cobrança. A maioria das crianças nem percebe que está sendo avaliada. Você acompanha de perto o tempo todo.',
  },
  {
    question: 'Meu filho vai precisar de terapia?',
    answer:
      'Nem toda avaliação termina em indicação de terapia; às vezes o resultado mostra que está tudo dentro do esperado para a idade. Quando há indicação, ela vem com uma explicação clara do motivo e do que esperar do acompanhamento.',
  },
  {
    question: 'Quanto tempo dura o acompanhamento?',
    answer:
      'Não existe um prazo padrão: depende da idade da criança, da queixa e da resposta ao trabalho ao longo do caminho. Esse tempo é revisado periodicamente com a família, para que vocês sempre saibam em que ponto do processo estão.',
  },
  {
    question: 'A família participa do processo?',
    answer:
      'Sim — a família é parte do trabalho, não apenas espectadora. Você recebe orientações práticas para o dia a dia e é ouvida sobre o que tem funcionado em casa, porque o que acontece fora do consultório também importa.',
  },
  {
    question: 'Como funciona o valor da avaliação?',
    answer:
      'O valor da avaliação é combinado diretamente pelo WhatsApp, de acordo com a necessidade de cada família.',
  },
  {
    question: 'Quais os horários de atendimento?',
    answer:
      'O atendimento acontece de segunda a sexta, das 8h às 18h. Fale pelo WhatsApp para agendar um horário.',
  },
];

export const content = {
  hero: {
    eyebrow: 'FONOAUDIOLOGIA INFANTIL • ITAPEVA–SP',
    title: 'Cada pequena voz merece ser ouvida.',
    titleEmphasis: 'merece ser ouvida',
    description:
      'Seu filho fala pouco, troca sons ou nem sempre é compreendido? A avaliação fonoaudiológica ajuda a entender suas necessidades e orientar os próximos passos.',
    cta: 'Conversar sobre meu filho',
  },
  signals: {
    eyebrow: 'O QUE VOCÊ NOTA EM CASA?',
    title: 'Alguns sinais merecem ser ouvidos com cuidado.',
    titleEmphasis: 'merecem ser ouvidos',
    description:
      'Cada criança se desenvolve de uma maneira. Ainda assim, algumas dificuldades podem indicar que é importante buscar orientação profissional.',
    reassurance:
      'Um sinal isolado não define um diagnóstico. A avaliação considera a idade, o desenvolvimento e a realidade de cada criança.',
    cta: 'Conversar sobre meu filho',
  },
  about: {
    eyebrow: 'QUEM VAI CUIDAR DO SEU FILHO',
    title: 'Antes de qualquer técnica, vem o cuidado de compreender cada criança.',
    titleEmphasis: 'compreender cada criança',
    introduction:
      'Sou Maisa Palma, fonoaudióloga. Sei que, quando a fala não acontece como esperado, surgem dúvidas, comparações e muita preocupação.',
    description:
      'Por isso, cada acompanhamento começa com uma avaliação fonoaudiológica: uma escuta atenta à família e um olhar individual para a criança. Com atividades lúdicas, vínculo e objetivos terapêuticos claros, construímos um caminho para que ela possa se comunicar com mais segurança.',
    cta: 'Veja como é a avaliação',
  },
  evaluation: {
    eyebrow: 'COMO FUNCIONA A AVALIAÇÃO',
    title: 'Um primeiro passo leve, claro e pensado para o seu filho.',
    titleEmphasis: 'leve, claro e pensado',
    description:
      'A avaliação fonoaudiológica acontece com escuta, atividades lúdicas e respeito ao ritmo da criança — para que ela se sinta segura e você saiba o que esperar.',
    reassurance:
      'Não há respostas certas ou erradas. A avaliação é conduzida com atenção, acolhimento e respeito ao modo de cada criança se comunicar.',
    cta: 'Conversar sobre meu filho',
    ctaDetail: 'A conversa é iniciada pelo WhatsApp.',
  },
  benefits: {
    eyebrow: 'UM CUIDADO PENSADO PARA CADA CRIANÇA',
    title:
      'Cada criança tem seu jeito de se comunicar. O atendimento também precisa respeitar isso.',
    description:
      'Da primeira conversa aos objetivos terapêuticos, cada etapa é construída de forma individualizada, considerando a idade, as necessidades e o ritmo do seu filho.',
  },
  areas: {
    eyebrow: 'COMO A FONOAUDIOLOGIA PODE AJUDAR',
    title: 'Diferentes dificuldades, um cuidado atento para cada criança.',
    titleEmphasis: 'cuidado atento',
    description:
      'A Dra. Maisa atua em diferentes aspectos da comunicação e do desenvolvimento infantil. Conheça as principais situações que podem ser avaliadas e acompanhadas.',
    cta: 'Perguntar sobre o caso',
  },
  faq: {
    eyebrow: 'DÚVIDAS FREQUENTES',
    title: 'É natural ter dúvidas. Aqui estão algumas respostas para ajudar você.',
    titleEmphasis: 'natural ter dúvidas',
    description:
      'Cada criança tem seu próprio ritmo. A avaliação fonoaudiológica ajuda a compreender o que está acontecendo e quais são os próximos passos.',
    cta: 'Conversar com a Dra. Maisa',
  },
  contact: {
    eyebrow: 'UM PRIMEIRO PASSO, NO SEU TEMPO',
    title: 'Você não precisa ter todas as respostas para começar uma conversa.',
    titleEmphasis: 'começar uma conversa',
    description:
      'Conte pelo WhatsApp o que você tem observado na comunicação do seu filho. Por lá, você pode conhecer o atendimento e consultar os horários disponíveis para avaliação.',
    cta: 'Conversar sobre meu filho',
    detail: 'Fonoaudiologia infantil em Itapeva–SP • @fonomaisapalma',
  },
  footer: {
    specialization: 'Fonoaudiologia infantil',
    navigationLabel: 'NAVEGAÇÃO',
    contactLabel: 'CONTATO',
    privacyLabel: 'Política de Privacidade',
    navigation: [
      { href: '#sobre', label: 'Sobre' },
      { href: '#avaliacao', label: 'Avaliação' },
      { href: '#areas', label: 'Áreas de atuação' },
      { href: '#duvidas', label: 'Dúvidas' },
      { href: '#contato', label: 'Contato' },
    ],
  },
} as const;
