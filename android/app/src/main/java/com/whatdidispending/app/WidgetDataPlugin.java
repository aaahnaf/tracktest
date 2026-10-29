package com.whatdidispending.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetData")
public class WidgetDataPlugin extends Plugin {

    @PluginMethod
    public void updateMonthlyTotal(PluginCall call) {
        String total = call.getString("total", "৳0");
        String subtitle = call.getString("subtitle", "This month");
        
        WidgetDataHelper.updateMonthlyTotal(getContext(), total, subtitle);
        
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void getMonthlyTotal(PluginCall call) {
        String total = WidgetDataHelper.getMonthlyTotal(getContext());
        String subtitle = WidgetDataHelper.getMonthlySubtitle(getContext());
        
        JSObject ret = new JSObject();
        ret.put("total", total);
        ret.put("subtitle", subtitle);
        call.resolve(ret);
    }

    @PluginMethod
    public void getPendingAction(PluginCall call) {
        String action = WidgetDataHelper.getPendingAction(getContext());
        
        JSObject ret = new JSObject();
        ret.put("action", action != null ? action : "");
        call.resolve(ret);
    }
}
