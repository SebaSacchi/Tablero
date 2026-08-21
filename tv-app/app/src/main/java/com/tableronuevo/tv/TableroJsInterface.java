package com.tableronuevo.tv;

import android.content.Context;
import android.provider.Settings;
import android.webkit.JavascriptInterface;

public class TableroJsInterface {

    private final Context context;

    TableroJsInterface(Context context) {
        this.context = context;
    }

    // Expuesto como window.TableroAndroid.getDeviceId() en licencia-check.js.
    // Settings.Secure.ANDROID_ID no vive en el almacenamiento de esta app, asi
    // que sobrevive a un "Borrar datos" o a un limpiador de cache de la TV.
    @JavascriptInterface
    public String getDeviceId() {
        return Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
    }
}
