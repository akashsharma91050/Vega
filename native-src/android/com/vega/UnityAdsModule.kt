package com.vega

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.unity3d.ads.IUnityAdsInitializationListener
import com.unity3d.ads.IUnityAdsLoadListener
import com.unity3d.ads.IUnityAdsShowListener
import com.unity3d.ads.UnityAds
import com.unity3d.ads.UnityAdsShowOptions

/**
 * Bridges the Unity Ads (LevelPlay) Android SDK to React Native.
 *
 * Usage from JS (see src/lib/ads/unityAds.ts):
 *   initialize(gameId, testMode)
 *   loadInterstitial(placementId) / showInterstitial(placementId)
 *   loadRewarded(placementId) / showRewarded(placementId)
 */
class UnityAdsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var isInitialized = false

    override fun getName(): String = "UnityAdsModule"

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun initialize(gameId: String, testMode: Boolean, promise: Promise) {
        if (isInitialized) {
            promise.resolve(true)
            return
        }
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No current activity available to initialize Unity Ads")
            return
        }
        UnityAds.initialize(
            activity.applicationContext,
            gameId,
            testMode,
            object : IUnityAdsInitializationListener {
                override fun onInitializationComplete() {
                    isInitialized = true
                    promise.resolve(true)
                }

                override fun onInitializationFailed(
                    error: UnityAds.UnityAdsInitializationError?,
                    message: String?,
                ) {
                    promise.reject(error?.name ?: "INIT_FAILED", message)
                }
            },
        )
    }

    @ReactMethod
    fun isInitialized(promise: Promise) {
        promise.resolve(isInitialized)
    }

    private fun load(placementId: String, eventPrefix: String, promise: Promise) {
        UnityAds.load(
            placementId,
            object : IUnityAdsLoadListener {
                override fun onUnityAdsAdLoaded(placementId: String?) {
                    promise.resolve(true)
                }

                override fun onUnityAdsFailedToLoad(
                    placementId: String?,
                    error: UnityAds.UnityAdsLoadError?,
                    message: String?,
                ) {
                    val params = Arguments.createMap()
                    params.putString("placementId", placementId)
                    params.putString("error", error?.name)
                    params.putString("message", message)
                    sendEvent("${eventPrefix}LoadFailed", params)
                    promise.reject(error?.name ?: "LOAD_FAILED", message)
                }
            },
        )
    }

    private fun show(placementId: String, eventPrefix: String, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No current activity available to show ad")
            return
        }
        UnityAds.show(
            activity,
            placementId,
            UnityAdsShowOptions(),
            object : IUnityAdsShowListener {
                override fun onUnityAdsShowFailure(
                    placementId: String?,
                    error: UnityAds.UnityAdsShowError?,
                    message: String?,
                ) {
                    val params = Arguments.createMap()
                    params.putString("placementId", placementId)
                    params.putString("error", error?.name)
                    params.putString("message", message)
                    sendEvent("${eventPrefix}ShowFailed", params)
                    promise.reject(error?.name ?: "SHOW_FAILED", message)
                }

                override fun onUnityAdsShowStart(placementId: String?) {
                    val params = Arguments.createMap()
                    params.putString("placementId", placementId)
                    sendEvent("${eventPrefix}ShowStart", params)
                }

                override fun onUnityAdsShowClick(placementId: String?) {
                    val params = Arguments.createMap()
                    params.putString("placementId", placementId)
                    sendEvent("${eventPrefix}Clicked", params)
                }

                override fun onUnityAdsShowComplete(
                    placementId: String?,
                    state: UnityAds.UnityAdsShowCompletionState?,
                ) {
                    val params = Arguments.createMap()
                    params.putString("placementId", placementId)
                    params.putString("state", state?.name)
                    sendEvent("${eventPrefix}Closed", params)
                    promise.resolve(state?.name ?: "COMPLETED")
                }
            },
        )
    }

    @ReactMethod
    fun loadInterstitial(placementId: String, promise: Promise) {
        load(placementId, "unityAdsInterstitial", promise)
    }

    @ReactMethod
    fun showInterstitial(placementId: String, promise: Promise) {
        show(placementId, "unityAdsInterstitial", promise)
    }

    @ReactMethod
    fun loadRewarded(placementId: String, promise: Promise) {
        load(placementId, "unityAdsRewarded", promise)
    }

    @ReactMethod
    fun showRewarded(placementId: String, promise: Promise) {
        show(placementId, "unityAdsRewarded", promise)
    }

    // Required for RN's built-in EventEmitter (NativeEventEmitter) contract on Android.
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}
