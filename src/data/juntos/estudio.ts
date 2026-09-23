// Estúdio de cards (compartilhamento). HOJE: devolve dados de exemplo.
// PARA CONECTAR AO BACKEND (capitulando.com): troque o corpo de cada função
// por uma chamada HTTP e converta a resposta para os tipos abaixo.
// As telas só conhecem estas funções — não é preciso mexer nelas.
import { books, me, readings } from '../mock';

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));

/** O que vira card (folha "O que virar card"). */
export type ConteudoCard = 'progresso' | 'citacao' | 'terminado' | 'retrospectiva' | 'estante';

/** De onde a pessoa chegou ao Estúdio (parâmetro `tipo` da rota). */
export type OrigemEstudio =
  | 'leitura'
  | 'citacao'
  | 'terminado'
  | 'retrospectiva'
  | 'estante'
  | 'desafio'
  | 'podio'
  | 'clube'
  | 'projeto';

export interface LivroCard {
  id: string;
  titulo: string;
  autor: string;
  cor: string;
  pagina: number;
  total: number;
}

export interface CapaCard {
  titulo: string;
  cor: string;
}

export interface CardEstudioDados {
  origem: OrigemEstudio;
  /** Conteúdo com que o Estúdio abre. */
  conteudo: ConteudoCard;
  usuario: string; // sem @
  livro: LivroCard;
  citacao: string;
  /** Linha de data do template Recibo. */
  dataRecibo: string;
  terminado: { nota: number; linha: string };
  retrospectiva: { titulo: string; capas: CapaCard[]; numeros: { v: string; n: string }[]; destaque: string };
  estante: { total: number; ano: number; cores: string[]; resumo: string };
  /** Link que acompanha o card ao enviar. */
  link: string;
}

export interface OpcaoConteudoCard {
  id: ConteudoCard;
  nome: string;
  desc: string;
  fundoIcone: string;
}

const opcoesConteudoCard: OpcaoConteudoCard[] = [
  { id: 'progresso', nome: 'Progresso', desc: 'onde você está no livro de agora', fundoIcone: '#F7E2D7' },
  { id: 'citacao', nome: 'Citação', desc: 'um trecho que você marcou', fundoIcone: '#F0ECF6' },
  { id: 'terminado', nome: 'Livro terminado', desc: 'capa, nota e a data', fundoIcone: '#EAF2EB' },
  { id: 'retrospectiva', nome: 'Retrospectiva do mês', desc: 'quatro capas e os números de setembro', fundoIcone: '#FDF6E0' },
  { id: 'estante', nome: 'Estante do ano', desc: 'as 34 lombadas de 2026', fundoIcone: '#F6D8CE' },
];

// Livro que cada contexto coletivo usa no card (sem id conhecido, vale o livro de agora).
const livroDoContexto: Record<string, string> = {
  cortico: 'cortico',
  sarau: 'memorias',
  'memorias-hq': 'memorias',
  quadrinhos: 'memorias',
};

const conteudoDaOrigem: Record<OrigemEstudio, ConteudoCard> = {
  leitura: 'progresso',
  citacao: 'citacao',
  terminado: 'terminado',
  retrospectiva: 'retrospectiva',
  estante: 'estante',
  desafio: 'progresso',
  podio: 'progresso',
  clube: 'progresso',
  projeto: 'progresso',
};

const linkDaOrigem = (origem: OrigemEstudio, id: string | undefined, livroId: string) => {
  const base = 'capitulando.com';
  if (origem === 'desafio') return `${base}/desafio/${id ?? 'setembro'}`;
  if (origem === 'podio') return `${base}/podio/${id ?? 'agosto'}`;
  if (origem === 'clube') return `${base}/clube/${id ?? 'cortico'}`;
  if (origem === 'projeto') return `${base}/projeto/${id ?? 'memorias-hq'}`;
  if (origem === 'retrospectiva' || origem === 'estante') return `${base}/@${me.handle}`;
  return `${base}/livro/${livroId}`;
};

const ehOrigem = (t: string): t is OrigemEstudio => Object.prototype.hasOwnProperty.call(conteudoDaOrigem, t);

function montarCard(tipo?: string, id?: string): CardEstudioDados {
  const origem: OrigemEstudio = tipo && ehOrigem(tipo) ? tipo : 'leitura';
  const coletivo = origem === 'desafio' || origem === 'podio' || origem === 'clube' || origem === 'projeto';
  // Em leitura/citação/terminado o id é do livro; nos coletivos, do desafio/clube/projeto.
  const livroId = coletivo ? livroDoContexto[id ?? ''] ?? 'memorias' : id && books[id] ? id : 'memorias';
  const b = books[livroId] ?? books.memorias;
  const r = readings.find((x) => x.bookId === b.id);
  const pagina = r ? r.page : 196;

  return {
    origem,
    conteudo: conteudoDaOrigem[origem],
    usuario: me.handle,
    livro: { id: b.id, titulo: b.title, autor: b.author, cor: b.coverColor, pagina: Math.min(pagina, b.pages), total: b.pages },
    citacao: 'Não tive filhos, não transmiti a nenhuma criatura o legado da nossa miséria.',
    dataRecibo: '19/09/2026 19h24',
    terminado: { nota: r?.rating ?? 4, linha: '14 de setembro · 34º livro de 2026' },
    retrospectiva: {
      titulo: 'Setembro em livros',
      capas: [
        { titulo: 'Solitária', cor: '#55463F' },
        { titulo: 'Ainda Estou Aqui', cor: '#56483F' },
        { titulo: 'O Avesso da Pele', cor: '#3C5064' },
        { titulo: 'Olhos d’Água', cor: '#3C5064' },
      ],
      numeros: [
        { v: '4', n: 'livros' },
        { v: '512', n: 'páginas' },
        { v: '4,1', n: 'nota média' },
      ],
      destaque: 'O melhor do mês: Solitária, de Eliana Alves Cruz.',
    },
    estante: {
      total: 34,
      ano: 2026,
      cores: [
        '#7F3A22', '#3D5A41', '#4E4573', '#8E4A3C', '#55463F', '#56483F',
        '#A8433A', '#8C332B', '#3C5064', '#98462A', '#3C5064', '#3D5A41',
        '#6F5410', '#3E332E', '#453B24', '#201A17', '#55463F', '#8C332B',
      ],
      resumo: '4.552 páginas · nota média 4,1 · 6 releituras',
    },
    link: linkDaOrigem(origem, id, b.id),
  };
}

// ---- Card
/** Conteúdo do card conforme a origem (`tipo`) e o `id`; ids desconhecidos caem no padrão. */
export const getCardEstudio = (tipo?: string, id?: string) => delay(montarCard(tipo, id));
export const getOpcoesConteudoCard = () => delay(opcoesConteudoCard);

// ---- Envio
export type DestinoCard = 'stories' | 'whatsapp' | 'tiktok' | 'x' | 'imagem';
export interface EnvioCard {
  destino: DestinoCard;
  formato: '9:16' | '1:1' | '4:5';
  conteudo: ConteudoCard;
  template: string;
}
/** Registra o envio (métricas, histórico). A imagem em si sai pelo compartilhamento do sistema. */
export const registrarEnvioCard = (e: EnvioCard) => delay(e);
