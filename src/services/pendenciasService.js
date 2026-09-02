import { getDb } from './database';
import { cancelarNotificacoes, reagendarNotificacoes } from './notificacoesService';
import { excluirMovimentacoesDaPendencia } from './movimentacoesService';

// Cada linha é uma pendência (o "checkbox"). O app é 100% offline — sem servidor, tudo
// fica só no SQLite local do aparelho.

function fromRow(row) {
  return {
    id: row.id,
    nome: row.nome,
    preco: row.preco,
    precoFixo: !!row.preco_fixo,
    concluido: !!row.concluido,
    tipo: row.tipo,
    diaVencimento: row.dia_vencimento,
    notifAvisoId: row.notif_aviso_id,
    notifDiaId: row.notif_dia_id,
  };
}

export async function listarPendencias() {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT * FROM pendencias ORDER BY concluido ASC, id DESC;');
  return rows.map(fromRow);
}

async function salvarNotificacoes(db, id, { notifAvisoId, notifDiaId }) {
  await db.runAsync(
    'UPDATE pendencias SET notif_aviso_id = ?, notif_dia_id = ? WHERE id = ?;',
    notifAvisoId,
    notifDiaId,
    id,
  );
}

export async function criarPendencia({ nome, preco, precoFixo, tipo, diaVencimento }) {
  const db = await getDb();
  const resultado = await db.runAsync(
    'INSERT INTO pendencias (nome, preco, preco_fixo, concluido, tipo, dia_vencimento) VALUES (?, ?, ?, 0, ?, ?);',
    nome,
    preco == null ? null : preco,
    precoFixo ? 1 : 0,
    tipo ?? null,
    diaVencimento ?? null,
  );
  const id = resultado.lastInsertRowId;
  const notificacoes = await reagendarNotificacoes({ id, nome, diaVencimento, concluido: false });
  await salvarNotificacoes(db, id, notificacoes);
  return id;
}

export async function atualizarPendencia(id, { nome, preco, precoFixo, tipo, diaVencimento }) {
  const db = await getDb();
  const antiga = await db.getFirstAsync('SELECT * FROM pendencias WHERE id = ?;', id);
  await db.runAsync(
    'UPDATE pendencias SET nome = ?, preco = ?, preco_fixo = ?, tipo = ?, dia_vencimento = ? WHERE id = ?;',
    nome,
    preco == null ? null : preco,
    precoFixo ? 1 : 0,
    tipo ?? null,
    diaVencimento ?? null,
    id,
  );
  const pendenciaAntiga = antiga ? fromRow(antiga) : {};
  const notificacoes = await reagendarNotificacoes({
    id,
    nome,
    diaVencimento,
    concluido: pendenciaAntiga.concluido ?? false,
    notifAvisoId: pendenciaAntiga.notifAvisoId,
    notifDiaId: pendenciaAntiga.notifDiaId,
  });
  await salvarNotificacoes(db, id, notificacoes);
}

export async function alternarConcluido(id, concluido) {
  const db = await getDb();
  await db.runAsync('UPDATE pendencias SET concluido = ? WHERE id = ?;', concluido ? 1 : 0, id);
  const row = await db.getFirstAsync('SELECT * FROM pendencias WHERE id = ?;', id);
  if (row) {
    const notificacoes = await reagendarNotificacoes({ ...fromRow(row), concluido });
    await salvarNotificacoes(db, id, notificacoes);
  }
}

export async function excluirPendencia(id) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM pendencias WHERE id = ?;', id);
  if (row) {
    await cancelarNotificacoes(fromRow(row));
  }
  await excluirMovimentacoesDaPendencia(id, row?.nome, row?.preco);
  await excluirMovimentacoesDaPendencia(id);
  await db.runAsync('DELETE FROM pendencias WHERE id = ?;', id);
}

// Chamado quando o usuário registra um "novo salário": todo mês/ciclo novo começa com
// tudo por pagar de novo. Preços não fixos (ex.: cartão de crédito, que varia todo mês)
// são apagados também — o usuário precisa reeditar a pendência e informar o valor do
// novo ciclo. Preços fixos (ex.: aluguel) permanecem como estão. Os lembretes de
// vencimento de quem tem dia cadastrado são reagendados pro novo ciclo.
export async function resetarTodasPendencias() {
  const db = await getDb();
  await db.runAsync('UPDATE pendencias SET concluido = 0, preco = CASE WHEN preco_fixo = 0 THEN NULL ELSE preco END;');
  const rows = await db.getAllAsync('SELECT * FROM pendencias WHERE dia_vencimento IS NOT NULL;');
  for (const row of rows) {
    const pendencia = fromRow(row);
    const notificacoes = await reagendarNotificacoes(pendencia);
    await salvarNotificacoes(db, pendencia.id, notificacoes);
  }
}

// Soma o preço de tudo que já foi marcado como pago — usado na Home pra calcular o
// saldo real (renda total menos o que já foi comprometido).
export async function somarPendenciasConcluidas() {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT COALESCE(SUM(preco), 0) as total FROM pendencias WHERE concluido = 1;');
  return row?.total ?? 0;
}
