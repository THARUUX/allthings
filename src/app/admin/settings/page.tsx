import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  // Fetch all settings
  const settingsList = await prisma.setting.findMany();
  
  const settingsMap: Record<string, string> = {
    platformName: "ALLTHINGS",
    platformDescription: "Write and read stories.",
    adsterra_popunder: "",
    adsterra_banner_728x90: "",
    adsterra_banner_300x250: "",
    adsterra_native_ad: "",
    adsterra_social_bar: "",
  };

  settingsList.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">Configure website branding and Adsterra monetization zones.</p>
        </div>
      </div>

      <SettingsForm initialSettings={settingsMap} />
    </div>
  );
}

export const metadata = {
  title: "Platform Settings",
};
