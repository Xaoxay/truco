package com.xaoxay.truco;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TrucoUpdates")
public class TrucoUpdatesPlugin extends Plugin {
    @PluginMethod
    public void installedVersion(PluginCall call) {
        try {
            PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            JSObject result = new JSObject();
            result.put("code", info.getLongVersionCode());
            result.put("name", info.versionName);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("No se pudo consultar la versión instalada", e);
        }
    }

    @PluginMethod
    public void openDownload(PluginCall call) {
        String url = call.getString("url", "");
        if (!url.matches("https://github\\.com/Xaoxay/truco/releases/download/android-[0-9]+/truco\\.apk")) {
            call.reject("El enlace de actualización no es válido");
            return;
        }
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("No se pudo abrir la descarga", e);
        }
    }
}
