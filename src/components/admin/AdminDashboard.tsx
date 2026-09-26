import React, { useState, useMemo } from 'react';
import { AdminAnalytics, Order, DailyTrend } from '../../types/index.ts';
import {
  Scissors,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  IndianRupee,
  Layers,
  ArrowRight,
  TrendingUp,
  Eye,
  BarChart3,
  Calendar,
  Activity,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface AdminDashboardProps {
  analytics: AdminAnalytics | null;
  onNavigateToOrders: () => void;
  onNavigateToDesigns: () => void;
  onNavigateToSecurity?: () => void;
  onSelectOrder: (order: Order) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DailyTrend;
    return (
      <div className="bg-[#2B2320] text-[#FDFBF7] p-3.5 rounded-xl shadow-2xl border border-[#E5C158]/50 text-xs min-w-[210px] backdrop-blur-md">
        <div className="border-b border-[#EADBCE]/20 pb-2 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#E5C158]" />
            <span className="font-semibold text-[#E5C158]">{data.displayDate}</span>
            <span className="text-[10px] text-[#A89886] font-medium">({data.shortDay})</span>
          </div>
          <span className="text-[10px] text-[#A89886] font-mono">{data.date}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#D8C7B5] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5C158]"></span>
              Sewing Orders:
            </span>
            <span className="font-bold text-white text-sm bg-white/10 px-2 py-0.5 rounded">
              {data.orders} {data.orders === 1 ? 'order' : 'orders'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[#D8C7B5] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Booking Value:
            </span>
            <span className="font-semibold text-emerald-300">
              ₹{Number(data.revenue || 0).toLocaleString('en-IN')}
            </span>
          </div>

          {data.completed !== undefined && (
            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-[#EADBCE]/15">
              <span className="text-[#A89886] text-[11px] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Completed Fits:
              </span>
              <span className="font-medium text-blue-300">
                {data.completed}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  analytics,
  onNavigateToOrders,
  onNavigateToDesigns,
  onNavigateToSecurity,
  onSelectOrder,
}) => {
  const [metricView, setMetricView] = useState<'volume' | 'revenue' | 'comparison'>('volume');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Compute or fallback trends data
  const trendData: DailyTrend[] = useMemo(() => {
    if (analytics?.orderTrends && analytics.orderTrends.length > 0) {
      return analytics.orderTrends;
    }

    // Fallback: build 30 days
    const fallback: DailyTrend[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      fallback.push({
        date: d.toISOString().split('T')[0],
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        shortDay: d.toLocaleDateString('en-US', { weekday: 'short' }),
        orders: 0,
        revenue: 0,
        completed: 0,
      });
    }
    return fallback;
  }, [analytics?.orderTrends]);

  const trends30Summary = useMemo(() => {
    if (analytics?.trends30Days) {
      return analytics.trends30Days;
    }
    const totalVol = trendData.reduce((acc, d) => acc + d.orders, 0);
    const totalRev = trendData.reduce((acc, d) => acc + d.revenue, 0);
    let maxOrders = 0;
    let maxDate = 'N/A';
    trendData.forEach((d) => {
      if (d.orders > maxOrders) {
        maxOrders = d.orders;
        maxDate = d.displayDate;
      }
    });

    return {
      totalVolume: totalVol,
      totalRevenue: totalRev,
      avgDailyOrders: parseFloat((totalVol / 30).toFixed(1)),
      peakVolume: maxOrders,
      peakDate: maxDate,
    };
  }, [analytics?.trends30Days, trendData]);

  if (!analytics) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#6E1423] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#8A7968] mt-2">Loading atelier metrics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${Number(analytics.totalRevenue || 0).toLocaleString('en-IN')}`,
      sub: 'All booked sewing orders',
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      title: 'Total Sewing Orders',
      value: analytics.totalOrders,
      sub: `${analytics.pendingOrders} pending confirmation`,
      icon: ShoppingBag,
      color: 'bg-[#FCF8EC] text-[#8C6D1F] border-[#E5C158]',
    },
    {
      title: 'Active Tailoring',
      value: analytics.sewingInProgress,
      sub: 'In cutting / stitching queue',
      icon: Clock,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      title: 'Completed Fits',
      value: analytics.completedOrders,
      sub: 'Delivered to clients',
      icon: CheckCircle2,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      title: 'Catalog Designs',
      value: analytics.totalDesigns,
      sub: `${analytics.activeDesigns} currently live`,
      icon: Scissors,
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    {
      title: 'Total Clients',
      value: analytics.totalCustomers,
      sub: 'Registered boutique patrons',
      icon: Users,
      color: 'bg-rose-50 text-rose-800 border-rose-200',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-[#6E1423] text-white p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#E5C158] font-bold">
            Atelier Management Overview
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1 text-[#FDFBF7]">
            Welcome Back, Master Sangeeta
          </h2>
          <p className="text-xs text-[#F4EDE4] font-light mt-1">
            Real-time status of bespoke orders, fitting queues, and atelier performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToSecurity && (
            <button
              onClick={onNavigateToSecurity}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-white/20 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#E5C158]" />
              <span>Security & Password</span>
            </button>
          )}
          <button
            onClick={onNavigateToOrders}
            className="px-4 py-2.5 bg-[#E5C158] hover:bg-[#d6af45] text-[#2B2320] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Manage All Orders
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between ${c.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">{c.title}</span>
                <Icon className="w-4 h-4 opacity-75" />
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold block">
                  {c.value}
                </span>
                <span className="text-[10px] opacity-80 block truncate mt-0.5">
                  {c.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 30-Day Order Volume Trends Section */}
      <div className="bg-white rounded-2xl border border-[#EADBCE] shadow-xs p-6 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EADBCE]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#FCF8EC] text-[#8C6D1F] border border-[#E5C158] rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="font-serif text-xl font-bold text-[#6E1423]">
                Order Volume & Demand Trends
              </h3>
            </div>
            <p className="text-xs text-[#8A7968] mt-1">
              Visualizing custom tailoring order volume and booking velocity over the last 30 days
            </p>
          </div>

          {/* Metric & Chart Type Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Selector Tabs */}
            <div className="inline-flex p-1 bg-[#F9F6F0] rounded-xl border border-[#EADBCE]">
              <button
                type="button"
                onClick={() => setMetricView('volume')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  metricView === 'volume'
                    ? 'bg-[#6E1423] text-white shadow-xs'
                    : 'text-[#6A5E57] hover:text-[#2B2320]'
                }`}
              >
                Order Volume
              </button>
              <button
                type="button"
                onClick={() => setMetricView('revenue')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  metricView === 'revenue'
                    ? 'bg-[#6E1423] text-white shadow-xs'
                    : 'text-[#6A5E57] hover:text-[#2B2320]'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                type="button"
                onClick={() => setMetricView('comparison')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  metricView === 'comparison'
                    ? 'bg-[#6E1423] text-white shadow-xs'
                    : 'text-[#6A5E57] hover:text-[#2B2320]'
                }`}
              >
                Orders vs Completed
              </button>
            </div>

            {/* Chart Style Toggle */}
            <div className="inline-flex p-1 bg-[#F9F6F0] rounded-xl border border-[#EADBCE]">
              <button
                type="button"
                onClick={() => setChartType('area')}
                title="Area Smooth Curve"
                className={`p-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                  chartType === 'area'
                    ? 'bg-white text-[#6E1423] shadow-xs'
                    : 'text-[#8A7968] hover:text-[#2B2320]'
                }`}
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                title="Bar Chart"
                className={`p-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                  chartType === 'bar'
                    ? 'bg-white text-[#6E1423] shadow-xs'
                    : 'text-[#8A7968] hover:text-[#2B2320]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 30-Day Insight Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FDFBF7] p-4 rounded-xl border border-[#EADBCE]">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-[#8A7968] block">30-Day Volume</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold text-[#6E1423]">
                {trends30Summary.totalVolume}
              </span>
              <span className="text-xs text-[#8A7968]">orders</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-[#8A7968] block">30-Day Sewing Value</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold text-emerald-800">
                ₹{Number(trends30Summary.totalRevenue).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-[#8A7968] block">Daily Average</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold text-[#2B2320]">
                {trends30Summary.avgDailyOrders}
              </span>
              <span className="text-xs text-[#8A7968]">fits / day</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-[#8A7968] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              Peak Demand Day
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold text-[#C59B27]">
                {trends30Summary.peakVolume}
              </span>
              <span className="text-xs text-[#8A7968]">
                {trends30Summary.peakDate ? `(${trends30Summary.peakDate})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Visual Container */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="orderVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6E1423" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6E1423" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C59B27" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#C59B27" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EADBCE" opacity={0.6} />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: '#8A7968' }}
                  tickLine={false}
                  axisLine={{ stroke: '#EADBCE' }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#8A7968' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (metricView === 'revenue' ? `₹${val}` : `${val}`)}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', color: '#6A5E57' }}
                />

                {metricView === 'volume' && (
                  <Area
                    type="monotone"
                    dataKey="orders"
                    name="Orders Received"
                    stroke="#6E1423"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#orderVolumeGradient)"
                    activeDot={{ r: 6, fill: '#E5C158', stroke: '#6E1423', strokeWidth: 2 }}
                  />
                )}

                {metricView === 'revenue' && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Daily Booking Value (₹)"
                    stroke="#C59B27"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                    activeDot={{ r: 6, fill: '#6E1423', stroke: '#E5C158', strokeWidth: 2 }}
                  />
                )}

                {metricView === 'comparison' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="orders"
                      name="Orders Inflow"
                      stroke="#6E1423"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#orderVolumeGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      name="Fits Completed"
                      stroke="#2563EB"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#completedGradient)"
                    />
                  </>
                )}
              </AreaChart>
            ) : (
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EADBCE" opacity={0.6} />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: '#8A7968' }}
                  tickLine={false}
                  axisLine={{ stroke: '#EADBCE' }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#8A7968' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (metricView === 'revenue' ? `₹${val}` : `${val}`)}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="rect"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', color: '#6A5E57' }}
                />

                {metricView === 'volume' && (
                  <Bar
                    dataKey="orders"
                    name="Orders Received"
                    fill="#6E1423"
                    radius={[4, 4, 0, 0]}
                  />
                )}

                {metricView === 'revenue' && (
                  <Bar
                    dataKey="revenue"
                    name="Daily Booking Value (₹)"
                    fill="#C59B27"
                    radius={[4, 4, 0, 0]}
                  />
                )}

                {metricView === 'comparison' && (
                  <>
                    <Bar
                      dataKey="orders"
                      name="Orders Inflow"
                      fill="#6E1423"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="completed"
                      name="Fits Completed"
                      fill="#2563EB"
                      radius={[4, 4, 0, 0]}
                    />
                  </>
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Trend Footer Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8A7968] pt-3 border-t border-[#EADBCE]/80">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Data continuously synchronized with live atelier customer submissions
          </span>
          <span className="font-mono text-[#6A5E57] mt-1 sm:mt-0">
            Window: {trendData[0]?.displayDate} — {trendData[trendData.length - 1]?.displayDate}
          </span>
        </div>
      </div>

      {/* Category Breakdown & Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-[#EADBCE] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#6E1423] border-b border-[#EADBCE] pb-2">
            Orders by Silhouette Category
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.categoryStats).length > 0 ? (
              Object.entries(analytics.categoryStats).map(([cat, count]) => {
                const pct = Math.round((count / (analytics.totalOrders || 1)) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#2B2320]">{cat}</span>
                      <span className="text-[#8A7968]">{count} orders ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#F4EDE4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6E1423] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#8A7968]">No order distribution data yet.</p>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-[#EADBCE] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#6E1423] border-b border-[#EADBCE] pb-2">
            Tailoring Workflow Distribution
          </h3>
          <div className="space-y-2.5">
            {Object.entries(analytics.statusStats).length > 0 ? (
              Object.entries(analytics.statusStats).map(([stat, count]) => (
                <div
                  key={stat}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#FDFBF7] border border-[#EADBCE] text-xs"
                >
                  <span className="font-medium text-[#2B2320]">{stat}</span>
                  <span className="font-bold text-[#6E1423] bg-[#FCF8EC] px-2 py-0.5 rounded border border-[#E5C158]/50">
                    {count} items
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8A7968]">No workflow statistics available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-[#EADBCE] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#EADBCE] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#6E1423]">
              Recent Customer Sewing Orders
            </h3>
            <p className="text-xs text-[#8A7968]">
              Latest custom measurement submissions from the website
            </p>
          </div>
          <button
            onClick={onNavigateToOrders}
            className="text-xs font-semibold text-[#6E1423] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F6F0] text-[#6A5E57] uppercase tracking-wider font-semibold border-b border-[#EADBCE]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Design Silhouette</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {analytics.recentOrders && analytics.recentOrders.length > 0 ? (
                analytics.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#6E1423]">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#2B2320] block">{ord.customerName}</span>
                      <span className="text-[11px] text-[#8A7968]">{ord.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#2B2320] block">{ord.designName}</span>
                      <span className="text-[11px] text-[#C59B27]">{ord.designCode} • {ord.designCategory}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#2B2320]">
                      ₹{Number(ord.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-[#8A7968]">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'New Order'
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : ord.status === 'Confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-[#FCF8EC] text-[#8C6D1F] border border-[#E5C158]'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectOrder(ord)}
                        className="px-3 py-1.5 bg-[#F9F6F0] hover:bg-[#6E1423] hover:text-white border border-[#EADBCE] text-[#2B2320] rounded text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#8A7968]">
                    No orders recorded yet. Place an order on the public website to see it appear immediately!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

