import { Capacitor } from "@capacitor/core";
import {
  BiometricAuth,
  BiometryError,
  BiometryErrorType,
  BiometryType,
  CheckBiometryResult,
} from "@aparajita/capacitor-biometric-auth";

export interface DeviceSecurityCheck {
  isSupported: boolean;
  hasBiometrics: boolean;
  deviceIsSecure: boolean;
  biometryType: BiometryType;
  errorMessage?: string;
}

export interface AuthenticateResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
}

export const biometricAuthService = {
  async checkAvailability(): Promise<DeviceSecurityCheck> {
    if (!Capacitor.isNativePlatform()) {
      return {
        isSupported: false,
        hasBiometrics: false,
        deviceIsSecure: false,
        biometryType: BiometryType.none,
      };
    }

    try {
      const result: CheckBiometryResult = await BiometricAuth.checkBiometry();
      return {
        isSupported: true,
        hasBiometrics: result.isAvailable,
        deviceIsSecure: result.deviceIsSecure,
        biometryType: result.biometryType,
        errorMessage: result.reason || undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao verificar segurança do dispositivo";
      return {
        isSupported: false,
        hasBiometrics: false,
        deviceIsSecure: false,
        biometryType: BiometryType.none,
        errorMessage: message,
      };
    }
  },

  async authenticate(reason = "Confirme sua identidade para acessar o Van 360"): Promise<AuthenticateResult> {
    if (!Capacitor.isNativePlatform()) {
      return { success: true };
    }

    try {
      await BiometricAuth.authenticate({
        reason,
        allowDeviceCredential: true,
        cancelTitle: "Cancelar",
        iosFallbackTitle: "Usar código",
        androidTitle: "Van 360",
        androidSubtitle: "Confirme sua identidade para continuar",
      });

      return { success: true };
    } catch (err) {
      if (err instanceof BiometryError) {
        if (
          err.code === BiometryErrorType.userCancel ||
          err.code === BiometryErrorType.systemCancel ||
          err.code === BiometryErrorType.appCancel
        ) {
          return { success: false, cancelled: true };
        }
        return { success: false, error: err.message };
      }

      const message = err instanceof Error ? err.message : "Falha na autenticação";
      return { success: false, error: message };
    }
  },
};
