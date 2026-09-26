import React, { useState } from 'react';
import {
  LayoutDashboard,
  Scissors,
  Layers,
  ShoppingBag,
  Users,
  Globe,
  LogOut,
  Bell,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Order } from '../../types/index.ts';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onViewWebsite: () => void;
  user: any;
  pendingOrdersCount: number;
  recentNewOrders: Order[];
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  onViewWebsite,
  user,
  pendingOrdersCount,
  recentNewOrders,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Sewing Orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'designs', label: 'Design Catalog', icon: Scissors },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'content', label: 'Website CMS', icon: Globe },
    { id: 'security', label: 'Security & Password', icon: ShieldCheck },
  ];

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F2EB] flex flex-col lg:flex-row text-[#2B2320]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#2B2320] text-[#FDFBF7] shrink-0 border-r border-[#4A3E39]">
        {/* Brand */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6E1423] text-[#E5C158] flex items-center justify-center border border-[#E5C158]/40 shadow-xs">
            <Scissors className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-white tracking-wide">
              Sangeeta CMS
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-[#E5C158] block">
              Atelier Management
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#6E1423] text-white shadow-xs'
                    : 'text-[#C5B7AA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#E5C158] text-[#2B2320]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={onViewWebsite}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs text-[#C5B7AA] hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#E5C158]" />
            <span>Open Public Website</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          {/* User badge */}
          <button
            onClick={() => handleTabClick('security')}
            title="Click to manage password and security settings"
            className="w-full pt-2 border-t border-white/5 flex items-center gap-2.5 px-2 text-xs text-left hover:bg-white/5 rounded-lg transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-[#6E1423] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:ring-2 group-hover:ring-[#E5C158]">
              {user?.name?.[0] || 'S'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-semibold text-white truncate text-xs group-hover:text-[#E5C158] transition-colors">
                {user?.name || 'Sangeeta Kashyap'}
              </p>
              <p className="text-[10px] text-[#8A7968] truncate">
                {user?.email || 'ankushsinghkashyap34@gmail.com'}
              </p>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-[#E5C158] opacity-60 group-hover:opacity-100 shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#EADBCE] h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-[#2B2320] hover:bg-[#F4EDE4] rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#6E1423] capitalize">
              {navItems.find((n) => n.id === currentTab)?.label || 'Boutique CMS'}
            </h1>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-3 relative">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-[#2B2320] hover:bg-[#F9F6F0] rounded-full transition-colors relative cursor-pointer"
                title="View recent orders"
              >
                <Bell className="w-5 h-5" />
                {pendingOrdersCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#EADBCE] overflow-hidden z-50 animate-fade-in">
                  <div className="p-3.5 bg-[#6E1423] text-white flex items-center justify-between text-xs font-semibold">
                    <span>Recent Customer Sewing Orders</span>
                    <span className="text-[10px] bg-[#E5C158] text-[#2B2320] px-2 py-0.5 rounded-full">
                      {recentNewOrders.length} New
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#EADBCE]/60">
                    {recentNewOrders.length > 0 ? (
                      recentNewOrders.map((ord) => (
                        <div
                          key={ord.id}
                          onClick={() => {
                            setShowNotifications(false);
                            onSelectTab('orders');
                          }}
                          className="p-3 hover:bg-[#FDFBF7] cursor-pointer text-xs space-y-1 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[#6E1423]">
                              {ord.orderNumber}
                            </span>
                            <span className="text-[10px] text-[#8A7968]">
                              {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Today'}
                            </span>
                          </div>
                          <p className="font-semibold text-[#2B2320]">
                            {ord.customerName} — {ord.designName}
                          </p>
                          <div className="flex justify-between text-[11px] text-[#8A7968]">
                            <span>Category: {ord.designCategory}</span>
                            <strong className="text-[#6E1423]">₹{Number(ord.totalAmount).toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[#8A7968]">
                        No pending unread orders at this moment.
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-[#F9F6F0] border-t border-[#EADBCE] text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onSelectTab('orders');
                      }}
                      className="text-xs font-semibold text-[#6E1423] hover:underline cursor-pointer"
                    >
                      View All Orders in Orders Manager →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onViewWebsite}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F9F6F0] hover:bg-[#ECE4D8] border border-[#EADBCE] rounded-lg text-xs font-semibold text-[#2B2320] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>Public Store</span>
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-black/60 flex">
            <div className="w-64 bg-[#2B2320] text-white flex flex-col h-full p-4 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="font-serif font-bold text-lg text-white">Sangeeta CMS</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-white/70 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="py-4 space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                        isActive ? 'bg-[#6E1423] text-white' : 'text-[#C5B7AA] hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#E5C158] text-[#2B2320]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    onViewWebsite();
                  }}
                  className="w-full py-2 text-xs text-[#C5B7AA] hover:text-white flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-[#E5C158]" />
                  <span>View Public Website</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full py-2 text-xs text-red-300 hover:text-red-200 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
