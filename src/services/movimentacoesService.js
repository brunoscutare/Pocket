import { getDb } from './database';

// Histórico (só de leitura pro usuário) de tudo que mexeu na renda: salário, renda
// extra e pendências marcadas como pagas. `valor` já vem com o sinal certo
// (positivo = entrada, negativo = saída).

function fromRow(row) {
  return { id: row.id, descricao: row.descricao, valor: row.valor, criadoEm: row.criado_em };
}

// `criado_em` é gravado pelo SQLite em UTC ("YYYY-MM-DD HH:MM:SS", via datetime('now')).
// Pra filtrar por um dia do calendário LOCAL do usuário, convertemos os limites desse
// dia (00:00 e 23:59:59 locais) pro mesmo formato UTC antes de comparar no SQL.
function paraFormatoSql(data) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${data.getUTCFullYear()}-${pad(data.getUTCMonth() + 1)}-${pad(data.getUTCDate())} ${pad(data.getUTCHours())}:${pad(data.getUTCMinutes())}:${pad(data.getUTCSeconds())}`;
}

// Busca paginada (LIMIT/OFFSET) pra não precisar carregar o histórico inteiro na tela —
// filtro de nome e de dia já aplicados no SQL, não em memória.
export async function listarMovimentacoes({ busca = '', data = null, offset = 0, limite = 10 } = {}) {
  const db = await getDb();
  const condicoes = [];
  const params = [];

  const termo = busca.trim();
  if (termo) {
    condicoes.push('descricao LIKE ?');
    params.push(`%${termo}%`);
  }

  if (data) {
    const inicioDia = new Date(data);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(data);
    fimDia.setHours(23, 59, 59, 999);
    condicoes.push('criado_em BETWEEN ? AND ?');
    params.push(paraFormatoSql(inicioDia), paraFormatoSql(fimDia));
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const rows = await db.getAllAsync(
    `SELECT * FROM movimentacoes ${where} ORDER BY id DESC LIMIT ? OFFSET ?;`,
    ...params,
    limite,
    offset,
  );
  const totalRow = await db.getFirstAsync(
    `SELECT COUNT(*) as total FROM movimentacoes ${where};`,
    ...params,
  );

  return { itens: rows.map(fromRow), total: totalRow?.total ?? 0 };
}

export async function registrarMovimentacao(descricao, valor, pendenciaId = null) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO movimentacoes (descricao, valor, pendencia_id) VALUES (?, ?, ?);',
    descricao,
    valor,
    pendenciaId,
  );
}

export async function excluirMovimentacoesDaPendencia(pendenciaId, descricao = null, valor = null) {
  const db = await getDb();
  if (descricao != null && valor != null) {
    await db.runAsync(
      `DELETE FROM movimentacoes
       WHERE id = (
         SELECT id FROM movimentacoes
         WHERE pendencia_id = ? OR (pendencia_id IS NULL AND descricao = ? AND valor = ?)
         ORDER BY id DESC LIMIT 1
       );`,
      pendenciaId,
      descricao,
      -Math.abs(valor),
    );
    return;
  }
  await db.runAsync('DELETE FROM movimentacoes WHERE pendencia_id = ?;', pendenciaId);
}
