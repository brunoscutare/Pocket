import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { colors } from '../theme/colors';

// Mesmo padrão do SelectField do domuns-app: campo que abre uma BottomSheet própria
// com busca e lista de opções (chek na selecionada), fechando ao escolher.
export function Select({ label, value, options, onChange, placeholder = 'Selecionar', searchPlaceholder = 'Buscar...' }) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, busca]);

  const close = useCallback(() => {
    setOpen(false);
    setBusca('');
  }, []);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={[styles.valor, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <BottomSheet open={open} onClose={close} maxHeight="80%">
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitulo}>{label || placeholder}</Text>

          <View style={styles.searchField}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.lista}>
            {filtradas.length === 0 ? (
              <Text style={styles.vazio}>Nenhuma opção encontrada.</Text>
            ) : (
              filtradas.map((opcao) => {
                const ativo = opcao === value;
                return (
                  <Pressable
                    key={opcao}
                    onPress={() => {
                      onChange(opcao);
                      close();
                    }}
                    style={[styles.opcao, ativo && styles.opcaoAtiva]}
                  >
                    <Text style={[styles.opcaoTexto, ativo && styles.opcaoTextoAtivo]} numberOfLines={1}>
                      {opcao}
                    </Text>
                    {ativo ? <Ionicons name="checkmark" size={18} color={colors.accent} /> : null}
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    backgroundColor: colors.bg,
  },
  valor: { color: colors.text, fontSize: 16, flex: 1, marginRight: 8 },
  placeholder: { color: colors.textMuted },
  sheetWrap: { paddingTop: 4, paddingBottom: 8, gap: 12 },
  sheetTitulo: { color: colors.text, fontSize: 20, fontWeight: '800' },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    backgroundColor: colors.bg,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, padding: 0 },
  lista: { gap: 2, marginTop: 4 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  opcaoAtiva: { backgroundColor: 'rgba(255,122,0,0.12)' },
  opcaoTexto: { color: colors.text, fontSize: 15.5, fontWeight: '600', flex: 1, marginRight: 8 },
  opcaoTextoAtivo: { color: colors.accent },
  vazio: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
});
