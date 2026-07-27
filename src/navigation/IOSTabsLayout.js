import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { colors } from '../theme/colors';

export function IOSTabsLayout() {
  return (
    <NativeTabs tintColor={colors.accent} minimizeBehavior="automatic" blurEffect="systemChromeMaterialDark">
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Início</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pendencias">
        <Icon sf={{ default: 'clock', selected: 'clock.fill' }} />
        <Label>Pendências</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="movimentacoes">
        <Icon sf={{ default: 'arrow.left.arrow.right', selected: 'arrow.left.arrow.right.circle.fill' }} />
        <Label>Movimentações</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="configuracoes">
        <Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
        <Label>Configurações</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
