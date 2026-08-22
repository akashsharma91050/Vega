import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

/**
 * Unity Ads (LevelPlay) integration.
 *
 * Backed by native-src/android/com/vega/UnityAdsModule.kt, wired up in
 * plugins/with-custom-native-modules.js. iOS is not implemented — calls
 * resolve to no-ops on iOS so the rest of the app doesn't need to branch.
 *
 * Game ID and placement IDs come from the Unity Dashboard for this app.
 */

// Unity Game ID for this app (Android). Replace if you regenerate the app
// in the Unity Dashboard or add a separate iOS Game ID later.
export const UNITY_ADS_GAME_ID = '800358312';

// Set to true only while testing — Unity serves test creatives and does
// NOT pay out real revenue when this is on. Must be false for production
// / Play Store builds.
export const UNITY_ADS_TEST_MODE = __DEV__;

export const UNITY_AD_PLACEMENTS = {
  interstitial: 'Interstitial_Android',
  rewarded: 'Rewarded_Android',
};

const {UnityAdsModule} = NativeModules;
const emitter =
  Platform.OS === 'android' && UnityAdsModule
    ? new NativeEventEmitter(UnityAdsModule)
    : null;

let initPromise: Promise<boolean> | null = null;

const isSupported = Platform.OS === 'android' && !!UnityAdsModule;

/** Initializes the Unity Ads SDK once per app session. Safe to call repeatedly. */
export function initUnityAds(): Promise<boolean> {
  if (!isSupported) {
    return Promise.resolve(false);
  }
  if (!initPromise) {
    initPromise = UnityAdsModule.initialize(
      UNITY_ADS_GAME_ID,
      UNITY_ADS_TEST_MODE,
    ).catch((err: unknown) => {
      console.warn('[UnityAds] initialize failed', err);
      initPromise = null;
      return false;
    });
  }
  return initPromise;
}

async function loadAndShow(
  placementId: string,
  load: (id: string) => Promise<unknown>,
  show: (id: string) => Promise<unknown>,
): Promise<boolean> {
  if (!isSupported) {
    return false;
  }
  try {
    await initUnityAds();
    await load(placementId);
    await show(placementId);
    return true;
  } catch (err) {
    console.warn(`[UnityAds] ad flow failed for ${placementId}`, err);
    return false;
  }
}

/** Loads and shows an interstitial. Resolves true if the ad actually played. */
export function showInterstitial(
  placementId: string = UNITY_AD_PLACEMENTS.interstitial,
): Promise<boolean> {
  return loadAndShow(
    placementId,
    id => UnityAdsModule.loadInterstitial(id),
    id => UnityAdsModule.showInterstitial(id),
  );
}

/** Loads and shows a rewarded video. Resolves true if it played to completion. */
export async function showRewarded(
  placementId: string = UNITY_AD_PLACEMENTS.rewarded,
): Promise<boolean> {
  if (!isSupported) {
    return false;
  }
  try {
    await initUnityAds();
    await UnityAdsModule.loadRewarded(placementId);
    const state = await UnityAdsModule.showRewarded(placementId);
    return state === 'COMPLETED';
  } catch (err) {
    console.warn('[UnityAds] rewarded flow failed', err);
    return false;
  }
}

export function addUnityAdsListener(
  event:
    | 'unityAdsInterstitialShowStart'
    | 'unityAdsInterstitialClosed'
    | 'unityAdsInterstitialLoadFailed'
    | 'unityAdsInterstitialShowFailed'
    | 'unityAdsRewardedShowStart'
    | 'unityAdsRewardedClosed'
    | 'unityAdsRewardedLoadFailed'
    | 'unityAdsRewardedShowFailed',
  handler: (payload: any) => void,
) {
  return emitter?.addListener(event, handler) ?? {remove: () => {}};
}
