import { useEffect } from "react";
import { useSession } from "@/hooks/business/useSession";
import { initializeRevenueCat, logoutRevenueCat } from "@/services/native/iapRevenueCat.service";

export const IAPController = () => {
  const { user } = useSession();

  useEffect(() => {
    if (user?.id) {
      void initializeRevenueCat(user.id);
    } else {
      void logoutRevenueCat();
    }
  }, [user?.id]);

  return null;
};

