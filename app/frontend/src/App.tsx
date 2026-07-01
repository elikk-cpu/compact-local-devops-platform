import {
  useEffect,
  useState,
  type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  Gauge,
  GitBranch,
  Globe2,
  HardDrive,
  History,
  Layers3,
  LockKeyhole,
  Monitor,
  RadioTower,
  Rocket,
  Search,
  ServerCog,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TerminalSquare,
  Users,
  Zap,
  } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";
import heroSkyline from "./assets/hero-skyline.svg";
type ServiceStatus = {
  name: string;
  icon: LucideIcon;
  status: "Operational" | "Degraded" | "Down";
  latency: string;
  uptime: string;
  lastCheck: string;
  color: string;
};

type AdminService = {
  name: string;
  icon: LucideIcon;
  status: string;
  latency: string;
  errorRate: string;
  cpu: number;
  memory: number;
};

const uptimeData = [
  { day: "Feb 22", uptime: 99.96 },
  { day: "Mar 1", uptime: 99.98 },
  { day: "Mar 8", uptime: 99.97 },
  { day: "Mar 15", uptime: 99.99 },
  { day: "Mar 22", uptime: 99.98 },
  { day: "Apr 5", uptime: 99.82 },
  { day: "Apr 12", uptime: 99.97 },
  { day: "Apr 19", uptime: 99.99 },
  { day: "May 3", uptime: 99.84 },
  { day: "May 10", uptime: 99.98 },
  { day: "May 17", uptime: 99.91 },
  { day: "May 22", uptime: 99.982 },
];

const adminMetricsData = [
  { day: "Apr 22", latency: 510, traffic: 2.1, errors: 0.13 },
  { day: "Apr 29", latency: 535, traffic: 2.3, errors: 0.15 },
  { day: "May 6", latency: 690, traffic: 2.6, errors: 0.31 },
  { day: "May 13", latency: 610, traffic: 2.4, errors: 0.19 },
  { day: "May 20", latency: 720, traffic: 2.9, errors: 0.23 },
];

const services: ServiceStatus[] = [
  {
    name: "Public API",
    icon: Globe2,
    status: "Operational",
    latency: "112ms",
    uptime: "99.987%",
    lastCheck: "10:24:29 PM UTC",
    color: "cyan",
  },
  {
    name: "Admin UI",
    icon: Monitor,
    status: "Operational",
    latency: "98ms",
    uptime: "99.991%",
    lastCheck: "10:24:28 PM UTC",
    color: "violet",
  },
  {
    name: "PostgreSQL",
    icon: Database,
    status: "Operational",
    latency: "1.42ms",
    uptime: "99.997%",
    lastCheck: "10:24:27 PM UTC",
    color: "blue",
  },
  {
    name: "Worker / Notifier",
    icon: ServerCog,
    status: "Operational",
    latency: "164ms",
    uptime: "99.972%",
    lastCheck: "10:24:30 PM UTC",
    color: "amber",
  },
  {
    name: "Ingress",
    icon: RadioTower,
    status: "Operational",
    latency: "76ms",
    uptime: "99.988%",
    lastCheck: "10:24:29 PM UTC",
    color: "emerald",
  },
];

const adminServices: AdminService[] = [
  { name: "Public API", icon: Globe2, status: "Operational", latency: "112ms", errorRate: "0.12%", cpu: 18, memory: 42 },
  { name: "Admin UI", icon: Monitor, status: "Operational", latency: "98ms", errorRate: "0.08%", cpu: 11, memory: 38 },
  { name: "PostgreSQL", icon: Database, status: "Operational", latency: "1.42ms", errorRate: "0.01%", cpu: 23, memory: 61 },
  { name: "Worker", icon: ServerCog, status: "Operational", latency: "164ms", errorRate: "0.72%", cpu: 27, memory: 55 },
  { name: "Ingress", icon: RadioTower, status: "Operational", latency: "76ms", errorRate: "0.02%", cpu: 14, memory: 31 },
  { name: "Alertmanager", icon: Bell, status: "Operational", latency: "85ms", errorRate: "0.03%", cpu: 9, memory: 25 },
  { name: "Grafana", icon: Gauge, status: "Operational", latency: "101ms", errorRate: "0.05%", cpu: 13, memory: 29 },
];

const incidents = [
  {
    title: "Worker / Notifier degradation",
    date: "May 21, 2025 11:17 PM",
    duration: "Resolved in 18m",
  },
  {
    title: "Database connection pool exhaustion",
    date: "May 19, 2025 6:42 PM",
    duration: "Resolved in 32m",
  },
  {
    title: "Admin UI slow responses",
    date: "May 15, 2025 2:08 PM",
    duration: "Resolved in 21m",
  },
];

const deployments = [
  { name: "API v2.18.3", service: "Public API", status: "Success", time: "10:21 PM", by: "ci-cd-bot", icon: Globe2 },
  { name: "Worker v1.9.8", service: "Worker", status: "Success", time: "09:47 PM", by: "ci-cd-bot", icon: ServerCog },
  { name: "Admin UI v1.7.2", service: "Admin UI", status: "Success", time: "08:55 PM", by: "ci-cd-bot", icon: Monitor },
  { name: "PostgreSQL t16.2", service: "PostgreSQL", status: "Success", time: "07:32 PM", by: "db-admin", icon: Database },
  { name: "Alertmanager v0.27.0", service: "Alertmanager", status: "Failed", time: "06:41 PM", by: "ci-cd-bot", icon: ShieldAlert },
];

const logEvents = [
  ["10:24:28 PM", "INFO", "Ingress", "200 GET /api/health 12ms"],
  ["10:24:27 PM", "INFO", "Public API", "Request completed 200 134ms"],
  ["10:24:26 PM", "WARN", "Worker", "Job retry attempt 2/5 job=sync-users"],
  ["10:24:25 PM", "ERROR", "PostgreSQL", "Connection timeout to replica-2"],
  ["10:24:24 PM", "INFO", "Admin UI", "User admin@example.com signed in"],
  ["10:24:23 PM", "INFO", "Deploy", "Deployment succeeded: API v2.18.3"],
  ["10:24:22 PM", "INFO", "Worker", "Processed job job=send-email id=8f3c"],
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://192.168.57.10:8000";

type ApiPlatformStatus = {
  overall_status: string;
  generated_at: string;
  services: {
    name: string;
    status: string;
    description: string;
    latency: string;
    uptime: string;
    last_check: string;
  }[];
  active_incidents: {
    id: number;
    title: string;
    status: string;
    severity: string;
    created_at: string;
    updated_at: string;
  }[];
};


type ApiKubernetesStatus = {
  overall_status: "operational" | "degraded" | "major_outage" | "unknown";
  generated_at: string;
  deployments: {
    name: string;
    kubernetes_name: string;
    status: string;
    desired_replicas: number;
    ready_replicas: number;
    available_replicas: number;
    ready: string;
  }[];
  pods: {
    name: string;
    namespace: string;
    node: string | null;
    phase: string;
    ready: boolean;
    reason: string;
    owner: string | null;
    pod_ip: string | null;
  }[];
  active_incidents: {
    id: number;
    title: string;
    status: string;
    severity: string;
    created_at: string;
    updated_at: string;
    details: string;
  }[];
};

function ApiLiveBadge() {
  const [status, setStatus] = useState<"checking" | "connected" | "down">("checking");

  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("API is not healthy");
        }
        setStatus("connected");
      })
      .catch(() => setStatus("down"));
  }, []);

  return (
    <span className={`api-live-badge ${status}`}>
      <span />
      API {status === "connected" ? "connected" : status === "down" ? "offline" : "checking"}
    </span>
  );
}

function App() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  return isAdmin ? <AdminDashboard /> : <StatusPage />;
}

type ApiMonitoringSummary = {
  api_targets_up: number;
  api_request_rate: number;
  firing_alerts: number;
  requests_by_endpoint: Array<{
    endpoint: string;
    value: number;
  }>;
  service_health: Array<{
    service: string;
    value: number;
  }>;
};

function StatusPage() {
  const [apiStatus, setApiStatus] = useState<ApiPlatformStatus | null>(null);
  const [k8sStatus, setK8sStatus] = useState<ApiKubernetesStatus | null>(null);
  const [monitoringSummary, setMonitoringSummary] = useState<ApiMonitoringSummary | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/status`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load platform status");
        }
        return response.json();
      })
      .then((data: ApiPlatformStatus) => setApiStatus(data))
      .catch(() => setApiStatus(null));
  }, []);

  useEffect(() => {
    const loadKubernetesStatus = () => {
      fetch(`${API_BASE_URL}/api/kubernetes/status`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load Kubernetes status");
          }
          return response.json();
        })
        .then((data: ApiKubernetesStatus) => setK8sStatus(data))
        .catch(() => setK8sStatus(null));
    };

    loadKubernetesStatus();
    const intervalId = window.setInterval(loadKubernetesStatus, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const loadMonitoringSummary = () => {
      fetch(`${API_BASE_URL}/api/monitoring/summary`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load monitoring summary");
          }
          return response.json();
        })
        .then((data: ApiMonitoringSummary) => setMonitoringSummary(data))
        .catch(() => setMonitoringSummary(null));
    };

    loadMonitoringSummary();
    const intervalId = window.setInterval(loadMonitoringSummary, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const liveServices = services.map((service) => {
    const apiService = apiStatus?.services.find((item) => item.name === service.name);

    const k8sService = k8sStatus?.deployments.find((item) => {
      if (item.name === service.name) return true;
      if (service.name === "Admin UI" && item.name === "Frontend UI") return true;
      if (service.name === "Worker / Notifier" && item.kubernetes_name === "localops-worker") return true;
      if (service.name === "Public API" && item.kubernetes_name === "localops-api") return true;
      return false;
    });

    const k8sNormalizedStatus: ServiceStatus["status"] | null =
      k8sService?.status === "operational"
        ? "Operational"
        : k8sService?.status === "degraded"
          ? "Degraded"
          : k8sService?.status === "down"
            ? "Down"
            : null;

    const apiNormalizedStatus: ServiceStatus["status"] | null =
      apiService?.status === "operational"
        ? "Operational"
        : apiService?.status === "degraded"
          ? "Degraded"
          : apiService?.status === "down"
            ? "Down"
            : null;

    return {
      ...service,
      status: k8sNormalizedStatus ?? apiNormalizedStatus ?? service.status,
      latency: apiService?.latency ?? service.latency,
      uptime: apiService?.uptime ?? service.uptime,
      lastCheck: k8sStatus?.generated_at
        ? new Date(k8sStatus.generated_at).toUTCString().replace("GMT", "UTC")
        : apiService?.last_check
          ? new Date(apiService.last_check).toUTCString().replace("GMT", "UTC")
          : service.lastCheck,
    } satisfies ServiceStatus;
  });

  const activeIncidents =
    (k8sStatus?.active_incidents ?? apiStatus?.active_incidents ?? []) as Array<{
      id?: string | number;
      title: string;
      details?: string;
      severity?: string;
      status?: string;
      created_at?: string;
      updated_at?: string;
    }>;

  const activeIncidentsCount = activeIncidents.length;

  const effectiveOverallStatus = k8sStatus?.overall_status ?? apiStatus?.overall_status ?? "operational";

  const heroTitle =
    effectiveOverallStatus === "operational"
      ? "All Systems Operational"
      : effectiveOverallStatus === "degraded"
        ? "Partial System Degradation"
        : effectiveOverallStatus === "major_outage"
          ? "Major Platform Outage"
          : "Kubernetes Status Unknown";

  const heroDescription =
    effectiveOverallStatus === "operational"
      ? "LocalOps platform is healthy and operating normally."
      : effectiveOverallStatus === "degraded"
        ? "One or more Kubernetes workloads require attention."
        : effectiveOverallStatus === "major_outage"
          ? "Critical platform components are unavailable."
          : "Kubernetes status could not be determined.";

  const incidentHint =
    activeIncidentsCount === 0
      ? "No active incidents"
      : `${activeIncidentsCount} Kubernetes incident${activeIncidentsCount === 1 ? "" : "s"} detected`;

  const apiRequestRate =
    monitoringSummary?.api_request_rate !== undefined
      ? `${monitoringSummary.api_request_rate.toFixed(2)} req/s`
      : "0.00 req/s";

  const apiTargetsUp =
    monitoringSummary?.api_targets_up !== undefined
      ? `${monitoringSummary.api_targets_up.toFixed(0)} targets UP`
      : "Prometheus data pending";

  const lastUpdated = apiStatus?.generated_at
    ? new Date(apiStatus.generated_at).toUTCString()
    : "May 22, 2025 10:24:30 PM UTC";
  return (
    <main className="app-shell">
      <BackgroundEffects />

      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">
            <Layers3 size={22} />
          </div>
          <span>LocalOps Status Platform</span>
        </div>

        <nav className="nav">
          <a className="active" href="/">Status</a>
          <a>Incidents</a>
          <a>Maintenance</a>
          <a>History</a>
          <a>Components</a>
          <a>API</a>
        </nav>

        <button className="subscribe-btn">
          <Bell size={16} />
          Subscribe
        </button>
      </header>

      <section className="hero hero-ref-clean">
        <div className="hero-left-scene">
          <div className="scene-bars left-bars">
            <span /><span /><span /><span /><span /><span /><span /><span />
          </div>

          <motion.div
            className="big-shield"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="shield-aura" />
            <ShieldCheck size={132} strokeWidth={1.8} />
            <div className="shield-ring ring-a" />
            <div className="shield-ring ring-b" />
            <div className="shield-ring ring-c" />
          </motion.div>
        </div>

        <div className="hero-copy hero-copy-center">
          <motion.h1
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55 }}
          >
            {heroTitle}
          </motion.h1>

          <p>
            {heroDescription}
            <br />
            Real-time status and performance for all systems and services.
          </p>

          <div className="hero-meta hero-meta-clean">
            <span>
              <Clock3 size={15} />
              Page auto-refreshes every 30s
            </span>
            <span className="meta-divider" />
            <span>Last updated: {lastUpdated}</span>
            <ApiLiveBadge />
          </div>
        </div>

        <div className="hero-right-scene">
          <img className="hero-skyline-img" src={heroSkyline} alt="" />
        </div>
      </section>

      <section className="kpi-grid">
        <KpiCard icon={Gauge} label="Overall uptime (90d)" value="99.982%" hint="+0.021% vs previous 90 days" tone="green" />
        <KpiCard icon={Clock3} label="API request rate" value={apiRequestRate} hint={apiTargetsUp} tone="purple" />
        <KpiCard
          icon={AlertTriangle}
          label="Active incidents"
          value={String(activeIncidentsCount)}
          hint={incidentHint}
          tone="yellow"
        />
        <KpiCard icon={Rocket} label="Last deployment" value="May 22, 7:42 PM" hint="Deployed by ci-cd-bot" tone="blue" />
      </section>

      <section className="dashboard-grid">
        <Panel className="uptime-panel" title="System uptime (90 days)" icon={Activity}>
          <div className="chart">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={uptimeData}>
                <defs>
                  <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2cff9a" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#2cff9a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis dataKey="day" stroke="#8ea3b9" fontSize={12} />
                <YAxis domain={[99.5, 100]} stroke="#8ea3b9" fontSize={12} tickFormatter={(value) => `${value}%`} />
                <Tooltip contentStyle={tooltipStyle("cyan")} />
                <Area type="monotone" dataKey="uptime" stroke="#2cff9a" strokeWidth={3} fill="url(#uptimeGradient)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="services-panel" title="Service status" icon={Layers3}>
          <div className="services-grid">
            {liveServices.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        </Panel>

        <Panel className="incidents-panel" title="Incidents" icon={AlertTriangle}>
          {activeIncidentsCount > 0 ? (
            <div className="active-incidents">
              {activeIncidents.map((incident, index) => (
                <div className="active-incident-row" key={incident.id ?? `${incident.title}-${index}`}>
                  <span className="active-incident-dot" />
                  <div>
                    <strong>{incident.title}</strong>
                    <p>{incident.details ?? incident.status ?? "Kubernetes incident is active"}</p>
                  </div>
                  <span>{incident.severity ?? "active"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-incidents">
              <CheckCircle2 size={56} />
              <h3>No active incidents</h3>
              <p>Everything is running smoothly.</p>
            </div>
          )}

          <div className="resolved-list">
            <div className="section-head">
              <span>Recently resolved</span>
              <a>View all incidents →</a>
            </div>

            {incidents.map((incident) => (
              <div className="incident-row" key={incident.title}>
                <span className="timeline-dot" />
                <div>
                  <strong>{incident.title}</strong>
                  <p>{incident.duration}</p>
                </div>
                <span>{incident.date}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="latency-panel" title="Requests by endpoint" icon={Zap}>
          <EndpointRequestsChart items={monitoringSummary?.requests_by_endpoint ?? []} />
          <div className="legend">
            <span className="legend-item cyan">Prometheus</span>
            <span className="legend-item purple">Live API metrics</span>
          </div>
        </Panel>
      </section>
    </main>
  );
}

function AdminDashboard() {
  return (
    <main className="admin-layout">
      <BackgroundEffects />

      <aside className="admin-sidebar">
        <div className="brand admin-brand">
          <div className="brand-logo">
            <Layers3 size={22} />
          </div>
          <span>LocalOps Admin</span>
        </div>

        <SidebarSection
          title="Operations"
          items={[
            ["Overview", Activity, true],
            ["Services", Layers3, false],
            ["Deployments", GitBranch, false],
            ["Incidents & Alerts", ShieldAlert, false],
            ["On-Call", Users, false],
            ["Runbooks", TerminalSquare, false],
          ]}
        />

        <SidebarSection
          title="Observability"
          items={[
            ["Metrics", Gauge, false],
            ["Logs", TerminalSquare, false],
            ["Infrastructure", Cpu, false],
            ["Storage", HardDrive, false],
          ]}
        />

        <SidebarSection
          title="Governance"
          items={[
            ["Access Control", LockKeyhole, false],
            ["Settings", Settings, false],
          ]}
        />

        <div className="system-time">
          <span>System Time (UTC)</span>
          <strong>May 22, 2025 10:24:30 PM</strong>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Full operational visibility and control for your platform.</p>
          </div>

          <div className="admin-actions">
            <div className="search-box">
              <Search size={16} />
              Search...
              <kbd>⌘K</kbd>
            </div>
            <button className="icon-btn">
              <Bell size={18} />
              <span className="notification-dot">3</span>
            </button>
            <button className="icon-btn">
              <Activity size={18} />
            </button>
            <div className="avatar">AD</div>
          </div>
        </header>

        <section className="admin-kpis">
          <AdminKpi icon={ShieldAlert} label="Active incidents" value="2" hint="1 critical • 1 high" tone="danger" />
          <AdminKpi icon={Bell} label="Alerts firing" value="7" hint="3 critical • 4 warning" tone="warning" />
          <AdminKpi icon={Rocket} label="Deployments today" value="14" hint="8 successful • 1 failed" tone="purple" />
          <AdminKpi icon={ShieldCheck} label="Platform health" value="99.982%" hint="Excellent" tone="green" />
        </section>

        <section className="admin-grid">
          <Panel className="admin-services-table" title="Services overview" icon={Layers3}>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Latency</th>
                  <th>Error rate</th>
                  <th>CPU</th>
                  <th>Memory</th>
                </tr>
              </thead>
              <tbody>
                {adminServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <tr key={service.name}>
                      <td>
                        <Icon size={16} />
                        {service.name}
                      </td>
                      <td><span className="table-status">Operational</span></td>
                      <td>{service.latency}</td>
                      <td>{service.errorRate}</td>
                      <td><Meter value={service.cpu} /></td>
                      <td><Meter value={service.memory} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>

          <Panel className="deployment-panel" title="Deployment timeline" icon={GitBranch}>
            <div className="deployment-list">
              {deployments.map((deployment) => {
                const Icon = deployment.icon;
                return (
                  <div className="deployment-row" key={deployment.name}>
                    <div className={`deploy-node ${deployment.status.toLowerCase()}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <strong>{deployment.name}</strong>
                      <p>{deployment.service}</p>
                    </div>
                    <span className={`deploy-status ${deployment.status.toLowerCase()}`}>
                      {deployment.status}
                    </span>
                    <small>{deployment.time}</small>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="alerts-panel" title="Incidents & alerts" icon={ShieldAlert}>
            <div className="alert-card critical">
              <strong>P1 Database connection pool exhausted</strong>
              <p>PostgreSQL • Since 10:12 PM • Assignee: Alex D.</p>
            </div>
            <div className="alert-card warning">
              <strong>P2 High error rate on Public API</strong>
              <p>Public API • Since 09:58 PM • Assignee: Sara K.</p>
            </div>

            <div className="recent-alerts">
              <div><span className="critical-dot" /> Database replication lag high <small>8m</small></div>
              <div><span className="warning-dot" /> Worker queue depth high <small>14m</small></div>
              <div><span className="warning-dot" /> High memory usage <small>21m</small></div>
              <div><span className="info-dot" /> Deploy completed <small>1h</small></div>
            </div>
          </Panel>

          <Panel className="metrics-panel" title="Platform metrics (30 days)" icon={Gauge}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={adminMetricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis dataKey="day" stroke="#8ea3b9" fontSize={12} />
                <YAxis stroke="#8ea3b9" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle("purple")} />
                <Line type="monotone" dataKey="latency" stroke="#a855f7" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="traffic" stroke="#38bdf8" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="errors" stroke="#f472b6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="metric-summary">
              <AdminMiniMetric label="Latency P95" value="128ms" tone="purple" />
              <AdminMiniMetric label="Traffic RPS" value="2.43k" tone="blue" />
              <AdminMiniMetric label="Error rate" value="0.23%" tone="pink" />
            </div>
          </Panel>

          <Panel className="logs-panel" title="Logs & events stream" icon={TerminalSquare}>
            <div className="logs-stream">
              {logEvents.map(([time, level, service, message]) => (
                <div className="log-row" key={`${time}-${message}`}>
                  <span>{time}</span>
                  <b className={level.toLowerCase()}>{level}</b>
                  <strong>{service}</strong>
                  <p>{message}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="worker-panel" title="Worker jobs" icon={ServerCog}>
            <div className="worker-stats">
              <AdminMiniMetric label="Active" value="23" tone="green" />
              <AdminMiniMetric label="Queued" value="184" tone="yellow" />
              <AdminMiniMetric label="Failed" value="2" tone="pink" />
              <AdminMiniMetric label="Avg duration" value="452ms" tone="blue" />
            </div>

            <div className="job-list">
              {["sync-users", "send-email", "image-resize", "report-generate", "cleanup-temp"].map((job, index) => (
                <div key={job}>
                  <span>{job}</span>
                  <b className={index === 2 ? "queued" : "running"}>{index === 2 ? "Queued" : "Running"}</b>
                  <small>{index === 2 ? "—" : `${220 + index * 113}ms`}</small>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="oncall-panel" title="On-call & notifications" icon={Bell}>
            <div className="oncall-card">
              <div>
                <span>On-Call Primary</span>
                <strong>Alex D.</strong>
                <p>Until May 23, 08:00 AM UTC</p>
              </div>
              <span className="oncall-online">On Call</span>
            </div>

            <div className="telegram-card">
              <Rocket size={40} />
              <div>
                <strong>Telegram Alerts</strong>
                <p>Enabled and ready for incident notifications.</p>
              </div>
            </div>
          </Panel>
        </section>
      </section>
    </main>
  );
}

function BackgroundEffects() {
  return (
    <>
      <div className="grid-bg" />
      <div className="orb orb-green" />
      <div className="orb orb-purple" />
      <div className="orb orb-blue" />
    </>
  );
}

function EndpointRequestsChart({
  items,
}: {
  items: ApiMonitoringSummary["requests_by_endpoint"];
}) {
  const sortedItems = [...items].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...sortedItems.map((item) => item.value), 1);

  if (sortedItems.length === 0) {
    return (
      <div className="endpoint-empty">
        Waiting for Prometheus endpoint metrics...
      </div>
    );
  }

  return (
    <div className="endpoint-requests">
      {sortedItems.map((item) => {
        const width = Math.max((item.value / maxValue) * 100, 4);

        return (
          <div className="endpoint-request-row" key={item.endpoint}>
            <div className="endpoint-request-head">
              <span>{item.endpoint}</span>
              <strong>{Math.round(item.value)}</strong>
            </div>
            <div className="endpoint-request-track">
              <div
                className="endpoint-request-fill"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: string;
}) {
  return (
    <motion.article
      className={`kpi-card ${tone}`}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <div className="kpi-icon">
        <Icon size={24} />
      </div>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
        <span>{hint}</span>
      </div>
    </motion.article>
  );
}

function AdminKpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: string;
}) {
  return (
    <motion.article
      className={`admin-kpi ${tone}`}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <div className="admin-kpi-icon">
        <Icon size={26} />
      </div>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
        <span>{hint}</span>
      </div>
    </motion.article>
  );
}

function Panel({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  icon: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`panel ${className ?? ""}`}>
      <div className="panel-header">
        <div>
          <Icon size={18} />
          <h2>{title}</h2>
        </div>
        <button>View details →</button>
      </div>
      {children}
    </section>
  );
}

function ServiceCard({ service }: { service: ServiceStatus }) {
  const Icon = service.icon;

  return (
    <motion.article
      className={`service-card ${service.color}`}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <div className="service-top">
        <div className="service-name">
          <Icon size={22} />
          <h3>{service.name}</h3>
        </div>
        <span className="status-badge">
          <span />
          {service.status}
        </span>
      </div>

      <div className="service-metrics">
        <div>
          <p>Latency</p>
          <strong>{service.latency}</strong>
        </div>
        <div>
          <p>Uptime (90d)</p>
          <strong>{service.uptime}</strong>
        </div>
      </div>

      <div className="last-check">
        <History size={14} />
        Last check: {service.lastCheck}
      </div>
    </motion.article>
  );
}

function SidebarSection({
  title,
  items,
}: {
  title: string;
  items: [string, LucideIcon, boolean][];
}) {
  return (
    <div className="sidebar-section">
      <p>{title}</p>
      {items.map(([label, Icon, active]) => (
        <a className={active ? "active" : ""} key={label}>
          <Icon size={17} />
          {label}
        </a>
      ))}
    </div>
  );
}

function Meter({ value }: { value: number }) {
  return (
    <div className="meter">
      <span style={{ width: `${value}%` }} />
      <small>{value}%</small>
    </div>
  );
}

function AdminMiniMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className={`mini-metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function tooltipStyle(tone: "cyan" | "purple") {
  return {
    background: "#07111f",
    border:
      tone === "cyan"
        ? "1px solid rgba(34, 211, 238, .35)"
        : "1px solid rgba(168, 85, 247, .35)",
    borderRadius: "14px",
    color: "#e5faff",
  };
}

export default App;
