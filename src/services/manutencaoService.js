import { getDb } from './database';
import { cancelarTodasNotificacoes } from './notificacoesService';

// "Limpar dados": zera tudo que não seja pendência (o usuário quer manter os
// checkboxes intactos). Depois roda VACUUM pra devolver o espaço liberado no
// arquivo do banco — é isso que deixa o app mais leve, não só apaga as linhas.
export async function limparDados({ limparHistoricoSaldo = false } = {}) {
  const db = await getDb();
  await db.runAsync('DELETE FROM movimentacoes;');
  await db.runAsync(
    limparHistoricoSaldo
      ? 'UPDATE renda SET total = 0, historico_saldo = 0 WHERE id = 1;'
      : 'UPDATE renda SET total = 0 WHERE id = 1;',
  );
  await db.execAsync('VACUUM;');
}

// "Limpar pendências": mesmo tratamento de banco do "Limpar dados" (apaga de vez e
// roda VACUUM), só que na tabela `pendencias` — cancela os lembretes de vencimento
// agendados antes de apagar, senão ficariam disparando notificação de pendência que
// não existe mais. Junto com "Limpar dados", zera o app 100%.
export async function limparPendencias() {
  await cancelarTodasNotificacoes();
  const db = await getDb();
  await db.runAsync('DELETE FROM pendencias;');
  await db.execAsync('VACUUM;');
}
