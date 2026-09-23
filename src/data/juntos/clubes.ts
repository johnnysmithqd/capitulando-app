// Clubes e projetos (Fase 3 · Juntos). HOJE: devolve dados de exemplo daqui mesmo.
// PARA CONECTAR AO BACKEND (capitulando.com): troque o corpo de cada função
// exportada por uma chamada HTTP e converta a resposta para os tipos abaixo.
// As telas só conhecem estas funções (via src/data/api.ts) — não é preciso mexer nelas.

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));

// ---------- Tipos

export interface PessoaClube {
  id?: string; // id em /pessoa/[id]; sem id = você
  nome: string;
  ini: string;
  bg: string;
  fg: string;
}

/** Capítulo do livro que o clube está lendo (cronograma e conversa do livro). */
export interface CapituloLivroClube {
  n: number;
  titulo: string;
  sem: string; // semana: "15–21 set"
  msgs: number;
  lidos: number; // quantas pessoas já registraram esse capítulo
}

export interface PlanoClube {
  id: 'porta' | 'mensal' | 'anual';
  nome: string;
  preco: string;
  desc: string;
  nao?: string; // o que não inclui
  gratis?: boolean;
}

export interface ClubePagina {
  id: string;
  nome: string;
  eyebrow: string;
  descricao: string;
  tags: { label: string; tone: 'green' | 'cream' }[];
  livro: { id: string; titulo: string; cor: string };
  numeros: { n: string; d: string }[];
  condutor: PessoaClube & { bio: string };
  cronograma: { titulo: string; progresso: string; meuCap: number; capitulos: CapituloLivroClube[] };
  proximaSessao: { d: string; m: string; titulo: string; dia: string; hora: string; resto: string; nota: string };
  planos: PlanoClube[];
  planoPadrao: PlanoClube['id'];
  planosNota: string;
  membrosTotal: number;
  membros: PessoaClube[];
  membrosTxt: string;
  rodape: string;
  participo: boolean;
}

export type TipoSessaoClube = 'voz' | 'video' | 'local';
export interface SessaoClube {
  d: string;
  m: string;
  titulo: string;
  h: string;
  lugar: string;
  tipo: TipoSessaoClube;
  confirmaram: number;
  arquivos?: { nome: string; tamanho: string }[];
  enquete?: { pergunta: string; opcoes: { t: string; pct: number }[]; meta: string };
}

export interface MensagemClube {
  id: string;
  autor: PessoaClube;
  conduz?: boolean;
  quando: string;
  txt: string;
  respostas: number;
  spoiler?: boolean;
}

/** "Capítulo" do clube: uma frente de encontros (leitura em voz alta, cineminha...). */
export interface ArcoClube {
  id: string;
  nome: string;
  livro: string;
  livroId?: string;
  autor: string;
  cor: string;
  prox: string;
  ritmo: string;
  voce: number; // % do livro
  grupo: number;
  fio: 'livro' | 'simples';
  conversaTxt: string;
  composer?: string;
  discussao?: MensagemClube[];
  sessoes: SessaoClube[];
}

export interface PostMuralClube {
  id: string;
  tipo: 'aviso' | 'comunidade';
  autor: PessoaClube;
  quando: string;
  arco: string;
  titulo: string;
  txt: string;
  respostas: number;
  curtidas: number;
}

export type IconeArco = 'livro' | 'filme' | 'jogo' | 'poesia';
export interface ObraAcervo {
  titulo: string;
  autor: string;
  cor: string;
  livroId?: string;
  periodo: string;
  encontros: string;
  nota: string;
  agora?: boolean;
}
export interface GrupoAcervo {
  id: string;
  arco: string;
  icone: IconeArco;
  meta: string;
  obras: ObraAcervo[];
}

export interface EnqueteClube {
  id: string;
  titulo: string;
  arco: string;
  icone: IconeArco;
  estado: 'ativa' | 'encerrada' | 'agendada';
  quem: string;
  prazo: string;
  resp: string;
  pct: number;
}

export interface MembroClube extends PessoaClube {
  desc: string;
}

export interface SalaClube {
  id: string;
  nome: string;
  sub: string;
  conduzo: boolean;
  arcos: ArcoClube[];
  mural: PostMuralClube[];
  muralContagem: { tudo: number; aviso: number; comunidade: number };
  acervoNumeros: { n: string; d: string }[];
  acervo: GrupoAcervo[];
  enquetes: EnqueteClube[];
  membros: MembroClube[];
  membrosRodape: string;
}

export interface CapituloClube {
  clube: { id: string; nome: string };
  arco: ArcoClube;
  totalMembros: number;
  meuCap: number;
  capitulosLivro: CapituloLivroClube[];
  discussaoLivro: MensagemClube[];
  presenca?: RespostaPresenca;
}

export type RespostaPresenca = 'vou' | 'talvez' | 'nao';
export interface SessaoRsvpClube {
  clubeId: string;
  d: string;
  m: string;
  titulo: string;
  dia: string;
  hora: string;
  resto: string;
}

export interface RecompensaProjeto {
  id: string;
  nome: string;
  preco: string;
  valor: number;
  desc: string;
  fisica: boolean;
  restantes?: string;
}

export interface ProjetoPagina {
  id: string;
  nome: string;
  eyebrow: string;
  capaCor: string;
  autor: PessoaClube & { sub: string };
  arrecadado: string;
  meta: string;
  pct: number;
  apoiadoresTotal: number;
  diasRestantes: number;
  regra: string;
  historia: string;
  recompensas: RecompensaProjeto[];
  recompensaPadrao: string;
  atualizacoes: { d: string; m: string; titulo: string; txt?: string; soApoiadores?: boolean }[];
  apoiadores: PessoaClube[];
  apoiadoresTxt: string;
  faq: { q: string; a: string }[];
  rodape: string;
}

// ---------- Pessoas

const P = {
  luiza: { id: 'luiza', nome: 'Luiza Prado', ini: 'LP', bg: '#F7E8B5', fg: '#6F5410' },
  tiago: { id: 'tiago', nome: 'Tiago Bastos', ini: 'TB', bg: '#F6D8CE', fg: '#8E4A3C' },
  camila: { id: 'camila', nome: 'Camila Ferraz', ini: 'CF', bg: '#DCD3E8', fg: '#4E4573' },
  rafael: { id: 'rafael', nome: 'Rafael Nogueira', ini: 'RN', bg: '#CFE0D2', fg: '#3D5A41' },
  helena: { id: 'helena', nome: 'Helena Sá', ini: 'HS', bg: '#F7E8B5', fg: '#6F5410' },
  marina: { nome: 'Marina Albuquerque', ini: 'MA', bg: '#CFE0D2', fg: '#3D5A41' },
} satisfies Record<string, PessoaClube>;

// ---------- Clube do Cortiço (padrão)

const capitulosCortico: CapituloLivroClube[] = [
  { n: 9, titulo: 'A Bertoleza', sem: '1–7 set', msgs: 42, lidos: 24 },
  { n: 10, titulo: 'O incêndio', sem: '8–14 set', msgs: 38, lidos: 23 },
  { n: 11, titulo: 'Pombinha', sem: '15–21 set', msgs: 17, lidos: 15 },
  { n: 12, titulo: 'O Cortiço', sem: '22–28 set', msgs: 6, lidos: 4 },
  { n: 13, titulo: 'Rita Baiana', sem: '29 set–5 out', msgs: 0, lidos: 1 },
  { n: 14, titulo: 'Jerônimo', sem: '6–12 out', msgs: 0, lidos: 0 },
];

const planosCortico: PlanoClube[] = [
  { id: 'porta', nome: 'Porta aberta', preco: 'Grátis', desc: 'discussão por capítulo e mural', nao: 'sem sessões ao vivo e sem material da Luiza', gratis: true },
  { id: 'mensal', nome: 'Cadeira', preco: 'R$ 24 / mês', desc: 'tudo: sessões ao vivo, material, gravações' },
  { id: 'anual', nome: 'Cadeira anual', preco: 'R$ 240 / ano', desc: 'dois meses de presente' },
];

const cortico: ClubePagina = {
  id: 'cortico',
  nome: 'Clube do Cortiço',
  eyebrow: 'Clube · lendo agora',
  descricao: 'Um clássico por vez, dois capítulos por semana, quinta à noite. Recife e on-line.',
  tags: [
    { label: 'porta aberta', tone: 'green' },
    { label: 'on-line + presencial', tone: 'cream' },
  ],
  livro: { id: 'cortico', titulo: 'O Cortiço', cor: '#8C332B' },
  numeros: [
    { n: '24', d: 'membros' },
    { n: '6', d: 'livros lidos' },
    { n: '2023', d: 'desde' },
    { n: '4,8', d: 'nota da casa' },
  ],
  condutor: { ...P.luiza, bio: 'Professora de literatura, Recife. Conduz clubes desde 2019; 312 livros lidos na casa.' },
  cronograma: { titulo: 'Cronograma · O Cortiço', progresso: 'cap. 11 de 23', meuCap: 11, capitulos: capitulosCortico },
  proximaSessao: { d: '25', m: 'SET', titulo: 'Capítulo 12 · O Cortiço', dia: 'qui', hora: '19h30', resto: 'on-line · 24 confirmaram', nota: 'sessões ao vivo são da Cadeira' },
  planos: planosCortico,
  planoPadrao: 'mensal',
  planosNota: 'Sair quando quiser, sem multa. A casa fica com 14% da assinatura; o resto é da Luiza.',
  membrosTotal: 24,
  membros: [P.luiza, P.tiago, P.camila, P.rafael],
  membrosTxt: 'Tiago e Camila, que você segue, estão aqui.',
  rodape: 'O Cortiço entra sozinho na sua estante Lendo.',
  participo: true,
};

const clubes: Record<string, ClubePagina> = {
  cortico,
  sarau: {
    ...cortico,
    id: 'sarau',
    nome: 'Sarau da Rua Nova',
    descricao: 'Um capítulo por encontro, lido em voz alta, sábado à tarde. Presencial, no Recife.',
    tags: [{ label: 'presencial', tone: 'cream' }],
    livro: { id: 'memorias', titulo: 'Memórias Póstumas de Brás Cubas', cor: '#4E4573' },
    numeros: [
      { n: '18', d: 'membros' },
      { n: '9', d: 'livros lidos' },
      { n: '2022', d: 'desde' },
      { n: '4,9', d: 'nota da casa' },
    ],
    condutor: { nome: 'Marina Albuquerque', ini: 'MA', bg: '#CFE0D2', fg: '#3D5A41', bio: 'Lê devagar e anota tudo. Recife.' },
    cronograma: {
      titulo: 'Cronograma · Memórias Póstumas',
      progresso: 'cap. 27 de 160',
      meuCap: 27,
      capitulos: [
        { n: 25, titulo: 'Na Tijuca', sem: '30 ago', msgs: 21, lidos: 18 },
        { n: 26, titulo: 'O autor hesita', sem: '6 set', msgs: 19, lidos: 17 },
        { n: 27, titulo: 'Virgília?', sem: '13 set', msgs: 8, lidos: 11 },
        { n: 28, titulo: 'Contanto que…', sem: '20 set', msgs: 0, lidos: 2 },
        { n: 29, titulo: 'A visita', sem: '27 set', msgs: 0, lidos: 0 },
      ],
    },
    proximaSessao: { d: '27', m: 'SET', titulo: 'Capítulo 28 · Memórias Póstumas', dia: 'sáb', hora: '16h', resto: 'Livraria Jaqueira · 14 confirmaram', nota: 'encontros presenciais são da Cadeira' },
    planos: [
      { id: 'porta', nome: 'Porta aberta', preco: 'Grátis', desc: 'discussão por capítulo e mural', nao: 'sem os encontros presenciais', gratis: true },
      { id: 'mensal', nome: 'Cadeira', preco: 'R$ 24 / mês', desc: 'tudo: encontros, material, café' },
      { id: 'anual', nome: 'Cadeira anual', preco: 'R$ 240 / ano', desc: 'dois meses de presente' },
    ],
    planosNota: 'Sair quando quiser, sem multa. A casa fica com 14% da assinatura; o resto é da Marina.',
    membrosTotal: 18,
    membros: [P.marina, P.rafael, P.helena, P.tiago],
    membrosTxt: 'Rafael e Helena, que você segue, estão aqui.',
    rodape: 'Memórias Póstumas entra sozinho na sua estante Lendo.',
    participo: true,
  },
  tercas: {
    ...cortico,
    id: 'tercas',
    nome: 'Machado às Terças',
    eyebrow: 'Clube · começa em 1º de outubro',
    descricao: 'Machado de Assis inteiro, um romance por vez, toda terça à noite. On-line.',
    tags: [
      { label: 'porta aberta', tone: 'green' },
      { label: 'on-line', tone: 'cream' },
    ],
    livro: { id: 'quincas', titulo: 'Quincas Borba', cor: '#2F2A3E' },
    numeros: [
      { n: '41', d: 'membros' },
      { n: '3', d: 'livros lidos' },
      { n: '2025', d: 'desde' },
      { n: '4,7', d: 'nota da casa' },
    ],
    condutor: { ...P.tiago, bio: 'Professor. Machado até o fim. Olinda.' },
    cronograma: {
      titulo: 'Cronograma · Quincas Borba',
      progresso: 'começa em 1º de out',
      meuCap: 0,
      capitulos: [
        { n: 1, titulo: 'Rubião à janela', sem: '1–7 out', msgs: 0, lidos: 0 },
        { n: 2, titulo: 'O filósofo', sem: '1–7 out', msgs: 0, lidos: 0 },
        { n: 3, titulo: 'Humanitas', sem: '8–14 out', msgs: 0, lidos: 0 },
        { n: 4, titulo: 'O testamento', sem: '8–14 out', msgs: 0, lidos: 0 },
      ],
    },
    proximaSessao: { d: '07', m: 'OUT', titulo: 'Capítulos 1 a 10 · Quincas Borba', dia: 'ter', hora: '20h', resto: 'on-line · 12 confirmaram', nota: 'sessões ao vivo são da Cadeira' },
    planos: [
      { id: 'porta', nome: 'Porta aberta', preco: 'Grátis', desc: 'discussão por capítulo e mural', nao: 'sem sessões ao vivo e sem material do Tiago', gratis: true },
      { id: 'mensal', nome: 'Cadeira', preco: 'R$ 18 / mês', desc: 'tudo: sessões ao vivo, material, gravações' },
      { id: 'anual', nome: 'Cadeira anual', preco: 'R$ 180 / ano', desc: 'dois meses de presente' },
    ],
    planoPadrao: 'porta',
    planosNota: 'Sair quando quiser, sem multa. A casa fica com 14% da assinatura; o resto é do Tiago.',
    membrosTotal: 41,
    membros: [P.tiago, P.camila, P.luiza, P.helena],
    membrosTxt: 'Camila e Luiza, que você segue, estão aqui.',
    rodape: 'Quincas Borba entra sozinho na sua estante Quero ler.',
    participo: false,
  },
};

// ---------- Sala do clube (visão de membro)

const arcosCortico: ArcoClube[] = [
  {
    id: 'vozalta',
    nome: 'Leitura em voz alta',
    livro: 'O Cortiço',
    livroId: 'cortico',
    autor: 'Aluísio Azevedo',
    cor: '#8C332B',
    prox: 'próxima qui, 19h30',
    ritmo: 'você na p. 196 · 15 de 24 no mesmo trecho',
    voce: 46,
    grupo: 48,
    fio: 'livro',
    conversaTxt: 'Conversa do livro',
    sessoes: [
      { d: '25', m: 'SET', titulo: 'Pombinha e o cortiço · cap. 11 e 12', h: 'qui · 19h30 · 1h30', lugar: 'Discord · sala Voz Alta', tipo: 'voz', confirmaram: 24, arquivos: [{ nome: 'mapa-do-cortico.pdf', tamanho: '2,1 MB' }, { nome: 'roteiro-da-leitura.pdf', tamanho: '340 KB' }] },
      { d: '09', m: 'OUT', titulo: 'Rita Baiana e Jerônimo · cap. 13 e 14', h: 'qui · 19h30 · 1h30', lugar: 'Discord · sala Voz Alta', tipo: 'voz', confirmaram: 9, arquivos: [{ nome: 'trechos-para-ler.pdf', tamanho: '180 KB' }] },
      {
        d: '23',
        m: 'OUT',
        titulo: 'Encerramento · leitura do último capítulo',
        h: 'qui · 19h30 · 2h',
        lugar: 'Livraria Jaqueira, Recife · ver no mapa',
        tipo: 'local',
        confirmaram: 12,
        enquete: { pergunta: 'Depois da leitura: café ou bar?', opcoes: [{ t: 'Café da livraria', pct: 58 }, { t: 'Bar do Parque', pct: 42 }], meta: '19 votos · encerra sábado' },
      },
    ],
  },
  {
    id: 'cineminha',
    nome: 'Noite do cineminha',
    livro: 'Memórias Póstumas de Brás Cubas',
    livroId: 'memorias',
    autor: 'Machado de Assis',
    cor: '#4E4573',
    prox: 'próxima sex, 20h',
    ritmo: 'livro terminado · agora as adaptações',
    voce: 100,
    grupo: 100,
    fio: 'simples',
    conversaTxt: 'Conversa',
    composer: 'Falar do filme',
    discussao: [
      { id: 'c1', autor: P.luiza, conduz: true, quando: 'seg', respostas: 4, txt: 'O Klotzel resolveu o defunto-autor com voz em off. Funciona, mas perde a ironia de quem está morto e sabe disso.' },
      { id: 'c2', autor: P.camila, quando: 'ontem', respostas: 1, txt: 'Achei o Reginaldo Faria perfeito. Assisti de novo depois de terminar o livro e é outro filme.' },
    ],
    sessoes: [
      { d: '26', m: 'SET', titulo: 'Brás Cubas (2001), de André Klotzel', h: 'sex · 20h · 1h40 + conversa', lugar: 'Discord · sala Cineminha', tipo: 'voz', confirmaram: 17, arquivos: [{ nome: 'onde-assistir.pdf', tamanho: '120 KB' }] },
      { d: '24', m: 'OUT', titulo: 'Memórias Póstumas em quadrinhos · com o ilustrador', h: 'sex · 20h · 1h', lugar: 'Google Meet · link abre 10 min antes', tipo: 'video', confirmaram: 11 },
    ],
  },
  {
    id: 'jogos',
    nome: 'Sexta dos jogos',
    livro: 'Quarto de Despejo',
    livroId: 'despejo',
    autor: 'Carolina Maria de Jesus',
    cor: '#3D5A41',
    prox: 'próxima sex, 19h',
    ritmo: 'jogos a partir do diário de Carolina',
    voce: 100,
    grupo: 100,
    fio: 'simples',
    conversaTxt: 'Conversa',
    composer: 'Falar dos jogos',
    discussao: [
      { id: 'j1', autor: P.tiago, quando: 'sex', respostas: 6, txt: 'Proposta para o quiz: em vez de datas, perguntas sobre o que ela comia em cada mês. É o que mais marca no diário.' },
      { id: 'j2', autor: P.luiza, conduz: true, quando: 'sáb', respostas: 0, txt: 'Boa. Coloquei nas regras — subi o PDF na sessão de 27.' },
    ],
    sessoes: [
      { d: '27', m: 'SET', titulo: 'Quiz do diário · quem lembra mais', h: 'sex · 19h · 1h', lugar: 'Discord · sala Jogos', tipo: 'voz', confirmaram: 14, arquivos: [{ nome: 'regras-do-quiz.pdf', tamanho: '90 KB' }] },
      { d: '25', m: 'OUT', titulo: 'Escrita-relâmpago · uma página em 20 minutos', h: 'sex · 19h · 1h30', lugar: 'Discord · sala Jogos', tipo: 'voz', confirmaram: 8 },
    ],
  },
  {
    id: 'poesia',
    nome: 'Roda de poesia',
    livro: 'Antologia do Recife',
    autor: 'vários autores',
    cor: '#6F5410',
    prox: 'próxima ter, 19h30',
    ritmo: 'cada pessoa traz um poema',
    voce: 0,
    grupo: 0,
    fio: 'simples',
    conversaTxt: 'Conversa',
    composer: 'Trazer um poema',
    discussao: [
      { id: 'p1', autor: P.camila, quando: 'ter', respostas: 3, txt: 'Vou levar a Alice Ruiz. Alguém já escolheu?' },
      { id: 'p2', autor: P.marina, quando: 'ontem', respostas: 0, txt: 'Eu trago um do Manoel de Barros. Cabe em dois minutos.' },
    ],
    sessoes: [
      { d: '30', m: 'SET', titulo: 'Poetas da cidade · leia o que você trouxe', h: 'ter · 19h30 · 1h', lugar: 'Discord · sala Poesia', tipo: 'voz', confirmaram: 12, arquivos: [{ nome: 'antologia-do-recife.pdf', tamanho: '4,8 MB' }] },
      { d: '28', m: 'OUT', titulo: 'Sarau aberto · convide quem quiser', h: 'ter · 19h30 · 2h', lugar: 'Livraria Jaqueira, Recife · ver no mapa', tipo: 'local', confirmaram: 6 },
    ],
  },
];

const discussaoLivroCortico: MensagemClube[] = [
  { id: 'd1', autor: P.luiza, conduz: true, quando: 'ter', respostas: 6, txt: 'Pombinha é o capítulo em que o Aluísio mais se traiu como naturalista: ele quer condenar e acaba admirando. Alguém sentiu isso?' },
  { id: 'd2', autor: P.tiago, quando: 'ter', respostas: 2, txt: 'A cena da Léonie é dura de ler hoje. Mas o narrador não julga a Pombinha — julga o cortiço.' },
  { id: 'd3', autor: P.camila, quando: 'ontem', respostas: 0, spoiler: true, txt: 'Sem spoiler do 12, mas: reparem no que acontece com o Jerônimo depois disso.' },
];

const salaCortico: SalaClube = {
  id: 'cortico',
  nome: 'Clube do Cortiço',
  sub: '24 pessoas · 4 capítulos',
  conduzo: false,
  arcos: arcosCortico,
  mural: [
    { id: 'm1', tipo: 'aviso', autor: P.luiza, quando: 'há 6 h', arco: 'Leitura em voz alta', titulo: 'Como a gente lê o capítulo 12', txt: 'Três edições circulam no clube e a paginação não bate. Combinei tudo por trecho, não por página.', respostas: 2, curtidas: 22 },
    { id: 'm2', tipo: 'aviso', autor: P.luiza, quando: 'há 2 dias', arco: 'Noite do cineminha', titulo: 'O filme de outubro mudou de data', txt: 'Sexta 24, mesma hora. O ilustrador só pode nesse dia.', respostas: 5, curtidas: 8 },
    { id: 'm3', tipo: 'comunidade', autor: P.tiago, quando: 'há 3 dias', arco: 'Sexta dos jogos', titulo: 'Levei o quiz para os meus alunos', txt: 'Funcionou melhor do que eu esperava. Se alguém quiser as perguntas adaptadas, me chama.', respostas: 4, curtidas: 31 },
    { id: 'm4', tipo: 'comunidade', autor: P.camila, quando: 'há 5 dias', arco: 'Roda de poesia', titulo: 'Uma edição de 1954 na feira da Boa Vista', txt: 'Trinta reais. Se ninguém for, eu volto lá no sábado e compro para o acervo do clube.', respostas: 7, curtidas: 44 },
  ],
  muralContagem: { tudo: 16, aviso: 5, comunidade: 11 },
  acervoNumeros: [
    { n: '9', d: 'obras registradas' },
    { n: '33', d: 'encontros no total' },
    { n: '4', d: 'capítulos abertos' },
    { n: 'nov 2025', d: 'desde a primeira' },
  ],
  acervo: [
    {
      id: 'vozalta',
      arco: 'Leitura em voz alta',
      icone: 'livro',
      meta: '18 encontros · quinzenal',
      obras: [
        { titulo: 'O Cortiço', autor: 'Aluísio Azevedo', cor: '#8C332B', livroId: 'cortico', periodo: 'set – out 2026', encontros: '5 encontros · média de 22', nota: 'lendo agora', agora: true },
        { titulo: 'Torto Arado', autor: 'Itamar Vieira Junior', cor: '#3D5A41', livroId: 'torto', periodo: 'mai – jun 2026', encontros: '4 encontros · média de 19', nota: '4,8 de 5' },
        { titulo: 'A Vegetariana', autor: 'Han Kang', cor: '#8E4A3C', livroId: 'vegetariana', periodo: 'mar – abr 2026', encontros: '3 encontros · média de 16', nota: '4,1 de 5' },
        { titulo: 'Quarto de Despejo', autor: 'Carolina Maria de Jesus', cor: '#6F5410', livroId: 'despejo', periodo: 'jan – fev 2026', encontros: '3 encontros · média de 21', nota: '4,9 de 5' },
      ],
    },
    {
      id: 'cineminha',
      arco: 'Noite do cineminha',
      icone: 'filme',
      meta: '6 encontros · mensal',
      obras: [
        { titulo: 'Brás Cubas (2001)', autor: 'filme de André Klotzel', cor: '#4E4573', periodo: 'set 2026', encontros: '1 encontro · 17 pessoas', nota: '3,6 de 5' },
        { titulo: 'Central do Brasil', autor: 'filme de Walter Salles', cor: '#3C5064', periodo: 'jun 2026', encontros: '1 encontro · 23 pessoas', nota: '4,7 de 5' },
      ],
    },
    {
      id: 'jogos',
      arco: 'Sexta dos jogos',
      icone: 'jogo',
      meta: '5 encontros · mensal',
      obras: [
        { titulo: 'Quiz do diário', autor: 'jogo feito pelo clube', cor: '#3D5A41', periodo: 'set 2026', encontros: '1 encontro · 14 pessoas', nota: '4,4 de 5' },
        { titulo: 'Escrita-relâmpago', autor: 'oficina de 20 minutos', cor: '#55463F', periodo: 'ago 2026', encontros: '1 encontro · 11 pessoas', nota: '4,2 de 5' },
      ],
    },
    {
      id: 'poesia',
      arco: 'Roda de poesia',
      icone: 'poesia',
      meta: '4 encontros · mensal',
      obras: [{ titulo: 'Antologia do Recife', autor: 'vários autores', cor: '#6F5410', periodo: 'ago 2026', encontros: '2 encontros · média de 12', nota: '4,5 de 5' }],
    },
  ],
  enquetes: [
    { id: 'e1', titulo: 'O que a gente lê depois de O Cortiço?', arco: 'Leitura em voz alta', icone: 'livro', estado: 'ativa', quem: 'todo o clube · 24 leitores', prazo: 'fecha em 2 dias', resp: '14 de 24 responderam', pct: 58 },
    { id: 'e2', titulo: 'Filme de outubro: três opções', arco: 'Noite do cineminha', icone: 'filme', estado: 'ativa', quem: '17 pessoas no capítulo', prazo: 'fecha amanhã, 18h', resp: '9 de 17 responderam', pct: 53 },
    { id: 'e3', titulo: 'Depois da leitura: café ou bar?', arco: 'Leitura em voz alta · sessão de 23 out', icone: 'livro', estado: 'ativa', quem: 'quem confirmou presença', prazo: 'encerra sábado', resp: '19 de 24 responderam', pct: 79 },
    { id: 'e4', titulo: 'Qual jogo na sexta de 27?', arco: 'Sexta dos jogos', icone: 'jogo', estado: 'encerrada', quem: '14 pessoas', prazo: 'encerrada há 4 dias', resp: 'Quiz do diário ganhou · 11 votos', pct: 100 },
    { id: 'e5', titulo: 'Sarau aberto: quem a gente convida?', arco: 'Roda de poesia', icone: 'poesia', estado: 'agendada', quem: 'todo o clube', prazo: 'abre 1 de outubro', resp: 'rascunho pronto', pct: 0 },
  ],
  membros: [
    { ...P.luiza, desc: 'conduz · cap. 14' },
    { ...P.marina, desc: 'você · cap. 11' },
    { ...P.tiago, desc: 'cap. 12' },
    { ...P.camila, desc: 'cap. 13' },
    { ...P.rafael, desc: 'cap. 9' },
    { ...P.helena, desc: 'cap. 11' },
  ],
  membrosRodape: '+18 membros · o capítulo de cada pessoa vem do registro dela',
};

// Outros clubes reaproveitam a sala de exemplo com o próprio nome.
const salas: Record<string, SalaClube> = {
  cortico: salaCortico,
  sarau: { ...salaCortico, id: 'sarau', nome: 'Sarau da Rua Nova', sub: '18 pessoas · 4 capítulos', conduzo: true, membrosRodape: '+12 membros · o capítulo de cada pessoa vem do registro dela' },
  tercas: { ...salaCortico, id: 'tercas', nome: 'Machado às Terças', sub: '41 pessoas · 4 capítulos', membrosRodape: '+35 membros · o capítulo de cada pessoa vem do registro dela' },
};

// Respostas de presença registradas nesta sessão do app (no backend, viriam do servidor).
const presencas: Record<string, RespostaPresenca> = {};

// ---------- Projetos

const quadrinhos: ProjetoPagina = {
  id: 'quadrinhos',
  nome: 'Memórias Póstumas em quadrinhos',
  eyebrow: 'Projeto · quadrinhos',
  capaCor: '#4E4573',
  autor: { nome: 'Estúdio Cubas', ini: 'EC', bg: '#DCD3E8', fg: '#4E4573', sub: 'Recife · 2 projetos entregues' },
  arrecadado: 'R$ 27.200',
  meta: 'R$ 40.000',
  pct: 68,
  apoiadoresTotal: 312,
  diasRestantes: 12,
  regra: 'Tudo ou nada: se a meta não bater até 1º de outubro, ninguém paga.',
  historia:
    'O defunto autor merecia um traço. Há dois anos adaptamos os 160 capítulos de Machado em 160 páginas de quadrinhos — humor seco, Rio de 1880, o emplasto, a borboleta preta, tudo. Falta imprimir com o cuidado que o livro pede: papel pólen, capa dura, costura.',
  recompensas: [
    { id: 'pdf', nome: 'PDF + nome nos agradecimentos', preco: 'R$ 30', valor: 30, desc: 'entrega digital · dez 2026', fisica: false },
    { id: 'capa', nome: 'Capa dura assinada', preco: 'R$ 90', valor: 90, desc: 'entrega pelos Correios · dez 2026', fisica: true, restantes: '38 de 150 restantes' },
    { id: 'kit', nome: 'Kit: livro + print + marcador', preco: 'R$ 160', valor: 160, desc: 'entrega pelos Correios · dez 2026', fisica: true, restantes: '12 de 40 restantes' },
    { id: 'livre', nome: 'Só apoiar', preco: 'qualquer valor', valor: 0, desc: 'sem recompensa', fisica: false },
  ],
  recompensaPadrao: 'capa',
  atualizacoes: [
    { d: '12', m: 'SET', titulo: 'Provas de cor aprovadas', txt: 'Fechamos com a gráfica em Recife. Papel pólen 90 g, capa dura com hot stamping. Foto das provas no fim.' },
    { d: '28', m: 'AGO', titulo: 'Metade da meta em 9 dias', txt: 'Obrigado. Liberamos a recompensa "Kit" com print da capa.' },
    { d: '19', m: 'AGO', titulo: 'Só para apoiadores: rascunhos', soApoiadores: true },
  ],
  apoiadores: [P.marina, P.tiago, P.camila, P.helena],
  apoiadoresTxt: 'Tiago, Camila e 2 pessoas que você segue apoiaram.',
  faq: [
    { q: 'Se a meta não bater?', a: 'Ninguém é cobrado. Pix é devolvido em até 7 dias; cartão não é capturado.' },
    { q: 'Posso mudar de recompensa?', a: 'Até o fim do prazo, em Juntos › Projetos.' },
    { q: 'E se atrasar?', a: 'Você recebe atualização a cada 30 dias e pode pedir reembolso se passar de 90 dias sem envio.' },
  ],
  rodape: 'Pix em destaque · a casa fica com 5% + R$ 0,50 por apoio',
};

const projetos: Record<string, ProjetoPagina> = {
  quadrinhos,
  poetas: {
    ...quadrinhos,
    id: 'poetas',
    nome: 'Antologia Poetas do Recife',
    eyebrow: 'Projeto · poesia',
    capaCor: '#6F5410',
    autor: { nome: 'Coletivo Mangue', ini: 'CM', bg: '#CFE0D2', fg: '#3D5A41', sub: 'Recife · 1 projeto entregue' },
    arrecadado: 'R$ 4.650',
    meta: 'R$ 15.000',
    pct: 31,
    apoiadoresTotal: 86,
    diasRestantes: 38,
    regra: 'Tudo ou nada: se a meta não bater até 31 de outubro, ninguém paga.',
    historia:
      'Vinte e quatro poetas do Recife que ainda não têm livro. Juntamos os poemas em saraus da Boa Vista, de Casa Amarela e do Pina, e queremos uma antologia que caiba no bolso e circule pela cidade: miolo em pólen, capa com gravura, lançamento na rua.',
    recompensas: [
      { id: 'pdf', nome: 'PDF + nome nos agradecimentos', preco: 'R$ 20', valor: 20, desc: 'entrega digital · jan 2027', fisica: false },
      { id: 'livro', nome: 'Antologia impressa', preco: 'R$ 55', valor: 55, desc: 'entrega pelos Correios · jan 2027', fisica: true, restantes: '140 de 300 restantes' },
      { id: 'sarau', nome: 'Livro + convite para o lançamento', preco: 'R$ 90', valor: 90, desc: 'retirada no sarau de lançamento · jan 2027', fisica: true, restantes: '22 de 60 restantes' },
      { id: 'livre', nome: 'Só apoiar', preco: 'qualquer valor', valor: 0, desc: 'sem recompensa', fisica: false },
    ],
    recompensaPadrao: 'livro',
    atualizacoes: [
      { d: '15', m: 'SET', titulo: 'Os 24 poemas estão escolhidos', txt: 'Fechamos a seleção depois de três saraus. A ordem do livro sai na próxima atualização.' },
      { d: '02', m: 'SET', titulo: 'Só para apoiadores: a gravura da capa', soApoiadores: true },
    ],
    apoiadores: [P.helena, P.rafael, P.camila],
    apoiadoresTxt: 'Helena, Rafael e 1 pessoa que você segue apoiaram.',
  },
};

// Aceita os ids antigos usados em links do protótipo.
const ALIAS_PROJETO: Record<string, string> = { 'memorias-hq': 'quadrinhos', 'poetas-recife': 'poetas' };
const projetoPor = (id: string) => projetos[ALIAS_PROJETO[id] ?? id] ?? quadrinhos;

// ---------- API

export const getClube = (id: string) => delay(clubes[id] ?? cortico);
export const getSalaClube = (id: string) => delay(salas[id] ?? salaCortico);

export const getCapituloClube = (clubeId: string, arcoId?: string): Promise<CapituloClube> => {
  const sala = salas[clubeId] ?? salaCortico;
  const clube = clubes[clubeId] ?? cortico;
  const arco = sala.arcos.find((a) => a.id === arcoId) ?? sala.arcos[0];
  return delay({
    clube: { id: sala.id, nome: sala.nome },
    arco,
    totalMembros: clube.membrosTotal,
    meuCap: 11,
    capitulosLivro: capitulosCortico,
    discussaoLivro: discussaoLivroCortico,
    presenca: presencas[sala.id],
  });
};

export const getSessaoRsvp = (clubeId: string): Promise<SessaoRsvpClube> => {
  const c = clubes[clubeId] ?? cortico;
  const dias: Record<string, string> = { cortico: 'qui, 25 de setembro', sarau: 'sáb, 27 de setembro', tercas: 'ter, 7 de outubro' };
  return delay({
    clubeId: c.id,
    d: c.proximaSessao.d,
    m: c.proximaSessao.m,
    titulo: c.proximaSessao.titulo,
    dia: dias[c.id] ?? dias.cortico,
    hora: c.proximaSessao.hora,
    resto: c.id === 'sarau' ? 'presencial · 2 h' : 'on-line · 1 h',
  });
};

export const confirmarPresenca = (clubeId: string, resposta: RespostaPresenca) => {
  presencas[clubeId] = resposta;
  return delay({ clubeId, resposta });
};
/** Publica na conversa do capítulo; devolve a mensagem criada (autor = você). */
export const comentarCapitulo = (clubeId: string, arcoId: string, texto: string): Promise<MensagemClube> =>
  delay({ id: `${clubeId}-${arcoId}-${Date.now()}`, autor: P.marina, quando: 'agora', txt: texto, respostas: 0 });

export const getProjeto = (id: string) => delay(projetoPor(id));
