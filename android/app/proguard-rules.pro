-keepattributes *Annotation*
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes Signature
-keepattributes SourceFile,LineNumberTable
-keepattributes JavascriptInterface

-keep public class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

-keep public class * extends com.getcapacitor.Plugin {
    public <fields>;
    public <methods>;
}

-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public *;
}

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keep public class com.tibis.van360.MainActivity {
    public *;
}

-keepclassmembers enum * { *; }

-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

-keep class ee.forgr.capacitor_updater.** { *; }
-dontwarn ee.forgr.capacitor_updater.**

-keep class com.equimaps.** { *; }
-dontwarn com.equimaps.**
