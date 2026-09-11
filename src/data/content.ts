import type { SignalIconName } from '../types/signals';

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
  category: string;
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
    category: 'LINGUAGEM',
    title: 'Desenvolvimento da fala e da linguagem',
    front:
      'Para crianças que falam pouco, têm dificuldade para formar frases ou compreender e usar a linguagem.',
    back:
      'A avaliação fonoaudiológica ajuda a compreender o que está acontecendo e quais são os próximos passos.',
  },
  {
    slug: 'fala',
    category: 'FALA',
    title: 'Trocas e dificuldades nos sons da fala',
    front:
      'Avaliação e terapia para omissões, substituições ou produção imprecisa de sons que dificultam entender a fala.',
    back:
      'A avaliação considera a idade, o desenvolvimento e a realidade de cada criança.',
  },
  {
    slug: 'fluencia',
    category: 'FLUÊNCIA',
    title: 'Gagueira e taquifemia',
    front:
      'Cuidado com repetições, bloqueios ou fala acelerada, favorecendo uma comunicação mais confortável e segura.',
    back:
      'A avaliação é um momento de observação, vínculo e compreensão.',
  },
  {
    slug: 'aprendizagem',
    category: 'APRENDIZAGEM',
    title: 'Dificuldades de leitura e escrita',
    front:
      'Suporte para dificuldades na alfabetização, leitura, compreensão e escrita, incluindo sinais relacionados à dislexia.',
    back:
      'Cada criança tem seu próprio ritmo. A avaliação ajuda a compreender o que está acontecendo.',
  },
  {
    slug: 'funcoes-orofaciais',
    category: 'FUNÇÕES OROFACIAIS',
    title: 'Motricidade orofacial',
    front:
      'Avaliação das estruturas e funções de lábios, língua e bochechas, além de mastigação, deglutição e respiração.',
    back:
      'A avaliação acontece com escuta, brincadeiras e respeito ao ritmo da criança.',
  },
  {
    slug: 'audicao',
    category: 'AUDIÇÃO',
    title: 'Comunicação na deficiência auditiva',
    front:
      'Estimulação da fala e da linguagem para crianças com perda auditiva ou usuárias de dispositivos, como implante auditivo.',
    back:
      'Você recebe uma explicação clara sobre o que foi observado e os próximos passos.',
  },
];

export const faqItems: FaqItem[] = [
  {
    question: 'Quando devo procurar uma fonoaudióloga para o meu filho?',
    answer:
      'Quando algo na fala, na compreensão ou na forma como a criança se comunica chama sua atenção. Você não precisa esperar ter certeza de que existe uma dificuldade para buscar orientação.',
  },
  {
    question: 'Existe uma idade certa para fazer uma avaliação fonoaudiológica?',
    answer:
      'A avaliação considera a idade, o desenvolvimento e a realidade de cada criança.',
  },
  {
    question: 'Como funciona a avaliação fonoaudiológica infantil?',
    answer:
      'A avaliação acontece com escuta, brincadeiras e respeito ao ritmo da criança, para que ela se sinta segura e você saiba o que esperar.',
  },
  {
    question: 'Meu filho necessariamente precisará fazer terapia?',
    answer:
      'Você recebe uma explicação clara sobre o que foi observado e, quando indicado, uma proposta de acompanhamento individualizado.',
  },
  {
    question: 'Quanto tempo dura o acompanhamento?',
    answer:
      'Cada etapa é construída de forma individualizada, considerando a idade, as necessidades e o ritmo do seu filho.',
  },
  {
    question: 'A família participa do processo?',
    answer:
      'Começamos ouvindo você: a rotina, o histórico do desenvolvimento e as situações que mais preocupam a família.',
  },
];

export const content = {
  hero: {
    eyebrow: 'FONOAUDIOLOGIA INFANTIL • ITAPEVA–SP',
    title: 'Cada pequena voz merece ser ouvida.',
    description:
      'Seu filho fala pouco, troca sons ou nem sempre é compreendido? A avaliação fonoaudiológica ajuda a entender suas necessidades e orientar os próximos passos.',
    cta: 'Conversar pelo WhatsApp',
  },
  signals: {
    eyebrow: 'O QUE VOCÊ NOTA EM CASA?',
    title: 'Alguns sinais merecem ser ouvidos com cuidado.',
    description:
      'Cada criança se desenvolve de uma maneira. Ainda assim, algumas dificuldades podem indicar que é importante buscar orientação profissional.',
    reassurance:
      'Um sinal isolado não define um diagnóstico. A avaliação considera a idade, o desenvolvimento e a realidade de cada criança.',
    cta: 'Conversar sobre meu filho',
  },
  about: {
    eyebrow: 'QUEM VAI CUIDAR DO SEU FILHO',
    title: 'Antes de qualquer técnica, vem o cuidado de compreender cada criança.',
    introduction:
      'Sou Maisa Palma, fonoaudióloga. Sei que, quando a fala não acontece como esperado, surgem dúvidas, comparações e muita preocupação.',
    description:
      'Por isso, cada acompanhamento começa com uma avaliação fonoaudiológica: uma escuta atenta à família e um olhar individual para a criança. Com brincadeiras, vínculo e objetivos terapêuticos claros, construímos um caminho para que ela possa se comunicar com mais segurança.',
    cta: 'Conversar com a Dra. Maisa',
  },
  evaluation: {
    eyebrow: 'COMO FUNCIONA A AVALIAÇÃO',
    title: 'Um primeiro passo leve, claro e pensado para o seu filho.',
    description:
      'A avaliação fonoaudiológica acontece com escuta, brincadeiras e respeito ao ritmo da criança — para que ela se sinta segura e você saiba o que esperar.',
    reassurance:
      'A criança não precisa “acertar” nada. A avaliação é um momento de observação, vínculo e compreensão.',
    cta: 'Quero agendar uma avaliação',
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
    description:
      'A Dra. Maisa atua em diferentes aspectos da comunicação e do desenvolvimento infantil. Conheça as principais situações que podem ser avaliadas e acompanhadas.',
    cta: 'Conversar com a Dra. Maisa',
  },
  faq: {
    eyebrow: 'DÚVIDAS FREQUENTES',
    title: 'É natural ter dúvidas. Aqui estão algumas respostas para ajudar você.',
    description:
      'Cada criança tem seu próprio ritmo. A avaliação fonoaudiológica ajuda a compreender o que está acontecendo e quais são os próximos passos.',
    cta: 'Conversar com a Dra. Maisa',
  },
  contact: {
    eyebrow: 'UM PRIMEIRO PASSO, NO SEU TEMPO',
    title: 'Você não precisa ter todas as respostas para começar uma conversa.',
    description:
      'Conte pelo WhatsApp o que você tem observado na comunicação do seu filho. Por lá, você pode conhecer o atendimento e consultar os horários disponíveis para avaliação.',
    cta: 'Conversar pelo WhatsApp',
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
