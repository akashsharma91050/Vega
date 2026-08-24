package com.vega

import android.util.Log
import android.view.Gravity
import android.widget.FrameLayout
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.unity3d.ads.BannerAd
import com.unity3d.ads.BannerLoadConfiguration
import com.unity3d.ads.BannerLoadListener
import com.unity3d.ads.BannerShowListener
import com.unity3d.ads.BannerSize
import com.unity3d.ads.UnityAds
import com.unity3d.ads.UnityAdsError

class UnityBannerViewManager : SimpleViewManager<FrameLayout>() {
    companion object {
        private const val TAG = "VegaUnityBanner"
        private const val VIEW_NAME = "VegaUnityBanner"
        private const val PLACEMENT = "Banner_Android"
        private const val LOADED_TAG = 0x7f0a0ad1
    }

    override fun getName(): String = VIEW_NAME

    override fun createViewInstance(reactContext: ThemedReactContext): FrameLayout =
        FrameLayout(reactContext).apply {
            minimumHeight = (50 * resources.displayMetrics.density).toInt()
            clipChildren = false
        }

    @ReactProp(name = "enabled", defaultBoolean = true)
    fun setEnabled(view: FrameLayout, enabled: Boolean) {
        if (enabled) load(view) else {
            view.removeAllViews()
            view.setTag(LOADED_TAG, false)
        }
    }

    override fun onAfterUpdateTransaction(view: FrameLayout) {
        super.onAfterUpdateTransaction(view)
        if (view.childCount == 0) load(view)
    }

    private fun load(container: FrameLayout) {
        if (container.getTag(LOADED_TAG) == true) return
        if (!UnityAds.isInitialized) {
            container.postDelayed({ load(container) }, 1000)
            return
        }
        container.setTag(LOADED_TAG, true)

        val config = BannerLoadConfiguration.Builder(PLACEMENT, BannerSize(320, 50))
            .withListener(object : BannerShowListener {
                override fun onBannerShown(bannerAd: BannerAd) = Unit
                override fun onBannerClicked(bannerAd: BannerAd) = Unit
                override fun onBannerFailedToShow(bannerAd: BannerAd, error: UnityAdsError) {
                    Log.w(TAG, "Banner show failed: ${error.message}")
                    container.post {
                        container.setTag(LOADED_TAG, false)
                        container.removeAllViews()
                    }
                }
            })
            .build()

        BannerAd.load(config, object : BannerLoadListener {
            override fun onBannerLoaded(ad: BannerAd?, error: UnityAdsError?) {
                container.post {
                    if (ad == null) {
                        Log.w(TAG, "Banner load failed: ${error?.message}")
                        container.setTag(LOADED_TAG, false)
                        return@post
                    }
                    val bannerView = ad.view
                    if (bannerView == null) {
                        container.setTag(LOADED_TAG, false)
                        return@post
                    }
                    container.removeAllViews()
                    container.addView(
                        bannerView,
                        FrameLayout.LayoutParams(
                            FrameLayout.LayoutParams.WRAP_CONTENT,
                            FrameLayout.LayoutParams.WRAP_CONTENT,
                        ).apply { gravity = Gravity.CENTER },
                    )
                }
            }
        })
    }
}
