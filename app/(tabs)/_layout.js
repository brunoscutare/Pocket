import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { TabBar } from '../../src/components/TabBar';
import { IOSTabsLayout } from '../../src/navigation/IOSTabsLayout';
import { colors } from '../../src/theme/colors';

function AndroidTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="pendencias" options={{ title: 'Pendências' }} />
      <Tabs.Screen name="movimentacoes" options={{ title: 'Movimentações' }} />
      <Tabs.Screen name="configuracoes" options={{ title: 'Configurações' }} />
    </Tabs>
  );
}

export default function TabsLayout() {
  if (Platform.OS === 'ios') {
    return <IOSTabsLayout />;
  }

  return <AndroidTabsLayout />;
}
