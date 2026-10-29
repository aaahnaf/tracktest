package com.whatdidispending.app;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Register the widget data plugin
        registerPlugin(WidgetDataPlugin.class);
        super.onCreate(savedInstanceState);
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent != null && intent.getExtras() != null) {
            String action = intent.getStringExtra("action");
            if (action != null) {
                // Store the action in SharedPreferences so the web app can read it
                getSharedPreferences("WidgetData", MODE_PRIVATE)
                    .edit()
                    .putString("pending_action", action)
                    .apply();
            }
        }
    }
}
