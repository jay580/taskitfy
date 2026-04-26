import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}

export default function FadeInView({ children, delay = 0, style }: FadeInViewProps) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }, style]}>
      {children}
    </Animated.View>
  );
}
