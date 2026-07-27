import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import { BottomSheet } from '../../components/BottomSheet';
import { colors } from '../../theme/colors';
import { listarMovimentacoes } from '../../services/movimentacoesService';

const PAGE_SIZE = 10;
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function paraDataLocal(isoString) {
  // `criado_em` vem do SQLite em UTC ("YYYY-MM-DD HH:MM:SS").
  return new Date(`${isoString.replace(' ', 'T')}Z`);
}

function formatarValor(valor) {
  const sinal = valor >= 0 ? '+' : '-';
  const abs = Math.abs(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return `${sinal}${abs}`;
}

function formatarHora(data) {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function mesmoDia(a, b) {
  return a.toDateString() === b.toDateString();
}

function tituloSecao(data) {
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  const diaMes = `${String(data.getDate()).padStart(2, '0')} ${MESES[data.getMonth()]}`;
  if (mesmoDia(data, hoje)) return `HOJE — ${diaMes}`;
  if (mesmoDia(data, ontem)) return `ONTEM — ${diaMes}`;
  return diaMes;
}

// Agrupa a lista (já ordenada do mais novo pro mais velho) em seções por dia,
// preservando a ordem.
function agruparPorDia(lista) {
  const secoes = [];
  for (const item of lista) {
    const ultima = secoes[secoes.length - 1];
    if (ultima && mesmoDia(ultima.data, item.data)) {
      ultima.itens.push(item);
    } else {
      secoes.push({ data: item.data, itens: [item] });
    }
  }
  return secoes;
}

export default function MovimentacoesScreen() {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroData, setFiltroData] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dataTemp, setDataTemp] = useState(new Date());

  const carregarPrimeiraPagina = useCallback(() => {
    setLoading(true);
    listarMovimentacoes({ busca, data: filtroData, offset: 0, limite: PAGE_SIZE })
      .then(({ itens: lista, total: totalGeral }) => {
        setItens(lista.map((m) => ({ ...m, data: paraDataLocal(m.criadoEm) })));
        setTotal(totalGeral);
      })
      .finally(() => setLoading(false));
  }, [busca, filtroData]);

  useFocusEffect(
    useCallback(() => {
      carregarPrimeiraPagina();
    }, [carregarPrimeiraPagina]),
  );

  function carregarMais() {
    setCarregandoMais(true);
    listarMovimentacoes({ busca, data: filtroData, offset: itens.length, limite: PAGE_SIZE })
      .then(({ itens: lista, total: totalGeral }) => {
        setItens((atual) => [...atual, ...lista.map((m) => ({ ...m, data: paraDataLocal(m.criadoEm) }))]);
        setTotal(totalGeral);
      })
      .finally(() => setCarregandoMais(false));
  }

  function abrirFiltroData() {
    setDataTemp(filtroData || new Date());
    setShowDatePicker(true);
  }

  function confirmarFiltroData() {
    setFiltroData(dataTemp);
    setShowDatePicker(false);
  }

  function onChangeDataAndroid(evento, selecionada) {
    setShowDatePicker(false);
    if (evento.type === 'set' && selecionada) setFiltroData(selecionada);
  }

  const temMais = itens.length < total;
  const secoes = agruparPorDia(itens);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Movimentações</Text>
            <Text style={styles.subtitle}>Últimas entradas e saídas</Text>
          </View>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color={colors.accent} />
          </Pressable>
        </View>

        <View style={styles.searchField}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Procurar transações"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filtrosRow}>
          <Pressable
            onPress={() => (filtroData ? setFiltroData(null) : abrirFiltroData())}
            style={[styles.pill, styles.pillData, filtroData && styles.pillAtiva]}
          >
            <Ionicons
              name={filtroData ? 'close' : 'options-outline'}
              size={14}
              color={filtroData ? colors.bg : colors.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.pillTexto, filtroData && styles.pillTextoAtivo]}>
              {filtroData ? filtroData.toLocaleDateString('pt-BR') : 'FILTRAR DATA'}
            </Text>
          </Pressable>
        </View>

        {Platform.OS === 'android' && showDatePicker ? (
          <DateTimePicker value={filtroData || new Date()} mode="date" display="default" onChange={onChangeDataAndroid} />
        ) : null}

        {loading ? (
          <View style={styles.estado}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : secoes.length === 0 ? (
          <View style={styles.listCard}>
            <Text style={styles.vazio}>
              {total === 0 && !busca.trim() && !filtroData
                ? 'Nada registrado ainda. Lançamentos de renda e pendências marcadas como pagas aparecem aqui.'
                : 'Nenhuma transação encontrada com esses filtros.'}
            </Text>
          </View>
        ) : (
          secoes.map((secao) => (
            <View key={secao.data.toISOString()} style={{ marginBottom: 22 }}>
              <View style={styles.secaoHeader}>
                <Text style={styles.secaoTitulo}>{tituloSecao(secao.data)}</Text>
                <View style={styles.secaoLinha} />
              </View>

              <View style={styles.secaoBorda}>
                {secao.itens.map((item, index) => {
                  const positivo = item.valor >= 0;
                  return (
                    <View
                      key={item.id}
                      style={[styles.item, index === secao.itens.length - 1 ? { marginBottom: 0 } : null]}
                    >
                      <View style={styles.itemIconBox}>
                        <Ionicons
                          name={positivo ? 'arrow-down' : 'arrow-up'}
                          size={18}
                          color={positivo ? '#00d26a' : colors.accent}
                        />
                      </View>
                      <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {item.descricao}
                        </Text>
                        <Text style={styles.itemSubtitle}>{formatarHora(item.data)}</Text>
                      </View>
                      <Text style={[styles.itemValor, { color: positivo ? '#00d26a' : colors.accent }]}>
                        {formatarValor(item.valor)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}

        {temMais ? (
          <Pressable onPress={carregarMais} disabled={carregandoMais} style={styles.carregarMais}>
            {carregandoMais ? (
              <ActivityIndicator color={colors.textMuted} />
            ) : (
              <>
                <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                <Text style={styles.carregarMaisTexto}>Carregar mais transações</Text>
              </>
            )}
          </Pressable>
        ) : null}
      </ScrollView>

      {Platform.OS === 'ios' ? (
        <BottomSheet open={showDatePicker} onClose={() => setShowDatePicker(false)} maxHeight="60%">
          <View style={styles.sheetWrap}>
            <Text style={styles.sheetTitulo}>Filtrar por data</Text>
            <DateTimePicker
              value={dataTemp}
              mode="date"
              display="spinner"
              themeVariant="dark"
              onChange={(_, selecionada) => selecionada && setDataTemp(selecionada)}
            />
            <Pressable onPress={confirmarFiltroData} style={styles.confirmarButton}>
              <Text style={styles.confirmarTexto}>Confirmar</Text>
            </Pressable>
          </View>
        </BottomSheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 18, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginTop: 4 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, padding: 0 },
  filtrosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillData: { flex: 1, justifyContent: 'center' },
  pillAtiva: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillTexto: { color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  pillTextoAtivo: { color: colors.bg },
  estado: { paddingVertical: 40, alignItems: 'center' },
  listCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  vazio: { color: colors.textMuted, fontSize: 14.5, lineHeight: 20, textAlign: 'center', paddingVertical: 10 },
  secaoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 12 },
  secaoTitulo: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  secaoLinha: { flex: 1, height: 1, backgroundColor: colors.cardBorder },
  secaoBorda: { borderLeftWidth: 2, borderLeftColor: colors.accent, paddingLeft: 14, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
  },
  itemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { color: colors.text, fontSize: 15.5, fontWeight: '600' },
  itemSubtitle: { color: colors.textMuted, marginTop: 3, fontSize: 12.5 },
  itemValor: { fontSize: 15, fontWeight: '700' },
  carregarMais: { alignItems: 'center', gap: 8, marginTop: 10, paddingVertical: 16 },
  carregarMaisTexto: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  sheetWrap: { paddingTop: 4, paddingBottom: 8, alignItems: 'center' },
  sheetTitulo: { color: colors.text, fontSize: 18, fontWeight: '800', alignSelf: 'flex-start', marginBottom: 4 },
  confirmarButton: {
    alignSelf: 'stretch',
    marginTop: 16,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  confirmarTexto: { color: '#000', fontSize: 15.5, fontWeight: '800' },
});
