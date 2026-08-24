import React from 'react';
import {Platform, requireNativeComponent, StyleSheet, View} from 'react-native';

type Props = {enabled?: boolean};
const NativeUnityBanner = requireNativeComponent<Props>('VegaUnityBanner');

export default function UnityBannerAd() {
  if (Platform.OS !== 'android') return null;
  return (
    <View style={styles.container} pointerEvents="box-none">
      <NativeUnityBanner enabled style={styles.banner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {alignItems: 'center', minHeight: 50, width: '100%'},
  banner: {height: 50, width: '100%'},
});
