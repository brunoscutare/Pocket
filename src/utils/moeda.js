// Máscara de dinheiro (R$ 0,00) — trata o texto digitado como centavos, então cada
// dígito novo entra pela direita, igual campo de valor de banco.
export function maskMoeda(texto) {
  const digitos = String(texto || '').replace(/\D/g, '');
  if (!digitos) return '';
  const numero = Number(digitos) / 100;
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function moedaParaNumero(texto) {
  const digitos = String(texto || '').replace(/\D/g, '');
  if (!digitos) return null;
  return Number(digitos) / 100;
}

export function numeroParaMoeda(numero) {
  if (numero == null) return '';
  return maskMoeda(String(Math.round(numero * 100)));
}
