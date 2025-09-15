package com.NewRelic;


import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.view.ReactViewGroup;
import com.facebook.react.views.view.ReactViewManager;

public class SessionReplayReactNativeUnMaskViewManager extends ReactViewManager {

    @Override
    public String getName() {
        return "NRUnMaskComponentView";
    }

    @NonNull
    @Override
    public ReactViewGroup createViewInstance(@NonNull ThemedReactContext context) {
        ReactViewGroup viewGroup = super.createViewInstance(context);
        viewGroup.setTag(com.newrelic.agent.android.R.id.newrelic_privacy,"nr-unmask");
        return viewGroup;
    }
}