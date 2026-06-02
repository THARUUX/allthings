import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calculateEarnings(
  impressions: number,
  clicks: number,
  cpm?: number | null,
  cpc?: number | null
): number {
  const PUBLISHER_SHARE = 0.7;
  let earnings = 0;
  if (cpm) earnings += (impressions / 1000) * cpm * PUBLISHER_SHARE;
  if (cpc) earnings += clicks * cpc * PUBLISHER_SHARE;
  return Math.round(earnings * 10000) / 10000;
}

export function calculateCTR(clicks: number, impressions: number): string {
  if (impressions === 0) return "0.00%";
  return `${((clicks / impressions) * 100).toFixed(2)}%`;
}

export function calculateRPM(earnings: number, impressions: number): string {
  if (impressions === 0) return "$0.00";
  return formatCurrency((earnings / impressions) * 1000);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "badge-success",
    APPROVED: "badge-success",
    PENDING: "badge-warning",
    PROCESSING: "badge-warning",
    SUSPENDED: "badge-danger",
    REJECTED: "badge-danger",
    PAUSED: "badge-neutral",
    COMPLETED: "badge-neutral",
    PAID: "badge-success",
  };
  return map[status] ?? "badge-neutral";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateAdScript(adUnitId: string, baseUrl: string): string {
  return `<!-- ALLTHINGS Ad Unit -->
<div id="at-ad-${adUnitId}"></div>
<script>
(function(){
  var d=document,s=d.createElement('script');
  s.src='${baseUrl}/ad.js';
  s.dataset.unitId='${adUnitId}';
  s.async=true;
  d.head.appendChild(s);
})();
</script>`;
}

export function isValidDomain(domain: string): boolean {
  const pattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return pattern.test(domain);
}

export function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}
