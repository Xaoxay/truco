package com.xaoxay.truco;

import android.content.Context;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.os.VibrationEffect;
import android.os.VibrationAttributes;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TrucoHaptics")
public class TrucoHapticsPlugin extends Plugin {
    @PluginMethod
    public void vibrate(PluginCall call) {
        VibratorManager manager = (VibratorManager) getContext().getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
        Vibrator vibrator = manager == null ? null : manager.getDefaultVibrator();
        if (vibrator == null || !vibrator.hasVibrator()) {
            call.reject("Este dispositivo no tiene vibrador", "NO_VIBRATOR");
            return;
        }
        int duration = Math.max(40, Math.min(500, call.getInt("duration", 120)));
        try {
            // Explicit touch usage avoids the UNKNOWN category used by the generic plugin.
            VibrationAttributes attributes = new VibrationAttributes.Builder().setUsage(VibrationAttributes.USAGE_TOUCH).build();
            vibrator.vibrate(VibrationEffect.createOneShot(duration, 255), attributes);
            call.resolve();
        } catch (Exception e) {
            call.reject("No se pudo activar la vibración", e);
        }
    }
}
