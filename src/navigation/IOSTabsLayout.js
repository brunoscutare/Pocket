import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { colors } from '../theme/colors';

export function IOSTabsLayout() {
  const tabContentStyle = { backgroundColor: colors.bg };

  return (
    <NativeTabs
      tintColor={colors.accent}
      backgroundColor={colors.bg}
      minimizeBehavior="automatic"
      blurEffect="systemChromeMaterialDark"
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="index" contentStyle={tabContentStyle}>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pendencias" contentStyle={tabContentStyle}>
        <NativeTabs.Trigger.Icon sf={{ default: 'clock', selected: 'clock.fill' }} />
        <NativeTabs.Trigger.Label>Pendências</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="movimentacoes" contentStyle={tabContentStyle}>
        <NativeTabs.Trigger.Icon sf={{ default: 'arrow.left.arrow.right', selected: 'arrow.left.arrow.right.circle.fill' }} />
        <NativeTabs.Trigger.Label>Movimentações</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="configuracoes" contentStyle={tabContentStyle}>
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
        <NativeTabs.Trigger.Label>Configurações</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
