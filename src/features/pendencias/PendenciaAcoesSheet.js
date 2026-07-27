import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../../components/BottomSheet';
import { colors } from '../../theme/colors';

// Sheet de ações ao segurar um registro: editar (só quando o preço não é fixo) e
// excluir (sempre disponível). Preço fixo representa um valor combinado que não deve
// ser alterado por aqui — só removido.
export function PendenciaAcoesSheet({ open, item, onClose, onClosed, onEditar, onExcluir }) {
  // Guarda o último item recebido: o pai zera `item` no mesmo instante em que fecha a
  // sheet, e sem isso o `if (!item) return null` desmontava o Modal na hora, cortando a
  // animação de saída.
  const [itemExibido, setItemExibido] = useState(item);

  useEffect(() => {
    if (open && item) setItemExibido(item);
  }, [open, item]);

  if (!itemExibido) return null;

  const podeEditar = !itemExibido.precoFixo;

  return (
    <BottomSheet open={open} onClose={onClose} onClosed={onClosed} maxHeight="50%">
      <View style={styles.wrap}>
        <Text style={styles.titulo} numberOfLines={1}>
          {itemExibido.nome}
        </Text>

        {podeEditar ? (
          <Pressable style={styles.opcao} onPress={() => onEditar(itemExibido)}>
            <View style={styles.opcaoIcon}>
              <Ionicons name="pencil-outline" size={20} color={colors.accent} />
            </View>
            <Text style={styles.opcaoLabel}>Editar</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ) : (
          <Text style={styles.aviso}>Preço fixo não pode ser editado, só excluído.</Text>
        )}

        <Pressable style={styles.opcao} onPress={() => onExcluir(itemExibido)}>
          <View style={[styles.opcaoIcon, styles.opcaoIconPerigo]}>
            <Ionicons name="trash-outline" size={20} color="#ff5252" />
          </View>
          <Text style={[styles.opcaoLabel, styles.opcaoLabelPerigo]}>Excluir</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 4, paddingBottom: 8 },
  titulo: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  aviso: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: 4, marginBottom: 8 },
  opcao: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  opcaoIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,122,0,0.12)',
  },
  opcaoIconPerigo: { backgroundColor: 'rgba(255,82,82,0.12)' },
  opcaoLabel: { flex: 1, color: colors.text, fontSize: 15.5, fontWeight: '600' },
  opcaoLabelPerigo: { color: '#ff5252' },
});
