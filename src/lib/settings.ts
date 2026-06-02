import { prisma } from "@/lib/prisma";

export async function getSetting(key: string, defaultValue: string = ""): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });
    return setting?.value ?? defaultValue;
  } catch (error) {
    console.error(`[GET SETTING] Error fetching key "${key}":`, error);
    return defaultValue;
  }
}

export async function getAdsterraSettings(): Promise<Record<string, string>> {
  const keys = [
    "adsterra_popunder",
    "adsterra_banner_728x90",
    "adsterra_banner_300x250",
    "adsterra_native_ad",
    "adsterra_social_bar",
  ];
  
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: keys } },
    });
    
    const settingsMap: Record<string, string> = {};
    // Populate defaults
    keys.forEach((key) => {
      settingsMap[key] = "";
    });
    // Populate database values
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    
    return settingsMap;
  } catch (error) {
    console.error("[GET ADSTERRA SETTINGS] Error:", error);
    return {};
  }
}
export const revalidate = 60; // Cache database settings lookup for 60s
