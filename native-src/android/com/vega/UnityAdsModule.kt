package com.vega

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.UiThreadUtil
import com.unity3d.ads.InitializationConfiguration
import com.unity3d.ads.InitializationListener
import com.unity3d.ads.InterstitialAd
import com.unity3d.ads.InterstitialLoadListener
import com.unity3d.ads.InterstitialShowListener
import com.unity3d.ads.LoadConfiguration
import com.unity3d.ads.RewardedAd
import com.unity3d.ads.RewardedLoadListener
import com.unity3d.ads.RewardedShowListener
import com.unity3d.ads.ShowConfiguration
import com.unity3d.ads.ShowFinishState
import com.unity3d.ads.UnityAds
import com.unity3d.ads.UnityAdsError

class UnityAdsModule(
    reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "VegaUnityAds"
        private const val GAME_ID = "800358312"
        private const val INTERSTITIAL_PLACEMENT = "Interstitial_Android"
        private const val REWARDED_PLACEMENT = "Rewarded_Android"
    }

    private var interstitialAd: InterstitialAd? = null
    private var rewardedAd: RewardedAd? = null
    private var initPromise: Promise? = null

    override fun getName(): String = "VegaUnityAds"

    @ReactMethod
    fun initialize(promise: Promise) {
        if (UnityAds.isInitialized) {
            preloadAds()
            promise.resolve(true)
            return
        }

        synchronized(this) {
            if (initPromise != null) {
                promise.resolve(false)
                return
            }
            initPromise = promise
        }

        UiThreadUtil.runOnUiThread {
            try {
                // Contextual/non-personalized mode until an explicit consent flow exists.
                UnityAds.setNonBehavioral(true)
                val config = InitializationConfiguration.Builder(GAME_ID)
                    .withTestMode(false)
                    .build()
                val listener = InitializationListener { error ->
                    synchronized(this) {
                        val pending = initPromise
                        initPromise = null
                        if (error == null) {
                            preloadAds()
                            pending?.resolve(true)
                        } else {
                            Log.e(TAG, "Initialization failed: ${error.message}")
                            pending?.resolve(false)
                        }
                    }
                }
                UnityAds.initialize(config, listener)
            } catch (error: Throwable) {
                synchronized(this) {
                    val pending = initPromise
                    initPromise = null
                    pending?.resolve(false)
                }
                Log.e(TAG, "Initialization exception", error)
            }
        }
    }

    @ReactMethod
    fun showInterstitial(promise: Promise) {
        UiThreadUtil.runOnUiThread {
            val ad = interstitialAd
            if (ad == null) {
                preloadInterstitial()
                promise.resolve(false)
                return@runOnUiThread
            }
            interstitialAd = null
            var settled = false
            val listener = object : InterstitialShowListener {
                override fun onStarted(unityAd: InterstitialAd) = Unit
                override fun onClicked(unityAd: InterstitialAd) = Unit
                override fun onCompleted(unityAd: InterstitialAd, state: ShowFinishState) {
                    if (!settled) {
                        settled = true
                        promise.resolve(true)
                    }
                    preloadInterstitial()
                }
                override fun onFailed(unityAd: InterstitialAd, error: UnityAdsError) {
                    Log.e(TAG, "Interstitial show failed: ${error.message}")
                    if (!settled) {
                        settled = true
                        promise.resolve(false)
                    }
                    preloadInterstitial()
                }
            }
            try {
                ad.show(ShowConfiguration.Builder().build(), listener)
            } catch (error: Throwable) {
                Log.e(TAG, "Interstitial show exception", error)
                if (!settled) promise.resolve(false)
                preloadInterstitial()
            }
        }
    }

    @ReactMethod
    fun showRewarded(promise: Promise) {
        UiThreadUtil.runOnUiThread {
            val ad = rewardedAd
            if (ad == null) {
                preloadRewarded()
                promise.resolve(false)
                return@runOnUiThread
            }
            rewardedAd = null
            var rewarded = false
            var settled = false
            val listener = object : RewardedShowListener {
                override fun onStarted(unityAd: RewardedAd) = Unit
                override fun onClicked(unityAd: RewardedAd) = Unit
                override fun onRewarded(unityAd: RewardedAd) { rewarded = true }
                override fun onCompleted(unityAd: RewardedAd, state: ShowFinishState) {
                    if (!settled) {
                        settled = true
                        promise.resolve(rewarded && state == ShowFinishState.COMPLETED)
                    }
                    preloadRewarded()
                }
                override fun onFailed(unityAd: RewardedAd, error: UnityAdsError) {
                    Log.e(TAG, "Rewarded show failed: ${error.message}")
                    if (!settled) {
                        settled = true
                        promise.resolve(false)
                    }
                    preloadRewarded()
                }
            }
            try {
                ad.show(
                    ShowConfiguration.Builder().withCustomRewardString("vega_rewarded").build(),
                    listener,
                )
            } catch (error: Throwable) {
                Log.e(TAG, "Rewarded show exception", error)
                if (!settled) promise.resolve(false)
                preloadRewarded()
            }
        }
    }

    @ReactMethod
    fun isInterstitialReady(promise: Promise) { promise.resolve(interstitialAd != null) }

    @ReactMethod
    fun isRewardedReady(promise: Promise) { promise.resolve(rewardedAd != null) }

    private fun preloadAds() {
        UiThreadUtil.runOnUiThread {
            preloadInterstitial()
            preloadRewarded()
        }
    }

    private fun preloadInterstitial() {
        if (!UnityAds.isInitialized || interstitialAd != null) return
        val config = LoadConfiguration.Builder(INTERSTITIAL_PLACEMENT).build()
        InterstitialAd.load(config, object : InterstitialLoadListener {
            override fun onInterstitialLoaded(ad: InterstitialAd?, error: UnityAdsError?) {
                if (ad != null) interstitialAd = ad
                else Log.w(TAG, "Interstitial load failed: ${error?.message}")
            }
        })
    }

    private fun preloadRewarded() {
        if (!UnityAds.isInitialized || rewardedAd != null) return
        val config = LoadConfiguration.Builder(REWARDED_PLACEMENT).build()
        RewardedAd.load(config, object : RewardedLoadListener {
            override fun onRewardedLoaded(ad: RewardedAd?, error: UnityAdsError?) {
                if (ad != null) rewardedAd = ad
                else Log.w(TAG, "Rewarded load failed: ${error?.message}")
            }
        })
    }

    override fun invalidate() {
        interstitialAd = null
        rewardedAd = null
        super.invalidate()
    }
}
