import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { colors } from '../../theme/colors';
import { listarPendencias } from '../../services/pendenciasService';

// Não existe servidor nem tabela de notificações — a lista é montada na hora, a partir
// do dia de vencimento já cadastrado em cada pendência ainda não paga.
function statusPendencia(diaVencimento) {
  const hoje = new Date().getDate();
  const diff = diaVencimento - hoje;
  if (diff === 0) return { texto: 'Vence hoje', urgente: true, ordem: diff };
  if (diff < 0) return { texto: `Venceu há ${-diff} dia${-diff === 1 ? '' : 's'}`, urgente: true, ordem: diff };
  return { texto: `Vence em ${diff} dia${diff === 1 ? '' : 's'}`, urgente: false, ordem: diff };
}

export function NotificacoesSheet({ open, onClose }) {
  const [pendencias, setPendencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      listarPendencias()
        .then(setPendencias)
        .finally(() => setLoading(false));
    }
  }, [open]);

  const notificacoes = useMemo(() => {
    return pendencias
      .filter((p) => p.diaVencimento != null && !p.concluido)
      .map((p) => ({ ...p, status: statusPendencia(p.diaVencimento) }))
      .sort((a, b) => a.status.ordem - b.status.ordem);
  }, [pendencias]);

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="70%">
      <View style={styles.wrap}>
        <Text style={styles.title}>Notificações</Text>

        {loading ? (
          <View style={styles.estado}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : notificacoes.length === 0 ? (
          <Text style={styles.vazio}>Nenhum vencimento pendente no momento.</Text>
        ) : (
          <View style={styles.list}>
            {notificacoes.map((item) => (
              <View key={item.id} style={[styles.item, item.status.urgente ? styles.itemUrgente : null]}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.nome}
                </Text>
                <Text style={[styles.itemStatus, item.status.urgente ? styles.itemStatusUrgente : null]}>
                  {item.status.texto}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 4, paddingBottom: 10 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 16 },
  estado: { paddingVertical: 30, alignItems: 'center' },
  vazio: { color: colors.textMuted, fontSize: 14.5, lineHeight: 20, textAlign: 'center', paddingVertical: 30 },
  list: { gap: 10 },
  item: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  itemUrgente: { borderColor: '#ff5252' },
  itemTitle: { color: colors.text, fontSize: 15.5, fontWeight: '700' },
  itemStatus: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  itemStatusUrgente: { color: '#ff5252', fontWeight: '600' },
});
