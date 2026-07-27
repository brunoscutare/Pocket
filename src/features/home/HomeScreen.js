import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Fab } from '../../components/Fab';
import { PieChart } from '../../components/PieChart';
import { CORES_TIPOS_GASTO } from '../../constants/tiposGasto';
import { buscarHistoricoSaldo, buscarRendaTotal } from '../../services/rendaService';
import { listarPendencias, somarPendenciasConcluidas } from '../../services/pendenciasService';
import { RendaFormSheet } from './RendaFormSheet';
import { NotificacoesSheet } from './NotificacoesSheet';

function formatarRenda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function HomeScreen() {
  const [renda, setRenda] = useState(0);
  const [saldoReal, setSaldoReal] = useState(0);
  const [historicoSaldo, setHistoricoSaldo] = useState(0);
  const [pendencias, setPendencias] = useState([]);
  const [formAberto, setFormAberto] = useState(false);
  const [notificacoesAberto, setNotificacoesAberto] = useState(false);

  const carregarRenda = useCallback(() => {
    Promise.all([
      buscarRendaTotal(),
      somarPendenciasConcluidas(),
      listarPendencias(),
      buscarHistoricoSaldo(),
    ]).then(([total, pago, lista, historico]) => {
      setRenda(total);
      setSaldoReal(total - pago);
      setPendencias(lista);
      setHistoricoSaldo(historico);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarRenda();
    }, [carregarRenda]),
  );

  const concluidas = pendencias.filter((p) => p.concluido).length;
  const pendentes = pendencias.length - concluidas;

  // Soma o preço de todas as pendências (marcadas ou não) agrupado por tipo de gasto,
  // pra montar a pizza de "quanto % cada tipo representa".
  const dadosGrafico = useMemo(() => {
    const porTipo = new Map();
    for (const p of pendencias) {
      if (!p.preco) continue;
      const chave = p.tipo || 'Sem tipo';
      porTipo.set(chave, (porTipo.get(chave) || 0) + p.preco);
    }
    return Array.from(porTipo.entries()).map(([label, value]) => ({
      label,
      value,
      color: CORES_TIPOS_GASTO[label] || CORES_TIPOS_GASTO['Sem tipo'],
    }));
  }, [pendencias]);

  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>POCKET</Text>
          <Text style={styles.welcome}>Organize seus pagamentos</Text>
        </View>

        <TouchableOpacity style={styles.iconButton} onPress={() => setNotificacoesAberto(true)}>
          <Ionicons name="notifications-outline" size={22} color="#ff7a00" />
        </TouchableOpacity>
      </View>

      {/* Renda */}
      <View style={styles.row}>
        <View style={[styles.smallCard, { marginRight: 10 }]}>
          <Text style={styles.cardTitle}>ENTROU</Text>
          <Text style={[styles.cardValue, styles.valorVerde]}>{formatarRenda(renda)}</Text>
          <View style={styles.circleGreen}>
            <Ionicons name="arrow-up" size={20} color="#00d26a" />
          </View>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.cardTitle}>SALDO REAL</Text>
          <Text style={[styles.cardValue, styles.valorVermelho]}>{formatarRenda(saldoReal)}</Text>
          <View style={styles.circleVermelho}>
            <Ionicons name="arrow-down" size={20} color="#ff5252" />
          </View>
        </View>
      </View>

      {/* Gastos por tipo */}
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>Gastos por tipo</Text>
        <PieChart data={dadosGrafico} />
      </View>

      {/* Card Principal */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>PENDÊNCIAS DO MÊS</Text>

        <Text style={styles.balanceValue}>{String(pendencias.length).padStart(2, '0')}</Text>

        <Text style={styles.balanceSubtitle}>
          {concluidas} concluída{concluidas === 1 ? '' : 's'} • {pendentes} pendente{pendentes === 1 ? '' : 's'}
        </Text>
      </View>

      {/* Histórico do saldo */}
      <View style={styles.smallCard}>
        <View style={styles.historicoRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>HISTÓRICO DO SALDO</Text>
            <Text
              style={[
                styles.cardValue,
                styles.historicoValor,
                historicoSaldo >= 0 ? styles.valorVerde : styles.valorVermelho,
              ]}
            >
              {formatarRenda(historicoSaldo)}
            </Text>
          </View>
          <View style={historicoSaldo >= 0 ? styles.circleGreen : styles.circleVermelho}>
            <Ionicons
              name={historicoSaldo >= 0 ? 'trending-up' : 'trending-down'}
              size={20}
              color={historicoSaldo >= 0 ? '#00d26a' : '#ff5252'}
            />
          </View>
        </View>
        <Text style={styles.historicoSubtitulo}>Soma acumulada do saldo de cada ciclo já fechado</Text>
      </View>

    </ScrollView>

      <Fab onPress={() => setFormAberto(true)} />

      <RendaFormSheet
        open={formAberto}
        onClose={() => setFormAberto(false)}
        onSaved={carregarRenda}
        rendaAtual={renda}
      />

      <NotificacoesSheet open={notificacoesAberto} onClose={() => setNotificacoesAberto(false)} />
    </View>
  );
}

const ORANGE = "#ff7a00";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
    paddingHorizontal: 18,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    color: ORANGE,
    fontSize: 34,
    fontWeight: "900",
  },

  welcome: {
    color: "#888",
    marginTop: 4,
  },

  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },

  balanceCard: {
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 18,
  },

  balanceTitle: {
    color: "#888",
    letterSpacing: 1,
    fontSize: 12,
  },

  balanceValue: {
    color: "#fff",
    fontSize: 46,
    fontWeight: "800",
    marginVertical: 8,
  },

  balanceSubtitle: {
    color: "#00d26a",
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    marginBottom: 18,
  },

  smallCard: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#222",
  },

  cardTitle: {
    color: "#888",
    fontSize: 11,
  },

  cardValue: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
    marginTop: 8,
  },

  valorVerde: { color: "#00d26a", fontSize: 20 },
  valorVermelho: { color: "#ff5252", fontSize: 20 },

  historicoRow: { flexDirection: "row", alignItems: "flex-start" },
  historicoValor: { marginTop: 4 },
  historicoSubtitulo: { color: "#666", fontSize: 11.5, marginTop: 10 },

  circleGreen: {
    alignSelf: "flex-end",
    backgroundColor: "#0f261a",
    padding: 10,
    borderRadius: 12,
  },

  circleVermelho: {
    alignSelf: "flex-end",
    backgroundColor: "#2a0f0f",
    padding: 10,
    borderRadius: 12,
  },

  circleOrange: {
    alignSelf: "flex-end",
    backgroundColor: "#2d1b0b",
    padding: 10,
    borderRadius: 12,
  },

  graphCard: {
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#222",
  },

  graphTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  tipCard: {
    backgroundColor: "#241407",
    borderRadius: 24,
    padding: 22,
    marginBottom: 30,
  },

  tipTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },

  tipText: {
    color: "#ddd",
    marginVertical: 18,
    lineHeight: 24,
  },

  button: {
    backgroundColor: ORANGE,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});