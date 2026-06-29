import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  Globe2,
  History,
  Layers3,
  Monitor,
  RadioTower,
  Rocket,
  ServerCog,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

type ServiceStatus = {
  name: string;
  icon: typeof Globe2;
  status: "Operational" | "Degraded" | "Down";
  latency: string;
  uptime: string;
  lastCheck: string;
  color: string;
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

const latencyData = [
  { day: "Feb 22", p50: 118, p95: 310, p99: 520 },
  { day: "Mar 1", p50: 122, p95: 330, p99: 540 },
  { day: "Mar 8", p50: 111, p95: 296, p99: 505 },
  { day: "Mar 15", p50: 132, p95: 350, p99: 570 },
  { day: "Mar 22", p50: 126, p95: 315, p99: 522 },
  { day: "Apr 5", p50: 168, p95: 410, p99: 760 },
  { day: "Apr 12", p50: 129, p95: 320, p99: 538 },
  { day: "Apr 19", p50: 121, p95: 305, p99: 512 },
  { day: "May 3", p50: 138, p95: 335, p99: 548 },
  { day: "May 10", p50: 127, p95: 316, p99: 526 },
  { day: "May 17", p50: 176, p95: 448, p99: 790 },
  { day: "May 22", p50: 128, p95: 328, p99: 536 },
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

function App() {
  return (
    <main className="app-shell">
      <div className="grid-bg" />
      <div className="orb orb-green" />
      <div className="orb orb-purple" />
      <div className="orb orb-blue" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">
            <Layers3 size={22} />
          </div>
          <span>LocalOps Status Platform</span>
        </div>

        <nav className="nav">
          <a className="active">Status</a>
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

      <section className="hero">
        <motion.div
          className="hero-badge"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55 }}
        >
          <ShieldCheck size={82} />
          <div className="pulse-ring" />
        </motion.div>

        <div className="hero-copy">
          <div className="system-pill">
            <span className="status-dot" />
            All Systems Operational
          </div>

          <motion.h1
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55 }}
          >
            All Systems Operational
          </motion.h1>

          <p>
            LocalOps platform is healthy and operating normally. Real-time
            status and performance for all systems and services.
          </p>

          <div className="hero-meta">
            <span>
              <Clock3 size={15} />
              Page auto-refreshes every 30s
            </span>
            <span>Last updated: May 22, 2025 10:24:30 PM UTC</span>
          </div>
        </div>
      </section>

      <section className="kpi-grid">
        <KpiCard
          icon={Gauge}
          label="Overall uptime (90d)"
          value="99.982%"
          hint="+0.021% vs previous 90 days"
          tone="green"
        />
        <KpiCard
          icon={Clock3}
          label="Average latency (90d)"
          value="128ms"
          hint="-18ms vs previous 90 days"
          tone="purple"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Active incidents"
          value="0"
          hint="No active incidents"
          tone="yellow"
        />
        <KpiCard
          icon={Rocket}
          label="Last deployment"
          value="May 22, 7:42 PM"
          hint="Deployed by ci-cd-bot"
          tone="blue"
        />
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
                <YAxis
                  domain={[99.5, 100]}
                  stroke="#8ea3b9"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#07111f",
                    border: "1px solid rgba(34, 211, 238, .35)",
                    borderRadius: "14px",
                    color: "#e5faff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="uptime"
                  stroke="#2cff9a"
                  strokeWidth={3}
                  fill="url(#uptimeGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="services-panel" title="Service status" icon={Layers3}>
          <div className="services-grid">
            {services.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        </Panel>

        <Panel className="incidents-panel" title="Incidents" icon={AlertTriangle}>
          <div className="no-incidents">
            <CheckCircle2 size={56} />
            <h3>No active incidents</h3>
            <p>Everything is running smoothly.</p>
          </div>

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

        <Panel className="latency-panel" title="Response time trends (90 days)" icon={Zap}>
          <div className="chart">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis dataKey="day" stroke="#8ea3b9" fontSize={12} />
                <YAxis stroke="#8ea3b9" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#07111f",
                    border: "1px solid rgba(168, 85, 247, .35)",
                    borderRadius: "14px",
                    color: "#e5faff",
                  }}
                />
                <Line type="monotone" dataKey="p50" stroke="#38bdf8" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="p95" stroke="#a855f7" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="p99" stroke="#f472b6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="legend">
            <span className="legend-item cyan">p50</span>
            <span className="legend-item purple">p95</span>
            <span className="legend-item pink">p99</span>
          </div>
        </Panel>
      </section>
    </main>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Gauge;
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

function Panel({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  icon: typeof Activity;
  className?: string;
  children: React.ReactNode;
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

export default App;