import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// Modal que desliza de baixo pra cima ("arrasta pra cima"): puxador no topo, fundo
// escurecido que fecha ao tocar, e arrastar o puxador pra baixo também fecha.
const DISMISS_OFFSET = 100;
const DISMISS_VELOCITY = 0.75;
const OFF_SCREEN = 480;

export function BottomSheet({ open, onClose, onClosed, children, maxHeight = '86%' }) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(open);
  const translateY = useRef(new Animated.Value(OFF_SCREEN)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const dragStartY = useRef(0);

  const runOpen = useCallback(() => {
    translateY.setValue(OFF_SCREEN);
    fade.setValue(0);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
    ]).start();
  }, [fade, translateY]);

  const runClose = useCallback(
    (notifyParent) => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: OFF_SCREEN, duration: 260, useNativeDriver: true }),
      ]).start(() => {
        setVisible(false);
        translateY.setValue(OFF_SCREEN);
        fade.setValue(0);
        if (notifyParent) onClose();
        // Dispara sempre que o Modal termina de sumir de verdade (não só quando o
        // fechamento veio do próprio sheet) — é o sinal certo pra quem precisa abrir
        // outro Modal em seguida sem os dois se sobrepondo em transição.
        onClosed?.();
      });
    },
    [fade, onClose, onClosed, translateY],
  );

  const dismiss = useCallback(() => runClose(true), [runClose]);

  // Controlado na mão em vez de KeyboardAvoidingView: dentro de um Modal, o
  // KeyboardAvoidingView calcula a própria altura errado (janela nativa separada da
  // tela principal) e o painel some por inteiro assim que o teclado abre.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    if (open) {
      setVisible(true);
      runOpen();
    } else if (visibleRef.current) {
      runClose(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderGrant: () => {
        translateY.stopAnimation((value) => {
          dragStartY.current = value;
        });
      },
      onPanResponderMove: (_, gesture) => {
        const next = Math.max(0, dragStartY.current + gesture.dy);
        translateY.setValue(next);
        fade.setValue(1 - Math.min(next / OFF_SCREEN, 1));
      },
      onPanResponderRelease: (_, gesture) => {
        const current = Math.max(0, dragStartY.current + gesture.dy);
        if (current > DISMISS_OFFSET || gesture.vy > DISMISS_VELOCITY) {
          dismiss();
          return;
        }
        Animated.parallel([
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
          Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: true }),
        ]).start();
      },
    }),
  ).current;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <View style={styles.wrap} pointerEvents="box-none">
        <Animated.View style={[styles.backdrop, { opacity: fade }]} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              maxHeight,
              transform: [{ translateY }],
              marginBottom: keyboardHeight,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <View style={styles.handleWrap} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  panel: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handleWrap: { alignItems: 'center', paddingVertical: 11, paddingHorizontal: 40 },
  handle: { width: 40, height: 5, borderRadius: 9, backgroundColor: colors.cardBorder },
});
