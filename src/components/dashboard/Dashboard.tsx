import React, { useEffect, useState } from 'react';
import { MonitoringService } from '../../services';
import { Activity, Database, Server, Cpu, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export const Dashboard = () => {
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hRes = await MonitoringService.getHealth();
        setHealth(hRes);
        const sRes = await MonitoringService.getStats();
        setStats(sRes);
      } catch (e) {
        console.error("Failed to fetch dashboard data");
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const statCards = [
    { name: 'System Status', value: health?.status || 'Unknown', icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { name: 'Uptime', value: health ? formatUptime(health.uptime) : '0h 0m', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Requests / Min', value: stats?.requestsPerMinute || 0, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Avg Latency', value: `${stats?.averageLatencyMs || 0}ms`, icon: Cpu, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Real-time monitoring of Navix AI Engines</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#121212] p-5 rounded-xl border border-white/10 flex items-start gap-4 hover:border-white/20 transition-colors"
          >
            <div className={clsx("p-3 rounded-lg", stat.bg)}>
              <stat.icon className={clsx("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">{stat.name}</p>
              <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#121212] p-6 rounded-xl border border-white/10"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-[#00E5FF]" />
            Engine Status
          </h2>
          <div className="space-y-4">
            {health?.services && Object.entries(health.services).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-white/5">
                <span className="text-sm font-medium text-gray-300 capitalize">{key} Engine</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {String(val)}
                </span>
              </div>
            ))}
            {!health && (
              <div className="animate-pulse flex flex-col gap-3">
                <div className="h-10 bg-white/5 rounded-lg w-full"></div>
                <div className="h-10 bg-white/5 rounded-lg w-full"></div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#121212] p-6 rounded-xl border border-white/10 flex items-center justify-center min-h-[300px]"
        >
           <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00E5FF]/20 to-[#BD00FF]/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                 <Activity className="w-8 h-8 text-[#00E5FF]" />
              </div>
              <h3 className="text-lg font-medium text-white">Analytics Engine</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-[250px]">
                 Real-time charting modules will be initialized here once vector data is ingested.
              </p>
           </div>
        </motion.div>
      </div>
    </div>
  );
};
