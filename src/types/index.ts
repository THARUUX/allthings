import { Role, UserStatus, ArticleStatus } from "@prisma/client";

export type { Role, UserStatus, ArticleStatus };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  pendingArticles: number;
  totalViews: number;
  totalUsers?: number;
}
