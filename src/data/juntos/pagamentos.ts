// Pagamentos, apoio e painéis do condutor (Fase 4). HOJE: dados de exemplo daqui mesmo.
// PARA CONECTAR AO BACKEND (capitulando.com): troque o corpo de cada função
// exportada por uma chamada HTTP e converta a resposta para os tipos abaixo.
// Os valores de taxa (5% + R$ 0,50 em projetos, 14% em clubes) vêm do protótipo
// e devem ser confirmados pelo backend — aqui só servem para a tela mostrar a conta.
import { getClube, getProjeto, type PessoaClube } from './clubes';

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));

// ---------- Tipos

export type TipoCheckout = 'apoio' | 'clube';
export type FormaPagamento = 'cartao' | 'pix';

export interface Checkout {
  tipo: TipoCheckout;
  alvoId: string; // id do projeto ou do clube
  titulo: string;
  subtitulo: string;
  linhas: { label: string; valor: string }[];
  total: string;
  totalValor: number;
  taxaTxt: string;
  endereco?: string; // só para recompensa física
  botao: string;
  gratis: boolean;
}

export interface PedidoPagamento {
  tipo: TipoCheckout;
  alvoId: string;
  opcaoId: string; // recompensa ou plano
  forma: FormaPagamento;
  mostrarNoFeed: boolean;
}

export interface MeuApoio {
  projetoId: string;
  projetoNome: string;
  capaCor: string;
  recompensa: string;
  valor: string;
  pagamento: string;
  rastreio?: { codigo: string; etapas: { titulo: string; sub: string; estado: 'feito' | 'agora' | 'depois' }[] };
  atualizacoes: { d: string; m: string; titulo: string; txt: string }[];
  autorNome: string;
}

export interface MembroPainel extends PessoaClube {
  plano: string;
  pagamento: string;
  pagamentoOk: boolean;
}

export interface EnquetePainel {
  id: string;
  pergunta: string;
  onde: string;
  ondeTom: 'lilas' | 'terracota' | 'neutro';
  meta: string;
  aberta: boolean;
  opcoes: { t: string; pct: number }[];
}

export interface PainelClube {
  id: string;
  nome: string;
  numeros: { n: string; d: string; verde?: boolean }[];
  pedidos: number;
  membros: MembroPainel[];
  membrosRodape: string;
  repasse: { mes: string; bruto: string; casa: string; liquido: string; data: string; chave: string };
  sessao: { d: string; m: string; titulo: string; quando: string; respostas: string };
  sessoesPassadas: { data: string; titulo: string; presentes: number }[];
  enquetes: EnquetePainel[];
  membrosTotal: number;
}

export interface PainelProjeto {
  id: string;
  nome: string;
  arrecadado: string;
  meta: string;
  pct: number;
  apoiadores: number;
  diasRestantes: number;
  ritmo: string;
  recompensas: { nome: string; apoios: number; restam?: string }[];
  envios: { nome: string; recompensa: string; status: string; tom: 'ok' | 'pendente' | 'neutro' }[];
}

// ---------- Contas (espelham o protótipo)

export function brl(v: number) {
  const [int, dec] = v.toFixed(2).split('.');
  return `R$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
}
const FRETE = 18;
const ENDERECO = 'Rua da Aurora, 412 · Boa Vista, Recife · 50050-000';

// ---------- Funções

export async function getCheckout(tipo: TipoCheckout, alvoId: string, opcaoId: string): Promise<Checkout> {
  if (tipo === 'apoio') {
    const p = await getProjeto(alvoId);
    const r = p.recompensas.find((x) => x.id === opcaoId) ?? p.recompensas[0];
    const valor = r.valor || 20;
    const frete = r.fisica ? FRETE : 0;
    const total = valor + frete;
    const taxa = Math.round((valor * 0.05 + 0.5) * 100) / 100;
    return {
      tipo,
      alvoId: p.id,
      titulo: 'Pagar',
      subtitulo: `Apoiar · ${p.nome}`,
      linhas: [{ label: r.nome, valor: brl(valor) }, ...(frete ? [{ label: 'Frete · Correios PAC · Recife', valor: brl(frete) }] : [])],
      total: brl(total),
      totalValor: total,
      taxaTxt: `A casa fica com 5% + R$ 0,50 (${brl(taxa)}); o resto vai para ${p.autor.nome}. Sem letra miúda.`,
      endereco: r.fisica ? ENDERECO : undefined,
      botao: `Apoiar com ${brl(total)}`,
      gratis: false,
    };
  }
  const c = await getClube(alvoId);
  const pl = c.planos.find((x) => x.id === opcaoId) ?? c.planos.find((x) => x.id === c.planoPadrao) ?? c.planos[0];
  const valor = pl.gratis ? 0 : Number(pl.preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  const casa = Math.round(valor * 0.14 * 100) / 100;
  return {
    tipo,
    alvoId: c.id,
    titulo: 'Pagar',
    subtitulo: `Puxar a cadeira · ${c.nome}`,
    linhas: [{ label: pl.nome, valor: pl.preco }],
    total: brl(valor),
    totalValor: valor,
    taxaTxt: pl.gratis
      ? 'Porta aberta não custa nada. Dá para trocar de plano quando quiser.'
      : `A casa fica com 14% (${brl(casa)}); ${brl(valor - casa)} vão para ${c.condutor.nome.split(' ')[0]}, que conduz. Sem letra miúda.`,
    botao: pl.gratis ? 'Puxar a cadeira · grátis' : `Assinar · ${pl.preco}`,
    gratis: !!pl.gratis,
  };
}

export const pagar = (p: PedidoPagamento) => delay({ ok: true, ...p }, 500);

export const getMeuApoio = (projetoId: string): Promise<MeuApoio> =>
  delay({
    projetoId,
    projetoNome: projetoId === 'poetas' ? 'Antologia Poetas do Recife' : 'Memórias Póstumas em quadrinhos',
    capaCor: '#4E4573',
    recompensa: 'Capa dura assinada',
    valor: 'R$ 90 + R$ 18',
    pagamento: 'pago via Pix · 19 ago',
    rastreio: {
      codigo: 'BR123456789',
      etapas: [
        { titulo: 'Postado', sub: 'Recife · seg, 16 de set', estado: 'feito' },
        { titulo: 'Em trânsito', sub: 'saiu do centro de distribuição · hoje, 08h12', estado: 'agora' },
        { titulo: 'Entrega prevista', sub: 'até sáb, 28 de set · Rua da Aurora, 412', estado: 'depois' },
      ],
    },
    atualizacoes: [
      { d: '12', m: 'SET', titulo: 'Provas de cor aprovadas', txt: 'Fechamos com a gráfica em Recife. Papel pólen 90 g, capa dura com hot stamping. Foto das provas no fim.' },
      { d: '28', m: 'AGO', titulo: 'Metade da meta em 9 dias', txt: 'Obrigado. Liberamos a recompensa "Kit" com print da capa.' },
      { d: '19', m: 'AGO', titulo: 'Só para apoiadores: rascunhos', txt: 'Você apoiou, então vê: 12 páginas de rascunho a lápis.' },
    ],
    autorNome: 'Estúdio Cubas',
  });

const membros: MembroPainel[] = [
  { id: 'tiago', nome: 'Tiago Bastos', ini: 'TB', bg: '#F6D8CE', fg: '#8E4A3C', plano: 'Cadeira · R$ 24', pagamento: 'pago 3 set', pagamentoOk: true },
  { id: 'camila', nome: 'Camila Ferraz', ini: 'CF', bg: '#DCD3E8', fg: '#4E4573', plano: 'Cadeira anual · R$ 240', pagamento: 'pago 1 fev', pagamentoOk: true },
  { id: 'rafael', nome: 'Rafael Nogueira', ini: 'RN', bg: '#CFE0D2', fg: '#3D5A41', plano: 'Cadeira · R$ 24', pagamento: 'Pix vence amanhã', pagamentoOk: false },
  { id: 'helena', nome: 'Helena Sá', ini: 'HS', bg: '#F7E8B5', fg: '#6F5410', plano: 'Porta aberta', pagamento: 'grátis', pagamentoOk: true },
];

export const getPainelClube = (id: string): Promise<PainelClube> =>
  delay({
    id,
    nome: 'Sarau da Rua Nova',
    numeros: [
      { n: '18', d: 'membros · 11 pagam' },
      { n: 'R$ 227', d: 'a receber dia 5', verde: true },
      { n: '72%', d: 'leram a semana' },
    ],
    pedidos: 2,
    membros,
    membrosRodape: '+14 membros · toque nos três pontos para mudar plano, dar cortesia ou remover',
    repasse: { mes: 'Setembro · 11 assinaturas', bruto: 'R$ 264,00', casa: '- R$ 36,96', liquido: 'R$ 227,04', data: 'Repasse dia 5 de out', chave: 'Pix para a chave luiza@…' },
    sessao: { d: '21', m: 'SET', titulo: 'Sarau · Vidas Secas', quando: 'sáb · 16h · Livraria Jaqueira + on-line', respostas: '12 confirmaram · 3 talvez' },
    sessoesPassadas: [
      { data: '14 set', titulo: 'Contos 4–6 · on-line', presentes: 14 },
      { data: '7 set', titulo: 'Contos 1–3 · on-line', presentes: 16 },
    ],
    enquetes: [
      { id: 'e1', pergunta: 'Sarau de outubro: qual sábado?', onde: 'solta no clube', ondeTom: 'lilas', meta: '11 de 18 votaram · encerra sex', aberta: true, opcoes: [{ t: '4 out', pct: 45 }, { t: '11 out', pct: 36 }, { t: '18 out', pct: 18 }] },
      { id: 'e2', pergunta: 'Quem leva o quê para o café?', onde: 'sessão · 21 set', ondeTom: 'terracota', meta: '15 de 18 votaram · encerra na sessão', aberta: true, opcoes: [{ t: 'Bolo e café · eu levo', pct: 60 }, { t: 'Cada um traz algo', pct: 40 }] },
      { id: 'e3', pergunta: 'Vidas Secas ou Angústia para setembro?', onde: 'solta no clube', ondeTom: 'neutro', meta: 'encerrada · 16 votos', aberta: false, opcoes: [{ t: 'Vidas Secas', pct: 69 }, { t: 'Angústia', pct: 31 }] },
    ],
    membrosTotal: 18,
  });

export const getPainelProjeto = (id: string): Promise<PainelProjeto> =>
  delay({
    id,
    nome: 'Antologia Poetas do Recife',
    arrecadado: 'R$ 4.650',
    meta: 'R$ 15.000',
    pct: 31,
    apoiadores: 84,
    diasRestantes: 38,
    ritmo: 'No ritmo: projetos com 31% na 1ª semana batem a meta em 8 de cada 10 vezes.',
    recompensas: [
      { nome: 'Livro impresso · R$ 60', apoios: 51, restam: '199 restam' },
      { nome: 'PDF + agradecimentos · R$ 25', apoios: 22 },
      { nome: 'Livro + sarau · R$ 120', apoios: 9, restam: '31 restam' },
      { nome: 'Só apoiar', apoios: 2, restam: 'R$ 40' },
    ],
    envios: [
      { nome: 'Marina Albuquerque', recompensa: 'Capa dura assinada', status: 'postado · BR123456789', tom: 'ok' },
      { nome: 'Tiago Bastos', recompensa: 'Kit completo', status: 'aguardando endereço', tom: 'pendente' },
      { nome: 'Camila Ferraz', recompensa: 'Capa dura assinada', status: 'a embalar', tom: 'neutro' },
      { nome: 'Helena Sá', recompensa: 'PDF', status: 'enviado por e-mail', tom: 'ok' },
    ],
  });

export interface NovaEnquete {
  clubeId: string;
  pergunta: string;
  opcoes: string[];
  multipla: boolean;
  onde: 'clube' | 'sessao';
  encerra: '3d' | '1s' | 'sessao' | 'manual';
  anonima: boolean;
}
export const criarEnquete = (e: NovaEnquete) => delay({ id: String(Date.now()), ...e });
export const encerrarEnquete = (clubeId: string, enqueteId: string) => delay({ clubeId, enqueteId });

export interface Aviso {
  tipo: 'clube' | 'projeto';
  alvoId: string;
  titulo: string;
  texto: string;
  soApoiadores?: boolean;
}
export const publicarAviso = (a: Aviso) => delay({ id: String(Date.now()), ...a });
export const lembrarSemResposta = (clubeId: string) => delay({ clubeId });
