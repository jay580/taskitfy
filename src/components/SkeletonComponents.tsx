import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../theme';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = RADIUS.sm, style }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[{ width, height, borderRadius, backgroundColor: COLORS.glassBackgroundLv2, overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.05)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function TaskCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.cardHeader}>
        <Skeleton width="60%" height={24} />
        <Skeleton width={40} height={20} borderRadius={10} />
      </View>
      <View style={styles.cardFooter}>
        <Skeleton width="30%" height={16} />
        <Skeleton width="40%" height={16} />
      </View>
    </View>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <View style={styles.profileHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl }}>
        <Skeleton width={84} height={84} borderRadius={42} />
        <View style={{ marginLeft: SPACING.lg, flex: 1, gap: 8 }}>
          <Skeleton width="70%" height={28} />
          <Skeleton width="40%" height={20} borderRadius={12} />
        </View>
      </View>
      <View style={styles.statsRow}>
        <Skeleton width="25%" height={40} />
        <Skeleton width="25%" height={40} />
        <Skeleton width="25%" height={40} />
      </View>
    </View>
  );
}

export function LeaderboardItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <Skeleton width={36} height={20} />
      <Skeleton width={44} height={44} borderRadius={22} style={{ marginHorizontal: SPACING.md }} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="60%" height={18} />
        <Skeleton width="40%" height={14} />
      </View>
      <Skeleton width={50} height={28} borderRadius={RADIUS.sm} />
    </View>
  );
}

export function SubmissionCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <View style={{ flexDirection: 'row', gap: SPACING.md, alignItems: 'center' }}>
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="80%" height={20} />
          <Skeleton width="40%" height={16} />
        </View>
        <Skeleton width={60} height={30} borderRadius={RADIUS.sm} />
      </View>
    </View>
  );
}

export function HomeSkeleton() {
  return (
    <View style={{ flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.md }}>
        <Skeleton width={36} height={36} borderRadius={18} />
        <Skeleton width={150} height={24} style={{ marginLeft: 12 }} />
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl }}>
        <Skeleton width={50} height={50} borderRadius={25} />
        <View style={{ marginLeft: SPACING.md, gap: 8 }}>
          <Skeleton width={80} height={14} />
          <Skeleton width={180} height={24} />
        </View>
      </View>

      <Skeleton width="100%" height={90} borderRadius={RADIUS.lg} style={{ marginBottom: SPACING.xl }} />

      <Skeleton width={140} height={20} style={{ marginBottom: SPACING.md }} />
      <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl }}>
        <Skeleton width={280} height={160} borderRadius={RADIUS.xl} />
        <Skeleton width={280} height={160} borderRadius={RADIUS.xl} />
      </View>
    </View>
  );
}

export function TasksSkeleton() {
  return (
    <View style={{ flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl }}>
      <Skeleton width={120} height={36} style={{ marginBottom: SPACING.lg }} />
      <Skeleton width="100%" height={40} borderRadius={RADIUS.lg} style={{ marginBottom: SPACING.xl }} />
      <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg }}>
        <Skeleton width={80} height={36} borderRadius={18} />
        <Skeleton width={100} height={36} borderRadius={18} />
        <Skeleton width={90} height={36} borderRadius={18} />
      </View>
      <TaskCardSkeleton />
      <TaskCardSkeleton />
      <TaskCardSkeleton />
      <TaskCardSkeleton />
    </View>
  );
}

export function LeaderboardScreenSkeleton() {
  return (
    <View style={{ flex: 1, paddingTop: SPACING.xl }}>
      <View style={{ paddingHorizontal: SPACING.lg }}>
        <Skeleton width={200} height={36} style={{ marginBottom: SPACING.lg }} />
        <Skeleton width="100%" height={40} borderRadius={RADIUS.lg} style={{ marginBottom: SPACING.xl }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: 210, width: '100%', paddingHorizontal: SPACING.lg }}>
        <Skeleton width="30%" height={140} borderRadius={RADIUS.lg} style={{ marginHorizontal: '1%' }} />
        <Skeleton width="30%" height={180} borderRadius={RADIUS.lg} style={{ marginHorizontal: '1%' }} />
        <Skeleton width="30%" height={120} borderRadius={RADIUS.lg} style={{ marginHorizontal: '1%' }} />
      </View>
      <View style={{ flex: 1, backgroundColor: 'rgba(11, 17, 33, 0.4)', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, gap: SPACING.md, marginTop: 20 }}>
        <LeaderboardItemSkeleton />
        <LeaderboardItemSkeleton />
        <LeaderboardItemSkeleton />
        <LeaderboardItemSkeleton />
      </View>
    </View>
  );
}

export function ProfileScreenSkeleton() {
  return (
    <View style={{ flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl }}>
      <Skeleton width={150} height={36} style={{ marginBottom: SPACING.xl }} />
      <ProfileHeaderSkeleton />
      
      <Skeleton width={100} height={16} style={{ marginBottom: SPACING.md, marginLeft: SPACING.md }} />
      <View style={{ borderRadius: RADIUS.xl, backgroundColor: COLORS.glassBackgroundLv1, borderWidth: 1, borderColor: COLORS.glassBorder, padding: SPACING.lg, marginBottom: SPACING.xl }}>
        <Skeleton width="100%" height={24} style={{ marginBottom: SPACING.md }} />
        <Skeleton width="100%" height={24} style={{ marginBottom: SPACING.md }} />
        <Skeleton width="100%" height={24} />
      </View>

      <Skeleton width={80} height={16} style={{ marginBottom: SPACING.md, marginLeft: SPACING.md }} />
      <View style={{ borderRadius: RADIUS.xl, backgroundColor: COLORS.glassBackgroundLv1, borderWidth: 1, borderColor: COLORS.glassBorder, padding: SPACING.lg, marginBottom: SPACING.xl }}>
        <Skeleton width="100%" height={24} style={{ marginBottom: SPACING.md }} />
        <Skeleton width="100%" height={24} />
      </View>
    </View>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <View style={{ flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl }}>
      <Skeleton width={200} height={36} style={{ marginBottom: SPACING.md }} />
      <Skeleton width={120} height={16} style={{ marginBottom: SPACING.xl }} />

      <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl }}>
        <Skeleton width="48%" height={100} borderRadius={RADIUS.lg} />
        <Skeleton width="48%" height={100} borderRadius={RADIUS.lg} />
      </View>

      <Skeleton width={150} height={20} style={{ marginBottom: SPACING.md }} />
      
      <View style={{ borderRadius: RADIUS.xl, backgroundColor: COLORS.glassBackgroundLv1, borderWidth: 1, borderColor: COLORS.glassBorder, padding: SPACING.md, gap: SPACING.md }}>
        <Skeleton width="100%" height={60} borderRadius={RADIUS.md} />
        <Skeleton width="100%" height={60} borderRadius={RADIUS.md} />
        <Skeleton width="100%" height={60} borderRadius={RADIUS.md} />
        <Skeleton width="100%" height={60} borderRadius={RADIUS.md} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.glassBackgroundLv1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  profileHeader: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.glassBackgroundLv1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBackgroundLv3,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
});
