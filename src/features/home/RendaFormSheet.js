import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../../components/BottomSheet';
import { Checkbox } from '../../components/Checkbox';
import { colors } from '../../theme/colors';
import { adicionarRenda, registrarNovoSalario } from '../../services/rendaService';
import { maskMoeda, moedaParaNumero } from '../../utils/moeda';

// Mesmo padrão do formulário de pendências: sheet de baixo pra cima. Se "Novo salário?"
// estiver marcado, o valor substitui a renda total (novo ciclo) e reseta as pendências;
// senão, o valor só soma na renda existente.
export function RendaFormSheet({ open, onClose, onSaved, rendaAtual = 0 }) {
  const [valor, setValor] = useState('');
  const [novoSalario, setNovoSalario] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  // Com a renda zerada (primeiro uso ou depois de "Limpar dados") não existe nada pra
  // somar — a primeira "nova renda" é sempre tratada como novo salário, marcado ou não.
  const semRendaAtual = rendaAtual <= 0;

  useEffect(() => {
    if (open) {
      setValor('');
      setNovoSalario(false);
      setErro(null);
      setSalvando(false);
    }
  }, [open]);

  async function salvar() {
    const numero = moedaParaNumero(valor);
    if (!numero) {
      setErro('Informe um valor.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      if (novoSalario || semRendaAtual) {
        await registrarNovoSalario(numero);
      } else {
        await adicionarRenda(numero);
      }
      onSaved?.();
      onClose();
    } catch (e) {
      setErro('Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="60%">
      <View style={styles.wrap}>
        <Pressable onPress={onClose} style={styles.close}>
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </Pressable>

        <Text style={styles.title}>Nova renda</Text>
        <Text style={styles.subtitle}>
          Marque "Novo salário" quando for um ciclo novo — isso reinicia as pendências do mês.
        </Text>

        <View style={styles.fields}>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Valor</Text>
            <TextInput
              value={valor}
              onChangeText={(texto) => setValor(maskMoeda(texto))}
              placeholder="R$ 0,00"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>

          {semRendaAtual ? (
            <Text style={styles.avisoNovoSalario}>
              Não há renda cadastrada — isso será registrado como novo salário.
            </Text>
          ) : (
            <Pressable style={styles.checkboxRow} onPress={() => setNovoSalario((v) => !v)}>
              <Checkbox checked={novoSalario} onToggle={() => setNovoSalario((v) => !v)} />
              <Text style={styles.checkboxLabel}>Novo salário?</Text>
            </Pressable>
          )}
        </View>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Pressable
          onPress={salvar}
          disabled={salvando || !valor}
          style={[styles.botao, { opacity: salvando || !valor ? 0.6 : 1 }]}
        >
          <Text style={styles.botaoTexto}>{salvando ? 'Salvando...' : 'Adicionar'}</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 4, paddingBottom: 4, position: 'relative' },
  close: {
    position: 'absolute',
    top: 2,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    zIndex: 1,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', marginRight: 32 },
  subtitle: { color: colors.textMuted, fontSize: 13.5, lineHeight: 19, marginTop: 4, marginBottom: 16 },
  fields: { gap: 14 },
  fieldWrap: { gap: 6 },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    backgroundColor: colors.bg,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  checkboxLabel: { color: colors.text, fontSize: 15 },
  avisoNovoSalario: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  erro: { color: '#ff5252', fontSize: 13, fontWeight: '600', marginTop: 12 },
  botao: {
    marginTop: 22,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  botaoTexto: { color: '#000', fontSize: 15.5, fontWeight: '800' },
});
