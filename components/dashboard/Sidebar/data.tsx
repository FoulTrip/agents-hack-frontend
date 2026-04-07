import { Code2, ExternalLink, GitBranch, LayoutDashboard, Workflow, Monitor, BarChart3 } from "lucide-react";

export const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Live Office HUD", icon: Monitor, path: "/office" },
    { label: "Factory Metrics", icon: BarChart3, path: "/metrics" },
    { label: "Agentic Workflows", icon: Workflow, path: "/workflows" },
    { label: "Cloud Connectors", icon: ExternalLink, path: "/connectors" },
    { label: "Software Factory", icon: Code2, path: "/factory" },
];