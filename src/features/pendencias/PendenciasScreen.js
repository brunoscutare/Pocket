import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Checkbox } from '../../components/Checkbox';
import { Fab } from '../../components/Fab';
import { colors } from '../../theme/colors';
import { alternarConcluido, excluirPendencia, listarPendencias } from '../../services/pendenciasService';
import { registrarMovimentacao } from '../../services/movimentacoesService';
import { buscarRendaTotal } from '../../services/rendaService';
import { PendenciaAcoesSheet } from './PendenciaAcoesSheet';
import { PendenciaFormSheet } from './PendenciaFormSheet';

function formatarPreco(preco) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function PendenciaRow({ item, last, onToggle, onLongPress }) {
  return (
    <Pressable
      onLongPress={() => onLongPress(item)}
      delayLongPress={350}
      style={[styles.item, last ? { borderBottomWidth: 0 } : null]}
    >
      <Checkbox checked={item.concluido} onToggle={() => onToggle(item)} />
      <View style={{ marginLeft: 15, flex: 1 }}>
        <Text
          style={[styles.itemTitle, item.concluido ? styles.itemTituloConcluido : null]}
          numberOfLines={1}
        >
          {item.nome}
        </Text>
        {item.preco != null || item.diaVencimento != null ? (
          <Text style={styles.itemSubtitle}>
            {item.preco != null ? formatarPreco(item.preco) : ''}
            {item.preco != null && item.precoFixo ? ' · Fixo' : ''}
            {item.diaVencimento != null ? `${item.preco != null ? ' · ' : ''}Vence dia ${item.diaVencimento}` : ''}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function PendenciasScreen() {
  const [pendencias, setPendencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [itemAcoes, setItemAcoes] = useState(null);
  const [itemParaEditar, setItemParaEditar] = useState(null);
  const [renda, setRenda] = useState(0);

  const carregar = useCallback(() => {
    Promise.all([listarPendencias(), buscarRendaTotal()])
      .then(([lista, total]) => {
        setPendencias(lista);
        setRenda(total);
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function alternar(item) {
    const novoConcluido = !item.concluido;
    setPendencias((atual) =>
      atual.map((p) => (p.id === item.id ? { ...p, concluido: novoConcluido } : p)),
    );
    await alternarConcluido(item.id, novoConcluido);
    // Só registra no histórico de movimentações quando MARCA como paga (não ao
    // desmarcar) — e só se tiver preço, senão não há valor pra lançar.
    if (novoConcluido && item.preco != null) {
      await registrarMovimentacao(item.nome, -item.preco);
    }
    carregar();
  }

  function abrirNovo() {
    if (renda <= 0) {
      Alert.alert(
        'Sem renda cadastrada',
        'Cadastre uma renda em Início antes de adicionar pendências.',
      );
      return;
    }
    setItemEditando(null);
    setFormAberto(true);
  }

  function abrirEditar(item) {
    // Guarda a intenção e fecha o sheet de ações; só abre o de edição quando o
    // BottomSheet avisa (via onClosed) que a animação de saída terminou de verdade —
    // um `setTimeout` com duração fixa não é confiável (o tempo real varia por
    // aparelho) e ter dois Modal nativos abertos ao mesmo tempo trava o app.
    setItemParaEditar(item);
    setItemAcoes(null);
  }

  function aoFecharAcoes() {
    if (itemParaEditar) {
      setItemEditando(itemParaEditar);
      setFormAberto(true);
      setItemParaEditar(null);
    }
  }

  async function excluir(item) {
    setItemAcoes(null);
    await excluirPendencia(item.id);
    carregar();
  }

  const pendentes = pendencias.filter((p) => !p.concluido).length;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Pendências</Text>
          <Text style={styles.subtitle}>
            {loading ? 'Carregando...' : `${pendentes} tarefa${pendentes === 1 ? '' : 's'} aguardando`}
          </Text>
        </View>

        {loading ? (
          <View style={styles.estado}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : pendencias.length === 0 ? (
          <View style={styles.listCard}>
            <Text style={styles.vazio}>
              {renda <= 0
                ? 'Cadastre uma renda em Início antes de adicionar pendências.'
                : 'Nenhuma pendência ainda. Toque no botão + pra adicionar a primeira.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {pendencias.map((item, index) => (
              <PendenciaRow
                key={item.id}
                item={item}
                last={index === pendencias.length - 1}
                onToggle={alternar}
                onLongPress={setItemAcoes}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Fab onPress={abrirNovo} />

      <PendenciaFormSheet
        open={formAberto}
        item={itemEditando}
        onClose={() => setFormAberto(false)}
        onSaved={carregar}
      />

      <PendenciaAcoesSheet
        open={!!itemAcoes}
        item={itemAcoes}
        onClose={() => setItemAcoes(null)}
        onClosed={aoFecharAcoes}
        onEditar={abrirEditar}
        onExcluir={excluir}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 18, paddingTop: 60 },
  header: { marginBottom: 24 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginTop: 4 },
  estado: { paddingVertical: 40, alignItems: 'center' },
  listCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  vazio: { color: colors.textMuted, fontSize: 14.5, lineHeight: 20, textAlign: 'center', paddingVertical: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  itemTitle: { color: colors.text, fontSize: 17 },
  itemTituloConcluido: { color: colors.textMuted, textDecorationLine: 'line-through' },
  itemSubtitle: { color: colors.textMuted, marginTop: 3 },
});
