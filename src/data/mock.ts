// Dados de exemplo, copiados do protótipo. Serão substituídos pelo backend.
import type {
  Agenda,
  Book,
  BookDetails,
  ClubPost,
  ClubSummary,
  DiaryMonth,
  List,
  ProjectSummary,
  Reading,
  ShelfSummary,
  Stats,
  User,
} from './types';

const b = (id: string, title: string, author: string, coverColor: string, pages = 300, edition?: string): Book => ({
  id,
  title,
  author,
  coverColor,
  pages,
  edition,
});

export const books: Record<string, Book> = Object.fromEntries(
  [
    b('memorias', 'Memórias Póstumas de Brás Cubas', 'Machado de Assis', '#4E4573', 320, 'Companhia das Letras, 2014'),
    b('quincas', 'Quincas Borba', 'Machado de Assis', '#2F2A3E', 368, 'Penguin-Companhia, 2012'),
    b('quincas-antofagica', 'Quincas Borba', 'Machado de Assis', '#4E4573', 416, 'Antofágica, 2022 · ilustrada'),
    b('memorial', 'Memorial de Aires', 'Machado de Assis', '#6F5410', 224, 'Penguin-Companhia, 2013'),
    b('sertao', 'Grande Sertão: Veredas', 'João Guimarães Rosa', '#6F5410', 600, 'Companhia das Letras, 2019'),
    b('antirracista', 'Pequeno Manual Antirracista', 'Djamila Ribeiro', '#201A17', 136, 'Companhia das Letras, 2019'),
    b('torto', 'Torto Arado', 'Itamar Vieira Junior', '#7F3A22'),
    b('despejo', 'Quarto de Despejo', 'Carolina Maria de Jesus', '#3D5A41'),
    b('estrela', 'A Hora da Estrela', 'Clarice Lispector', '#4E4573'),
    b('vista', 'Vista Chinesa', 'Tatiana Salem Levy', '#8E4A3C'),
    b('solitaria', 'Solitária', 'Eliana Alves Cruz', '#55463F'),
    b('aqui', 'Ainda Estou Aqui', 'Marcelo Rubens Paiva', '#56483F'),
    b('poncia', 'Ponciá Vicêncio', 'Conceição Evaristo', '#A8433A'),
    b('cortico', 'O Cortiço', 'Aluísio Azevedo', '#8C332B'),
    b('olhos', 'Olhos d’Água', 'Conceição Evaristo', '#3C5064'),
    b('fogo', 'Salvar o Fogo', 'Itamar Vieira Junior', '#98462A'),
    b('casmurro', 'Dom Casmurro', 'Machado de Assis', '#6F5410'),
    b('defeito', 'Um Defeito de Cor', 'Ana Maria Gonçalves', '#3E332E'),
    b('avesso', 'O Avesso da Pele', 'Jeferson Tenório', '#3C5064'),
    b('vegetariana', 'A Vegetariana', 'Han Kang', '#3D5A41'),
    b('sol', 'O Sol na Cabeça', 'Geovani Martins', '#453B24'),
    b('cidade', 'Cidade de Deus', 'Paulo Lins', '#201A17'),
    b('sapiens', 'Sapiens', 'Yuval Harari', '#55463F'),
    b('kindred', 'Kindred', 'Octavia Butler', '#8C332B'),
    b('isaura', 'A Escrava Isaura', 'Bernardo Guimarães', '#3C5064'),
    b('esau', 'Esaú e Jacó', 'Machado de Assis', '#55463F'),
    b('ateneu', 'O Ateneu', 'Raul Pompeia', '#8C332B'),
    b('triste', 'Triste Fim de Policarpo Quaresma', 'Lima Barreto', '#3C5064'),
  ].map((x) => [x.id, x]),
);

export const me: User = {
  id: 'marina',
  name: 'Marina Albuquerque',
  handle: 'marina.le',
  initials: 'MA',
  avatarBg: '#CFE0D2',
  avatarFg: '#3D5A41',
  memberSince: 2021,
  bio: [
    'Leio devagar e anoto tudo. Comecei a marcar páginas em 2014 e nunca mais parei: o que me interessa é o que fica depois, não a quantidade.',
    'Professora de português em Recife. Leio muito brasileiro contemporâneo, releio Machado todo ano e tenho um fraco por diários.',
  ],
  stats: { books: 128, followers: 342, following: 198 },
  links: [
    { kind: 'instagram', label: 'marina.le' },
    { kind: 'youtube', label: 'Marina Lê' },
    { kind: 'site', label: 'marinale.com.br' },
  ],
  yearGoal: { year: 2026, target: 40, done: 34, note: 'No ritmo: 2 livros à frente do calendário.' },
  streakDays: 12,
};

export const readings: Reading[] = [
  { bookId: 'memorias', status: 'lendo', page: 196 },
  { bookId: 'sertao', status: 'lendo', page: 96 },
  { bookId: 'antirracista', status: 'lendo', page: 40 },
  ...(
    [
      ['torto', 5],
      ['despejo', 5],
      ['estrela', 4.5],
      ['vista', 4],
      ['solitaria', 4],
      ['aqui', 5],
      ['poncia', 4.5],
      ['cortico', 3.5],
      ['olhos', 5],
      ['fogo', 4],
      ['avesso', 5],
      ['vegetariana', 3.5],
      ['casmurro', 4.5],
      ['defeito', 5],
      ['sol', 4],
      ['cidade', 5],
      ['sapiens', 3.5],
      ['kindred', 5],
    ] as const
  ).map(([bookId, rating]) => ({ bookId, status: 'lido' as const, page: books[bookId].pages, rating })),
];

export const todayAgenda: Agenda[] = [
  {
    id: 'a1',
    time: '20h',
    sub: '36 min',
    title: 'Leitura em voz alta',
    context: 'Clube do Cortiço · cap. 12–14 · Discord',
    action: 'entrar',
    highlight: true,
  },
  { id: 'a2', time: '21h30', sub: 'em 2h', title: 'Enquete fecha', context: 'Clube do Cortiço · que capítulo relemos?' },
];

export const unreadNotices = 8;

export const pageOfTheDay = {
  text: 'Ao verme que primeiro roeu as frias carnes do meu cadáver dedico como saudosa lembrança estas memórias póstumas.',
  source: 'Machado de Assis',
  bookId: 'memorias',
};

export const clubFeed: ClubPost[] = [
  { id: 'p1', kind: 'enquete', title: 'Enquete fecha em 2 dias', sub: 'O que a gente lê depois de O Cortiço?' },
  {
    id: 'p2',
    kind: 'aviso',
    title: 'Como a gente lê o capítulo 12',
    sub: 'Luiza Prado · há 6 h',
    initials: 'LP',
    avatarBg: '#F7E8B5',
    avatarFg: '#6F5410',
  },
  {
    id: 'p3',
    kind: 'post',
    title: 'Levei o quiz para os meus alunos',
    sub: 'Tiago Bastos · 4 respostas',
    initials: 'TB',
    avatarBg: '#F6D8CE',
    avatarFg: '#8E4A3C',
  },
  {
    id: 'p4',
    kind: 'terminaram',
    title: '3 pessoas terminaram Memórias Póstumas',
    sub: 'veja o que acharam · sem spoiler até a sua página',
  },
];

export const becauseYouRead = {
  title: 'Porque você leu Machado',
  bookIds: ['casmurro', 'isaura', 'esau', 'ateneu'],
};

export const clubs: ClubSummary[] = [
  {
    id: 'sarau',
    name: 'Sarau da Rua Nova',
    desc: 'Recife · presencial · capítulo 27 esta semana',
    meta: '18 membros · R$ 24 / mês',
    iconBg: '#CFE0D2',
    iconFg: '#3D5A41',
  },
  {
    id: 'tercas',
    name: 'Machado às Terças',
    desc: 'on-line · começa o livro em 1º de outubro',
    meta: '41 membros',
    iconBg: '#DCD3E8',
    iconFg: '#4E4573',
    open: true,
  },
];

export const myClubs = {
  participo: [
    {
      id: 'cortico',
      name: 'Clube do Cortiço',
      desc: '',
      meta: '24 pessoas · 4 capítulos',
      iconBg: '',
      iconFg: '',
      coverColor: '#8C332B',
      coverTitle: 'O Cortiço',
    },
  ] as ClubSummary[],
  conduzo: [
    { id: 'sarau', name: 'Sarau da Rua Nova', desc: '', meta: '18 membros · sessão sábado', iconBg: '#F7E8B5', iconFg: '#6F5410' },
  ] as ClubSummary[],
};

export const projects: ProjectSummary[] = [
  {
    id: 'quadrinhos',
    name: 'Memórias Póstumas em quadrinhos',
    desc: 'por Estúdio Cubas · edição em capa dura, 160 páginas',
    pct: 68,
    raised: 'R$ 27.200 de R$ 40.000',
    daysLeft: '12 dias',
    coverColor: '#4E4573',
  },
  {
    id: 'poetas',
    name: 'Antologia Poetas do Recife',
    desc: 'Coletivo Mangue · 24 poetas inéditos',
    pct: 31,
    raised: 'R$ 4.650 de R$ 15.000',
    daysLeft: '38 dias',
  },
];

export const myProjects = {
  participo: [{ id: 'quadrinhos', title: 'Memórias Póstumas em quadrinhos', sub: 'apoiou com R$ 90 · chega até 28 de set', coverColor: '#4E4573' }],
  conduzo: [{ id: 'poetas', title: 'Antologia Poetas do Recife', sub: '31% · 38 dias · 2 envios pendentes' }],
};

export const bookDetails = (id: string): BookDetails => {
  const book = books[id] ?? books.memorias;
  return {
    book,
    rating: 4.5,
    ratingsCount: 12480,
    distribution: [0.08, 0.04, 0.14, 0.45, 1],
    friends: {
      count: 5,
      avg: 4.6,
      list: [
        { name: 'Luiza Prado', rating: 5, badge: 'releitura' },
        { name: 'Tiago Bastos', rating: 4 },
        { name: 'Camila Ferraz', badge: 'lendo · p. 58' },
      ],
    },
    reviewsCount: 312,
    reviews: [
      {
        id: 'r1',
        author: 'Luiza Prado',
        initials: 'LP',
        avatarBg: '#F7E8B5',
        avatarFg: '#6F5410',
        when: 'ontem · releitura',
        rating: 5,
        text: 'O capítulo das negativas é o melhor final de romance brasileiro. Não ter filhos, não transmitir a nenhuma criatura o legado da nossa miséria.',
        spoilerPage: 240,
      },
      {
        id: 'r2',
        author: 'Tiago Bastos',
        initials: 'TB',
        avatarBg: '#F6D8CE',
        avatarFg: '#8E4A3C',
        when: 'há 3 semanas',
        rating: 4,
        text: 'Li no clube, dois capítulos por semana. Rende muito mais devagar: o Machado esconde piada em nota de rodapé.',
      },
    ],
    quotes: [
      {
        id: 'q1',
        text: 'Ao verme que primeiro roeu as frias carnes do meu cadáver dedico como saudosa lembrança estas memórias póstumas.',
        where: 'p. 9 · dedicatória',
        count: 412,
      },
      {
        id: 'q2',
        text: 'Não tive filhos, não transmiti a nenhuma criatura o legado da nossa miséria.',
        where: 'p. 318',
        count: 389,
        spoiler: 'Última frase · visível para quem terminou',
      },
    ],
    clubs,
    project: projects[0],
    alsoRead: ['casmurro', 'quincas', 'cortico', 'triste'].map((k) => books[k]),
    editions: [
      { id: 'e1', label: 'Companhia das Letras, 2014', sub: '320 páginas · a sua', coverColor: '#4E4573', mine: true },
      { id: 'e2', label: 'Antofágica, 2019 · ilustrada', sub: '400 páginas', coverColor: '#2F2A3E' },
      { id: 'e3', label: 'Domínio público · e-book', sub: 'grátis', coverColor: '#DCCDB4' },
    ],
  };
};

export const shelves: ShelfSummary[] = [
  { status: 'lendo', label: 'Lendo', count: 3, covers: ['#4E4573', '#6F5410', '#201A17'] },
  { status: 'lido', label: 'Lidos', count: 128, covers: ['#7F3A22', '#3D5A41', '#4E4573'] },
  { status: 'quero-ler', label: 'Quero ler', count: 56, covers: ['#98462A', '#8E4A3C', '#3C5064'] },
  { status: 'abandonei', label: 'Abandonei', count: 4, covers: ['#55463F', '#DCCDB4', '#A8433A'] },
];

export const lists: List[] = [
  { id: 'l1', name: 'Brasileiras que me formaram', meta: 'pública · 12 livros · 86 salvaram' },
  { id: 'l2', name: 'Para o clube', meta: 'privada · 5 livros', private: true },
];

export const diary: DiaryMonth[] = [
  {
    month: 'Setembro 2026',
    items: [
      { day: '14', mon: 'SET', book: books.solitaria, rating: 4, extra: 'resenha' },
      { day: '06', mon: 'SET', book: books.aqui, rating: 5, extra: 'releitura' },
    ],
  },
  {
    month: 'Agosto 2026',
    items: [
      { day: '28', mon: 'AGO', book: books.poncia, rating: 4.5, extra: 'resenha' },
      { day: '15', mon: 'AGO', book: books.cortico, rating: 3.5, extra: 'Clube do Cortiço' },
    ],
  },
];

export const stats: Stats = {
  pagesPerMonth: [
    ['J', 420],
    ['F', 380],
    ['M', 610],
    ['A', 290],
    ['M', 520],
    ['J', 480],
    ['J', 700],
    ['A', 640],
    ['S', 512],
  ].map(([m, v]) => ({ m: m as string, v: v as number })),
  pagesYear: 4552,
  booksYear: 34,
  booksLife: 128,
  avgRating: 4.1,
  communityAvg: 3.7,
  streak: 12,
  streakRecord: 31,
  authorOfYear: { name: 'Conceição Evaristo', sub: '4 livros · 1.012 páginas' },
  genres: [
    { name: 'Romance', pct: 46 },
    { name: 'Não ficção', pct: 22 },
    { name: 'Contos', pct: 18 },
    { name: 'Poesia', pct: 14 },
  ],
};

export const searchCatalog: Book[] = [books.quincas, books['quincas-antofagica'], books.memorial];
