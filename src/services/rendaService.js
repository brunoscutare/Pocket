import { getDb } from './database';
import { registrarMovimentacao } from './movimentacoesService';
import { resetarTodasPendencias, somarPendenciasConcluidas } from './pendenciasService';

// Guarda o total atual da renda e o saldo histórico acumulado (uma linha fixa, id=1) —
// o histórico de cada lançamento individual fica em `movimentacoes`
// (movimentacoesService.js).

export async function buscarRendaTotal() {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT total FROM renda WHERE id = 1;');
  return row?.total ?? 0;
}

// Soma acumulada, ciclo a ciclo, da diferença (entrou - saiu) de cada mês já fechado —
// ver registrarNovoSalario().
export async function buscarHistoricoSaldo() {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT historico_saldo FROM renda WHERE id = 1;');
  return row?.historico_saldo ?? 0;
}

// "Nova renda" (não é salário novo): soma no total existente.
export async function adicionarRenda(valor) {
  const db = await getDb();
  await db.runAsync('UPDATE renda SET total = total + ? WHERE id = 1;', valor);
  await registrarMovimentacao('Nova renda', valor);
}

// "Novo salário": fecha o ciclo atual (a diferença entrou-saiu dele — ou seja, o saldo
// real do momento — vai pro histórico acumulado), substitui o total (novo ciclo do
// zero) e reseta as pendências, já que um novo ciclo de pagamentos começa junto.
export async function registrarNovoSalario(valor) {
  const db = await getDb();
  const atual = await db.getFirstAsync('SELECT total FROM renda WHERE id = 1;');
  const pago = await somarPendenciasConcluidas();
  const diferencaCiclo = (atual?.total ?? 0) - pago;

  await db.runAsync(
    'UPDATE renda SET total = ?, historico_saldo = historico_saldo + ? WHERE id = 1;',
    valor,
    diferencaCiclo,
  );
  await resetarTodasPendencias();
  await registrarMovimentacao('Salário', valor);
}
