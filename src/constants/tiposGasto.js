export const TIPOS_GASTO = [
  'Cartão de crédito',
  'Gasolina',
  'Financiamento casa',
  'Financiamento carro',
  'Condomínio',
  'Faculdade',
  'Energia elétrica',
  'Água',
  'Internet',
  'Pessoas',
  'Outros',
];

// Cor fixa por tipo (não por posição na lista de um gráfico) — assim o mesmo tipo
// sempre aparece com a mesma cor, mês a mês, independente de quais outros tipos
// estão presentes. Os 8 primeiros hex vêm de uma paleta categórica validada pra
// leitores com daltonismo (contraste mínimo garantido entre pares adjacentes);
// os últimos 3 + "Sem tipo" são cores extras (mesma linguagem visual, sem a
// mesma validação formal — acima de 8 categorias nenhuma ordem passa em todos os
// pares mesmo assim).
export const CORES_TIPOS_GASTO = {
  'Cartão de crédito': '#3987e5',
  Gasolina: '#d95926',
  'Financiamento casa': '#199e70',
  'Financiamento carro': '#c98500',
  Condomínio: '#d55181',
  Faculdade: '#008300',
  'Energia elétrica': '#9085e9',
  Água: '#e66767',
  Internet: '#4a9691',
  Pessoas: '#a67c52',
  Outros: '#8b95a3',
  'Sem tipo': '#6b7280',
};
