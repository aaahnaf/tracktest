package com.whatdidispending.app;

import android.content.Context;
import android.content.SharedPreferences;

public class WidgetDataHelper {
    
    public static void updateMonthlyTotal(Context context, String total, String subtitle) {
        SharedPreferences prefs = context.getSharedPreferences("WidgetData", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("monthly_total", total);
        editor.putString("monthly_subtitle", subtitle);
        editor.apply();
    }
    
    public static String getMonthlyTotal(Context context) {
        SharedPreferences prefs = context.getSharedPreferences("WidgetData", Context.MODE_PRIVATE);
        return prefs.getString("monthly_total", "৳0");
    }
    
    public static String getMonthlySubtitle(Context context) {
        SharedPreferences prefs = context.getSharedPreferences("WidgetData", Context.MODE_PRIVATE);
        return prefs.getString("monthly_subtitle", "This month");
    }
    
    public static String getPendingAction(Context context) {
        SharedPreferences prefs = context.getSharedPreferences("WidgetData", Context.MODE_PRIVATE);
        String action = prefs.getString("pending_action", null);
        // Clear the action after reading
        if (action != null) {
            prefs.edit().remove("pending_action").apply();
        }
        return action;
    }
}
