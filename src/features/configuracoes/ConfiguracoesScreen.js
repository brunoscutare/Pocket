import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { limparDados, limparPendencias } from '../../services/manutencaoService';

export default function ConfiguracoesScreen() {
  const [limpandoPendencias, setLimpandoPendencias] = useState(false);
  const [limpando, setLimpando] = useState(false);

  function confirmarLimpezaPendencias() {
    Alert.alert(
      'Limpar pendências',
      'Isso apaga TODAS as pendências (os checkboxes) e os lembretes de vencimento agendados. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: executarLimpezaPendencias },
      ],
    );
  }

  async function executarLimpezaPendencias() {
    setLimpandoPendencias(true);
    try {
      await limparPendencias();
      Alert.alert('Pronto', 'As pendências foram apagadas.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível limpar as pendências.');
    } finally {
      setLimpandoPendencias(false);
    }
  }

  function confirmarLimpeza() {
    Alert.alert(
      'Limpar dados',
      'Isso apaga a renda e o histórico de movimentações. As pendências (checkboxes) não são afetadas. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Manter histórico', onPress: () => confirmarLimpezaFinal(false) },
        { text: 'Remover tudo', style: 'destructive', onPress: () => confirmarLimpezaFinal(true) },
      ],
    );
  }

  function confirmarLimpezaFinal(limparHistoricoSaldo) {
    Alert.alert('Confirmar limpeza', 'Essa aÃ§Ã£o nÃ£o pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar dados', style: 'destructive', onPress: () => executarLimpeza(limparHistoricoSaldo) },
    ]);
  }

  async function executarLimpeza(limparHistoricoSaldo) {
    setLimpando(true);
    try {
      await limparDados({ limparHistoricoSaldo });
      Alert.alert('Pronto', 'Os dados foram limpos.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível limpar os dados.');
    } finally {
      setLimpando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Configurações</Text>

      <TouchableOpacity
        style={[styles.limparButton, { opacity: limpandoPendencias ? 0.6 : 1, marginBottom: 14 }]}
        onPress={confirmarLimpezaPendencias}
        disabled={limpandoPendencias}
      >
        {limpandoPendencias ? (
          <ActivityIndicator color="#ff5252" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={18} color="#ff5252" />
            <Text style={styles.limparText}>LIMPAR PENDÊNCIAS</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.limparButton, { opacity: limpando ? 0.6 : 1 }]}
        onPress={confirmarLimpeza}
        disabled={limpando}
      >
        {limpando ? (
          <ActivityIndicator color="#ff5252" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={18} color="#ff5252" />
            <Text style={styles.limparText}>LIMPAR DADOS</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 18, paddingTop: 60 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', marginBottom: 30 },
  limparButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ff5252',
    paddingVertical: 15,
    borderRadius: 16,
  },
  limparText: { color: '#ff5252', fontWeight: '800', fontSize: 16 },
});
