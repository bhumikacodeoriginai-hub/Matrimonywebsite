import 'package:flutter/services.dart';

/// Security utilities for screenshot prevention and other protections
class SecurityUtils {
  /// Enable screenshot prevention (Android)
  /// Uses FLAG_SECURE to prevent screenshots and screen recordings
  static Future<void> enableScreenshotPrevention() async {
    try {
      // flutter_windowmanager package
      // FlutterWindowManager.addFlags(FlutterWindowManager.FLAG_SECURE);
      // For now, using method channel approach
      const platform = MethodChannel('com.advaitamatrimony/security');
      await platform.invokeMethod('enableSecureScreen');
    } catch (e) {
      // Fail silently on platforms that don't support this
    }
  }

  /// Disable screenshot prevention (for non-sensitive screens)
  static Future<void> disableScreenshotPrevention() async {
    try {
      const platform = MethodChannel('com.advaitamatrimony/security');
      await platform.invokeMethod('disableSecureScreen');
    } catch (e) {
      // Fail silently
    }
  }

  /// Detect if device is rooted/jailbroken
  static Future<bool> isDeviceCompromised() async {
    try {
      const platform = MethodChannel('com.advaitamatrimony/security');
      return await platform.invokeMethod('isDeviceRooted') ?? false;
    } catch (e) {
      return false;
    }
  }

  /// Check if screen recording is active
  static Future<bool> isScreenBeingRecorded() async {
    try {
      const platform = MethodChannel('com.advaitamatrimony/security');
      return await platform.invokeMethod('isScreenRecording') ?? false;
    } catch (e) {
      return false;
    }
  }
}
