"use client";

import React, { useState, useEffect } from "react";
import { EmbeddedReportWidget } from "./EmbeddedReportWidget";
import {
  getAssignedReportsForDashboard,
  DashboardReportAssignment,
} from "../utils/dashboardAssignment";

interface DashboardReportContainerProps {
  dashboardKey: "documents" | "tasks" | "posts" | "admin";
  defaultReportCode?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  className?: string;
  defaultCollapsed?: boolean;
}

export function DashboardReportContainer({
  dashboardKey,
  defaultReportCode,
  defaultTitle,
  defaultDescription,
  className = "",
  defaultCollapsed = false,
}: DashboardReportContainerProps) {
  const [assignedReports, setAssignedReports] = useState<DashboardReportAssignment[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const loadAssignments = () => {
    const list = getAssignedReportsForDashboard(dashboardKey);
    setAssignedReports(list);
  };

  useEffect(() => {
    setIsMounted(true);
    loadAssignments();

    const handleUpdate = () => {
      loadAssignments();
    };

    window.addEventListener("daklak-dashboard-assignments-updated", handleUpdate);
    return () => {
      window.removeEventListener("daklak-dashboard-assignments-updated", handleUpdate);
    };
  }, [dashboardKey]);

  // Trong lúc SSR hoặc chưa mount, dùng fallback mặc định
  if (!isMounted) {
    if (!defaultReportCode) return null;
    return (
      <EmbeddedReportWidget
        reportIdOrCode={defaultReportCode}
        title={defaultTitle}
        description={defaultDescription}
        className={className}
        defaultCollapsed={defaultCollapsed}
      />
    );
  }

  // Nếu không có báo cáo nào được gán và có fallback
  if (assignedReports.length === 0) {
    if (!defaultReportCode) return null;
    return (
      <EmbeddedReportWidget
        reportIdOrCode={defaultReportCode}
        title={defaultTitle}
        description={defaultDescription}
        className={className}
        defaultCollapsed={defaultCollapsed}
      />
    );
  }

  // Render tất cả các báo cáo được gán cho Dashboard này
  return (
    <div className={`space-y-5 min-w-0 ${className}`}>
      {assignedReports.map((item, idx) => (
        <EmbeddedReportWidget
          key={`${item.reportIdOrCode}-${idx}`}
          reportIdOrCode={item.reportIdOrCode}
          columns={item.columns || 2}
          chartHeight={item.chartHeight || 240}
          showDetailLink={item.showDetailLink ?? true}
          allowToggleType={item.allowToggleType ?? true}
          defaultCollapsed={idx > 0 ? true : defaultCollapsed}
        />
      ))}
    </div>
  );
}
