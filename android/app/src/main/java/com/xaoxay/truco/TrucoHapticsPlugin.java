package com.xaoxay.truco;

import android.content.Context;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.os.VibrationEffect;
import android.os.VibrationAttributes;
import android.os.Build;
import android.media.AudioAttributes;
import android.provider.Settings;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TrucoHaptics")
public class TrucoHapticsPlugin extends Plugin {
    @PluginMethod
    public void vibrate(PluginCall call) {
        Vibrator vibrator;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager manager = (VibratorManager) getContext().getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            vibrator = manager == null ? null : manager.getDefaultVibrator();
        } else {
            vibrator = (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
        }
        if (vibrator == null || !vibrator.hasVibrator()) {
            call.reject("Este dispositivo no tiene vibrador", "NO_VIBRATOR");
            return;
        }
        int duration = Math.max(40, Math.min(500, call.getInt("duration", 120)));
        if (Settings.System.getInt(getContext().getContentResolver(), Settings.System.HAPTIC_FEEDBACK_ENABLED, 1) == 0) {
            call.reject("La vibración táctil está desactivada en Android", "VIBRATION_DISABLED");
            return;
        }
        try {
            // Explicit touch usage avoids the UNKNOWN category used by the generic plugin.
            VibrationEffect effect = VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                VibrationAttributes attributes = new VibrationAttributes.Builder().setUsage(VibrationAttributes.USAGE_TOUCH).build();
                vibrator.vibrate(effect, attributes);
            } else {
                AudioAttributes attributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
                vibrator.vibrate(effect, attributes);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("No se pudo activar la vibración", e);
        }
    }
}
