import React, { useState, useEffect } from 'react';
import { api, authStorage } from './api/client.ts';
import { Design, Category, WebsiteContent, AdminAnalytics, Order } from './types/index.ts';

// SEO & Metadata Dynamic Injection
import { SEOHead } from './components/SEOHead.tsx';

// Public Components
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { CategoriesSection } from './components/CategoriesSection.tsx';
import { FeaturedDesigns } from './components/FeaturedDesigns.tsx';
import { DesignGallery } from './components/DesignGallery.tsx';
import { DesignModal } from './components/DesignModal.tsx';
import { OrderModal } from './components/OrderModal.tsx';
import { OrderTracking } from './components/OrderTracking.tsx';
import { WhyChooseUs } from './components/WhyChooseUs.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { Testimonials } from './components/Testimonials.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { Footer } from './components/Footer.tsx';

// Admin CMS Components
import { AdminLogin } from './components/admin/AdminLogin.tsx';
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminOrders } from './components/admin/AdminOrders.tsx';
import { AdminDesigns } from './components/admin/AdminDesigns.tsx';
import { AdminCategories } from './components/admin/AdminCategories.tsx';
import { AdminCustomers } from './components/admin/AdminCustomers.tsx';
import { AdminContentCMS } from './components/admin/AdminContentCMS.tsx';
import { AdminOrderDetailModal } from './components/admin/AdminOrderDetailModal.tsx';
import { AdminSecurity } from './components/admin/AdminSecurity.tsx';

export default function App() {
  // Public vs Admin routing
  const [currentView, setCurrentView] = useState<'home' | 'designs' | 'about' | 'contact' | 'track' | 'admin-login' | 'admin-dashboard'>('home');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'orders' | 'designs' | 'categories' | 'customers' | 'content' | 'security'>('dashboard');

  // Data states
  const [designs, setDesigns] = useState<Design[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState<WebsiteContent>({});
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [adminUser, setAdminUser] = useState<any>(authStorage.getUser());
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Sub-views
  const [selectedDesignModal, setSelectedDesignModal] = useState<Design | null>(null);
  const [selectedDesignForOrder, setSelectedDesignForOrder] = useState<Design | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedOrderForAdmin, setSelectedOrderForAdmin] = useState<Order | null>(null);

  // Active category filter for DesignGallery
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('all');

  // Pre-filled tracking query
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');
  const [trackingPhone, setTrackingPhone] = useState('');

  // Live notification banner
  const [orderToast, setOrderToast] = useState<{ message: string; orderNumber: string } | null>(null);

  // Load primary data
  const loadInitialData = async () => {
    try {
      const [cats, des, cnt] = await Promise.all([
        api.getCategories(),
        api.getDesigns(),
        api.getContent(),
      ]);
      setCategories(cats);
      setDesigns(des);
      setContent(cnt);

      // Check URL parameters for direct deep-linking (SEO canonical navigation)
      try {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        const categoryParam = params.get('category');
        const designParam = params.get('design') || (window.location.hash.startsWith('#design-') ? window.location.hash.replace('#design-', '') : null);

        if (viewParam && ['home', 'designs', 'about', 'contact', 'track', 'admin-login'].includes(viewParam)) {
          setCurrentView(viewParam as any);
        }
        if (categoryParam) {
          setGalleryCategoryFilter(categoryParam);
          setCurrentView('designs');
        }
        if (designParam) {
          const found = des.find(
            (d) => d.designCode.toLowerCase() === designParam.toLowerCase() || d.slug?.toLowerCase() === designParam.toLowerCase()
          );
          if (found) {
            setSelectedDesignModal(found);
          }
        }
      } catch {
        // ignore in non-browser env
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load analytics when in admin view
  const loadAnalytics = async () => {
    if (!adminUser) return;
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (adminUser && currentView === 'admin-dashboard') {
      loadAnalytics();
    }
  }, [adminUser, currentView, adminTab]);

  // Navigation handler
  const handleNavigate = (view: string, category?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedDesignModal(null);

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('design');
      if (view === 'home' && !category) {
        url.searchParams.delete('view');
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('view', view);
        if (category) {
          url.searchParams.set('category', category);
        } else {
          url.searchParams.delete('category');
        }
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }

    if (category) {
      setGalleryCategoryFilter(category);
      setCurrentView('designs');
    } else {
      if (view === 'designs' && !category) {
        setGalleryCategoryFilter('all');
      }
      setCurrentView(view as any);
    }
  };

  // Design modal open & close with URL synchronization
  const handleOpenDesignDetails = (design: Design) => {
    setSelectedDesignModal(design);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('design', design.designCode);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  const handleCloseDesignDetails = () => {
    setSelectedDesignModal(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('design');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  // Order workflow triggers
  const handleOpenOrderForDesign = (design: Design) => {
    setSelectedDesignForOrder(design);
    setIsOrderModalOpen(true);
  };

  const handleGeneralBookSewing = () => {
    setSelectedDesignForOrder(designs.length > 0 ? designs[0] : null);
    setIsOrderModalOpen(true);
  };

  const handleOrderSubmitted = (newOrder: Order) => {
    // Show toast
    setOrderToast({
      message: `Sewing Order Placed: #${newOrder.orderNumber} for ${newOrder.customerName}`,
      orderNumber: newOrder.orderNumber,
    });
    // Refresh analytics and designs
    loadInitialData();
    if (adminUser) {
      loadAnalytics();
    }
    setTimeout(() => setOrderToast(null), 8000);
  };

  const handleNavigateToTrackingFromOrder = (orderNum: string, ph: string) => {
    setTrackingOrderNumber(orderNum);
    setTrackingPhone(ph);
    setCurrentView('track');
  };

  // Admin login success
  const handleAdminLoginSuccess = (user: any) => {
    setAdminUser(user);
    setCurrentView('admin-dashboard');
    loadAnalytics();
  };

  const handleAdminLogout = async () => {
    await api.logout();
    setAdminUser(null);
    setCurrentView('home');
  };

  // Calculate pending orders for Admin bell/badge
  const pendingOrdersCount = analytics ? analytics.pendingOrders : 0;
  const recentOrders = analytics ? analytics.recentOrders : [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-[#2B2320]">
      {/* Dynamic SEO Meta Tags, Canonical URLs, and Schema.org JSON-LD */}
      <SEOHead
        currentView={currentView}
        selectedDesign={selectedDesignModal}
        activeCategory={galleryCategoryFilter}
        content={content}
      />

      {/* Toast Notification */}
      {orderToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#6E1423] text-white px-5 py-3 rounded-xl shadow-2xl border border-[#E5C158] flex items-center gap-3 animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5C158] animate-ping" />
          <div className="text-xs">
            <strong className="block font-serif text-sm text-[#E5C158]">New Sewing Order Dispatched</strong>
            <span>{orderToast.message}</span>
          </div>
          <button
            onClick={() => setOrderToast(null)}
            className="ml-2 text-white/70 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ADMIN CMS PORTAL */}
      {currentView === 'admin-dashboard' && adminUser ? (
        <AdminLayout
          currentTab={adminTab}
          onSelectTab={(tab) => setAdminTab(tab as any)}
          onLogout={handleAdminLogout}
          onViewWebsite={() => setCurrentView('home')}
          user={adminUser}
          pendingOrdersCount={pendingOrdersCount}
          recentNewOrders={recentOrders}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboard
              analytics={analytics}
              onNavigateToOrders={() => setAdminTab('orders')}
              onNavigateToDesigns={() => setAdminTab('designs')}
              onNavigateToSecurity={() => setAdminTab('security')}
              onSelectOrder={(ord) => setSelectedOrderForAdmin(ord)}
            />
          )}

          {adminTab === 'orders' && <AdminOrders />}

          {adminTab === 'designs' && (
            <AdminDesigns
              categories={categories}
              onRefreshData={() => {
                loadInitialData();
                loadAnalytics();
              }}
            />
          )}

          {adminTab === 'categories' && (
            <AdminCategories
              categories={categories}
              onRefresh={() => {
                loadInitialData();
              }}
            />
          )}

          {adminTab === 'customers' && <AdminCustomers />}

          {adminTab === 'content' && (
            <AdminContentCMS
              onContentUpdated={() => {
                loadInitialData();
              }}
            />
          )}

          {adminTab === 'security' && (
            <AdminSecurity
              onCredentialsUpdated={(newEmail) => {
                setAdminUser((prev: any) => ({ ...prev, email: newEmail }));
              }}
            />
          )}

          {/* Admin Order Drawer Modal */}
          {selectedOrderForAdmin && (
            <AdminOrderDetailModal
              orderId={selectedOrderForAdmin.id}
              onClose={() => setSelectedOrderForAdmin(null)}
              onOrderUpdated={() => {
                loadAnalytics();
              }}
            />
          )}
        </AdminLayout>
      ) : currentView === 'admin-login' ? (
        /* ADMIN LOGIN PAGE */
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onBackToWebsite={() => setCurrentView('home')}
        />
      ) : (
        /* PUBLIC CUSTOMER WEBSITE */
        <>
          <Navbar
            content={content}
            onNavigate={handleNavigate}
            currentView={currentView}
            onOpenOrderModal={handleGeneralBookSewing}
            onOpenTrackModal={() => setCurrentView('track')}
            isAdminLoggedIn={Boolean(adminUser)}
          />

          <main className="flex-1">
            {/* View: Home */}
            {currentView === 'home' && (
              <>
                <Hero
                  content={content}
                  onExploreDesigns={() => handleNavigate('designs')}
                  onBookSewing={handleGeneralBookSewing}
                />

                <CategoriesSection
                  categories={categories}
                  onSelectCategory={(catName) => handleNavigate('designs', catName)}
                />

                <FeaturedDesigns
                  designs={designs}
                  onViewDetails={handleOpenDesignDetails}
                  onOrderSewing={handleOpenOrderForDesign}
                  onViewAll={() => handleNavigate('designs')}
                />

                <WhyChooseUs />

                <AboutSection
                  content={content}
                  onBookSewing={handleGeneralBookSewing}
                />

                <Testimonials />

                <ContactSection content={content} />
              </>
            )}

            {/* View: Designs Gallery */}
            {currentView === 'designs' && (
              <DesignGallery
                designs={designs}
                categories={categories}
                initialCategory={galleryCategoryFilter}
                onViewDetails={handleOpenDesignDetails}
                onOrderSewing={handleOpenOrderForDesign}
              />
            )}

            {/* View: Order Tracking */}
            {currentView === 'track' && (
              <OrderTracking
                initialOrderNumber={trackingOrderNumber}
                initialPhone={trackingPhone}
                onClose={() => setCurrentView('home')}
              />
            )}

            {/* View: About */}
            {currentView === 'about' && (
              <div className="pt-8">
                <AboutSection
                  content={content}
                  onBookSewing={handleGeneralBookSewing}
                />
                <WhyChooseUs />
                <Testimonials />
              </div>
            )}

            {/* View: Contact */}
            {currentView === 'contact' && (
              <div className="pt-8">
                <ContactSection content={content} />
              </div>
            )}
          </main>

          {/* Design Details Modal */}
          {selectedDesignModal && (
            <DesignModal
              design={selectedDesignModal}
              onClose={handleCloseDesignDetails}
              onOrderThisDesign={handleOpenOrderForDesign}
            />
          )}

          {/* Sewing Order Wizard Modal */}
          {isOrderModalOpen && (
            <OrderModal
              initialDesign={selectedDesignForOrder}
              designs={designs}
              onClose={() => setIsOrderModalOpen(false)}
              onOrderSuccess={handleOrderSubmitted}
              onNavigateToTracking={handleNavigateToTrackingFromOrder}
            />
          )}

          <Footer
            content={content}
            categories={categories}
            onNavigate={handleNavigate}
            onOpenOrderModal={handleGeneralBookSewing}
            onOpenTrackModal={() => setCurrentView('track')}
          />
        </>
      )}
    </div>
  );
}
