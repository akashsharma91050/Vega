import {NativeModules, Platform} from 'react-native';

type UnityAdsNativeModule = {
  initialize: () => Promise<boolean>;
  showInterstitial: () => Promise<boolean>;
  showRewarded: () => Promise<boolean>;
  isInterstitialReady: () => Promise<boolean>;
  isRewardedReady: () => Promise<boolean>;
};

const nativeAds = NativeModules.VegaUnityAds as UnityAdsNativeModule | undefined;
let initializationPromise: Promise<boolean> | null = null;
let lastInterstitialAt = 0;
const INTERSTITIAL_COOLDOWN_MS = 120_000;

export function initializeUnityAds(): Promise<boolean> {
  if (Platform.OS !== 'android' || !nativeAds) return Promise.resolve(false);
  if (!initializationPromise) {
    initializationPromise = nativeAds.initialize().catch(error => {
      console.warn('[UnityAds] Initialization failed:', error);
      return false;
    });
  }
  return initializationPromise;
}

export async function maybeShowInterstitial(): Promise<boolean> {
  if (Platform.OS !== 'android' || !nativeAds) return false;
  const now = Date.now();
  if (now - lastInterstitialAt < INTERSTITIAL_COOLDOWN_MS) return false;
  const ready = await nativeAds.isInterstitialReady().catch(() => false);
  if (!ready) return false;
  const shown = await nativeAds.showInterstitial().catch(error => {
    console.warn('[UnityAds] Interstitial failed:', error);
    return false;
  });
  if (shown) lastInterstitialAt = now;
  return shown;
}

export async function showRewardedAd(): Promise<boolean> {
  if (Platform.OS !== 'android' || !nativeAds) return false;
  const ready = await nativeAds.isRewardedReady().catch(() => false);
  if (!ready) return false;
  return nativeAds.showRewarded().catch(error => {
    console.warn('[UnityAds] Rewarded failed:', error);
    return false;
  });
}
