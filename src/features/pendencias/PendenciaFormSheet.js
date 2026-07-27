import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../../components/BottomSheet';
import { Checkbox } from '../../components/Checkbox';
import { Select } from '../../components/Select';
import { TIPOS_GASTO } from '../../constants/tiposGasto';
import { colors } from '../../theme/colors';
import { atualizarPendencia, criarPendencia } from '../../services/pendenciasService';
import { maskMoeda, moedaParaNumero, numeroParaMoeda } from '../../utils/moeda';

// Mesmo padrão do ObjetoFormSheet (domuns-app): sheet de baixo pra cima com um
// formulário simples — nome, preço e um checkbox pra marcar se o preço é fixo.
// `item`: null (modo criação) ou a pendência sendo editada.
export function PendenciaFormSheet({ open, item, onClose, onSaved }) {
  const isEdit = !!item;
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [precoFixo, setPrecoFixo] = useState(false);
  const [tipo, setTipo] = useState(null);
  const [diaVencimento, setDiaVencimento] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (open) {
      setNome(isEdit ? item.nome : '');
      setPreco(isEdit && item.preco != null ? numeroParaMoeda(item.preco) : '');
      setPrecoFixo(isEdit ? item.precoFixo : false);
      setTipo(isEdit ? item.tipo ?? null : null);
      setDiaVencimento(isEdit && item.diaVencimento != null ? String(item.diaVencimento) : '');
      setErro(null);
      setSalvando(false);
    }
  }, [open, item, isEdit]);

  async function salvar() {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErro('Informe o nome.');
      return;
    }

    const precoNumero = moedaParaNumero(preco);
    const diaNumero = diaVencimento.trim() ? Math.min(31, Math.max(1, Number(diaVencimento))) : null;

    setSalvando(true);
    setErro(null);
    try {
      if (isEdit) {
        await atualizarPendencia(item.id, { nome: nomeLimpo, preco: precoNumero, precoFixo, tipo, diaVencimento: diaNumero });
      } else {
        await criarPendencia({ nome: nomeLimpo, preco: precoNumero, precoFixo, tipo, diaVencimento: diaNumero });
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
    <BottomSheet open={open} onClose={onClose} maxHeight="70%">
      <View style={styles.wrap}>
        <Pressable onPress={onClose} style={styles.close}>
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </Pressable>

        <Text style={styles.title}>{isEdit ? 'Editar pendência' : 'Nova pendência'}</Text>
        <Text style={styles.subtitle}>Adicione um item com nome e, se quiser, um preço.</Text>

        <View style={styles.fields}>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Ex.: Cartão de crédito"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Preço</Text>
            <TextInput
              value={preco}
              onChangeText={(texto) => setPreco(maskMoeda(texto))}
              placeholder="R$ 0,00"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Dia do vencimento</Text>
            <TextInput
              value={diaVencimento}
              onChangeText={(texto) => setDiaVencimento(texto.replace(/\D/g, '').slice(0, 2))}
              placeholder="Ex.: 10"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>

          <Select
            label="Tipo de gasto"
            value={tipo}
            options={TIPOS_GASTO}
            onChange={setTipo}
            placeholder="Selecione o tipo"
          />

          <Pressable style={styles.checkboxRow} onPress={() => setPrecoFixo((v) => !v)}>
            <Checkbox checked={precoFixo} onToggle={() => setPrecoFixo((v) => !v)} />
            <Text style={styles.checkboxLabel}>O preço é fixo</Text>
          </Pressable>
        </View>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Pressable
          onPress={salvar}
          disabled={salvando || !nome.trim()}
          style={[styles.botao, { opacity: salvando || !nome.trim() ? 0.6 : 1 }]}
        >
          <Text style={styles.botaoTexto}>{salvando ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}</Text>
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
