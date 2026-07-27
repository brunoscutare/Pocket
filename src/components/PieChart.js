import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

function paraCartesiano(cx, cy, r, anguloGraus) {
  const rad = ((anguloGraus - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function caminhoFatia(cx, cy, r, inicio, fim) {
  const p1 = paraCartesiano(cx, cy, r, fim);
  const p2 = paraCartesiano(cx, cy, r, inicio);
  const arcoGrande = fim - inicio > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${arcoGrande} 0 ${p2.x} ${p2.y} Z`;
}

// data: [{ label, value, color }]. Desenha um gráfico de pizza de verdade (fatias a
// partir do centro), com legenda (bolinha + nome + %) embaixo.
export function PieChart({ data, size = 150 }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const r = size / 2;

  let anguloAcumulado = 0;
  const fatias = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const angulo = (d.value / total) * 360;
      const inicio = anguloAcumulado;
      const fim = anguloAcumulado + angulo;
      anguloAcumulado = fim;
      return { ...d, inicio, fim };
    });

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        {total > 0 ? (
          <Svg width={size} height={size}>
            {fatias.length === 1 ? (
              <Circle cx={r} cy={r} r={r} fill={fatias[0].color} />
            ) : (
              fatias.map((f) => <Path key={f.label} d={caminhoFatia(r, r, r, f.inicio, f.fim)} fill={f.color} />)
            )}
          </Svg>
        ) : (
          <View style={[styles.vazio, { width: size, height: size, borderRadius: r }]} />
        )}
      </View>

      <View style={styles.legenda}>
        {total === 0 ? (
          <Text style={styles.vazioTexto}>Sem gastos com preço cadastrados ainda.</Text>
        ) : (
          data
            .filter((d) => d.value > 0)
            .map((d) => (
              <View key={d.label} style={styles.legendaItem}>
                <View style={[styles.dot, { backgroundColor: d.color }]} />
                <Text style={styles.legendaTexto} numberOfLines={1}>
                  {d.label}
                </Text>
                <Text style={styles.legendaPct}>{Math.round((d.value / total) * 100)}%</Text>
              </View>
            ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  vazio: { backgroundColor: colors.cardBorder },
  vazioTexto: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  legenda: { flex: 1, gap: 10 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendaTexto: { flex: 1, color: colors.text, fontSize: 13.5 },
  legendaPct: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
});
