package com.xaoxay.truco;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TrucoUpdatesPlugin.class);
        registerPlugin(TrucoHapticsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
