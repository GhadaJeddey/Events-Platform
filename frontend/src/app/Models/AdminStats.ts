export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalEvents: number;
    pendingEvents: number;
  };
  details: {
    eventsByApprovalStatus: { approvalStatus: string; count: string }[];
  };
}