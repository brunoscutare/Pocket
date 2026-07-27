import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Lembretes de vencimento são notificações locais agendadas no próprio aparelho —
// não passam por servidor nenhum, condizente com o app ser 100% offline.
const DIAS_ANTECEDENCIA = 3;
const HORA_AVISO = 9;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function garantirPermissao() {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.status === 'granted') return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.status === 'granted';
}

export async function configurarCanalAndroid() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Vencimentos',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

// Próxima data (a partir de agora) em que o dia-do-mês informado ocorre, na hora fixa
// do aviso. Se o dia já passou nesse mês, agenda pro mês seguinte.
function proximaData(dia, hora = HORA_AVISO) {
  const agora = new Date();
  let data = new Date(agora.getFullYear(), agora.getMonth(), dia, hora, 0, 0, 0);
  if (data <= agora) {
    data = new Date(agora.getFullYear(), agora.getMonth() + 1, dia, hora, 0, 0, 0);
  }
  return data;
}

async function agendar(titulo, corpo, data) {
  if (data <= new Date()) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: corpo },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: data },
  });
}

async function cancelar(id) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (_e) {
    // Já não existe (foi disparada ou cancelada antes) — ignora.
  }
}

// Cancela os lembretes agendados anteriormente pra essa pendência e agenda os novos:
// um no dia do vencimento e outro `DIAS_ANTECEDENCIA` dias antes. Só agenda se ela tiver
// dia de vencimento e ainda não estiver paga.
export async function reagendarNotificacoes(pendencia) {
  await cancelar(pendencia.notifAvisoId);
  await cancelar(pendencia.notifDiaId);

  if (!pendencia.diaVencimento || pendencia.concluido) {
    return { notifAvisoId: null, notifDiaId: null };
  }

  const permitido = await garantirPermissao();
  if (!permitido) return { notifAvisoId: null, notifDiaId: null };

  const dataVencimento = proximaData(pendencia.diaVencimento);
  const dataAviso = new Date(dataVencimento);
  dataAviso.setDate(dataAviso.getDate() - DIAS_ANTECEDENCIA);

  const notifDiaId = await agendar(pendencia.nome, 'Vence hoje.', dataVencimento);
  const notifAvisoId = await agendar(
    pendencia.nome,
    `Vence em ${DIAS_ANTECEDENCIA} dias.`,
    dataAviso,
  );

  return { notifAvisoId, notifDiaId };
}

export async function cancelarNotificacoes(pendencia) {
  await cancelar(pendencia.notifAvisoId);
  await cancelar(pendencia.notifDiaId);
}

// Único lugar do app que agenda notificação local é o de vencimento de pendências —
// por isso cancelar TODAS de uma vez é seguro e bem mais rápido que buscar cada
// pendência e cancelar uma a uma.
export async function cancelarTodasNotificacoes() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (_e) {
    // Nada agendado — ignora.
  }
}
