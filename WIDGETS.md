# Android Home Screen Widgets

This app includes **2 native Android home screen widgets** that provide quick access to your spending data.

## 📱 Available Widgets

### 1. Spending Summary Widget
Displays your total spending for the current month directly on your home screen.

**Features:**
- Shows monthly total amount (e.g., "৳12,450")
- Displays number of expenses (e.g., "47 expenses")
- Tap to open the app
- Auto-updates when you add/edit expenses
- Clean, minimal design matching the app's aesthetic

**Size:** 2x2 cells (minimum)

### 2. Quick Add Widget
One-tap access to add a new expense.

**Features:**
- Shows app icon with "Add Expense" label
- Tap to instantly open the add expense modal
- No need to open the app first
- Perfect for quick expense tracking on the go

**Size:** 2x2 cells (minimum)

## 🎨 Widget Design

Both widgets feature:
- **White background** with subtle border
- **Rounded corners** (16dp radius)
- **Clean typography** matching the app's design
- **Nothing-inspired aesthetic** - minimal and functional
- **Responsive** - can be resized on home screen

## 🔧 How Widgets Work

### Data Flow
1. **Web App → Widget Data:**
   - When you add/edit expenses, the app calculates the monthly total
   - The total is sent to native Android storage via Capacitor plugin
   - Widgets read from this storage and display the data

2. **Widget → Web App:**
   - Tapping the Quick Add widget sets a "pending action" flag
   - When the app opens, it checks for this flag
   - If found, it automatically opens the add expense modal

### Technical Implementation

**Native Android Components:**
- `SpendingSummaryWidget.java` - Handles spending summary widget
- `QuickAddWidget.java` - Handles quick add widget
- `WidgetDataHelper.java` - Manages shared data between app and widgets
- `WidgetDataPlugin.java` - Capacitor plugin for web-to-native communication

**Web Components:**
- `widgetService.ts` - TypeScript interface for widget communication
- Integrated into `Overview.tsx` - Updates widget when expenses change
- Integrated into `App.tsx` - Handles pending widget actions

**Storage:**
- Uses Android `SharedPreferences` for data persistence
- Key: `WidgetData`
- Values: `monthly_total`, `monthly_subtitle`, `pending_action`

## 📲 Adding Widgets to Home Screen

### Method 1: Long Press
1. Long press on an empty area of your home screen
2. Select "Widgets" from the menu
3. Find "What Did I Spend?" in the widget list
4. Choose either "Spending Summary" or "Quick Add"
5. Drag to your desired location on the home screen

### Method 2: Widget Picker
1. Pinch your home screen with two fingers
2. Tap "Widgets" at the bottom
3. Find "What Did I Spend?"
4. Select and place the widget

## 🔄 Widget Updates

### Automatic Updates
- **Spending Summary:** Updates every 30 minutes automatically
- **Spending Summary:** Updates immediately when you add/edit expenses in the app
- **Quick Add:** No data updates needed (just a launcher)

### Manual Refresh
- Tap the widget to open the app
- The widget will refresh with the latest data when you return to home screen

## 🎯 Widget Actions

### Spending Summary Widget
- **Tap anywhere:** Opens the app to the Overview page
- Shows real-time monthly spending total
- Updates automatically when expenses change

### Quick Add Widget
- **Tap anywhere:** Opens the app directly to the add expense modal
- Bypasses the need to navigate through the app
- Perfect for quick expense entry

## 🛠️ Customization

### Changing Widget Appearance
Widget layouts are defined in XML:
- `res/layout/widget_spending_summary.xml` - Summary widget layout
- `res/layout/widget_quick_add.xml` - Quick add widget layout
- `res/drawable/widget_background.xml` - Background styling

### Changing Update Frequency
Edit `res/xml/widget_spending_summary_info.xml`:
```xml
android:updatePeriodMillis="1800000"  <!-- 30 minutes in milliseconds -->
```

### Changing Widget Size
Edit the widget info XML files:
```xml
android:minWidth="110dp"   <!-- Minimum width -->
android:minHeight="110dp"  <!-- Minimum height -->
```

## 🐛 Troubleshooting

### Widget Not Updating
1. Open the app and add an expense
2. Return to home screen
3. Widget should update within a few seconds
4. If not, try removing and re-adding the widget

### Widget Shows "৳0"
- This means no expenses have been recorded yet
- Add your first expense in the app
- The widget will update automatically

### Widget Not Responding to Taps
- Check if the app is properly installed
- Try restarting your phone
- Remove and re-add the widget

### Widget Disappeared After App Update
- This is normal Android behavior
- Re-add the widget from the widget picker
- Your data is preserved in the app

## 📊 Widget Data

### What's Stored
- Monthly spending total (formatted with currency symbol)
- Number of expenses this month
- Pending action flags (for quick add)

### What's NOT Stored
- Individual expense details (privacy)
- Historical data (only current month)
- Personal information

### Data Privacy
- All widget data stays on your device
- No data is sent to external servers
- Widgets use local Android storage only

## 🔮 Future Enhancements

Potential widget features for future versions:
- **Category breakdown widget** - Show top spending categories
- **Weekly/Monthly toggle** - Switch between time periods
- **Custom date range** - View any period's spending
- **Spending trend widget** - Mini chart showing spending over time
- **Budget progress widget** - Show budget vs actual spending

## 📝 Notes

- Widgets require Android 5.1 (API 22) or higher
- Widgets work offline - no internet connection required
- Widget data persists across app restarts
- Multiple instances of each widget can be added
- Widgets can be resized (if supported by your launcher)

## 🎓 For Developers

### Adding a New Widget

1. **Create layout XML:**
   ```xml
   res/layout/widget_new.xml
   ```

2. **Create widget info XML:**
   ```xml
   res/xml/widget_new_info.xml
   ```

3. **Create AppWidgetProvider:**
   ```java
   public class NewWidget extends AppWidgetProvider {
       // Implementation
   }
   ```

4. **Register in AndroidManifest.xml:**
   ```xml
   <receiver android:name=".NewWidget" android:exported="true">
       <intent-filter>
           <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
       </intent-filter>
       <meta-data
           android:name="android.appwidget.provider"
           android:resource="@xml/widget_new_info" />
   </receiver>
   ```

5. **Add data methods to WidgetDataHelper.java**

6. **Add plugin methods to WidgetDataPlugin.java**

7. **Add TypeScript interface to widgetService.ts**

### Testing Widgets
- Use Android emulator to test widgets
- Long press home screen → Widgets → Find your app
- Test tap actions and data updates
- Verify widget persists after app restart

## 📚 Related Documentation

- [BUILD.md](BUILD.md) - Building the APK
- [ANDROID_SETUP.md](ANDROID_SETUP.md) - Android setup details
- [README.md](README.md) - General app documentation

---

**Widgets are a native Android feature that work seamlessly with the web app via Capacitor plugins. They provide quick, at-a-glance access to your spending data without opening the app.**
