import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { Customer, Order } from '../../types/index.ts';
import { Users, Search, Phone, Mail, MapPin, Eye, ShoppingBag, X } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSelectCustomer = async (cust: Customer) => {
    setLoadingDetail(true);
    try {
      const detail = await api.getAdminCustomerDetail(cust.id);
      setSelectedCustomer(detail);
    } catch (err) {
      console.error('Failed to load customer details:', err);
      setSelectedCustomer(cust);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#6E1423]">
            Customer Directory & Fitting History
          </h2>
          <p className="text-xs text-[#8A7968]">
            Registered patrons, tailoring orders history, and individual fitting notes
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-[#EADBCE] shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A7968] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, phone number, city..."
            className="w-full pl-9 pr-4 py-2 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg text-xs focus:border-[#6E1423] focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-[#EADBCE] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F6F0] text-[#6A5E57] uppercase tracking-wider font-semibold border-b border-[#EADBCE]">
              <tr>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Total Orders</th>
                <th className="py-3 px-4 text-center">Completed</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#8A7968]">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#6E1423] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {cust.name[0]}
                        </div>
                        <span className="font-bold text-[#2B2320]">{cust.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#6E1423]">
                      {cust.phone}
                    </td>
                    <td className="py-3.5 px-4 text-[#8A7968]">
                      {cust.email || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-[#2B2320]">
                      {cust.city || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#2B2320]">
                      {cust.totalOrders || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                      {cust.completedOrders || 0}
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-[#6E1423]">
                      ₹{Number(cust.totalSpent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSelectCustomer(cust)}
                        className="px-3 py-1.5 bg-[#F9F6F0] hover:bg-[#6E1423] hover:text-white border border-[#EADBCE] rounded text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Order History</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#8A7968]">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[#FDFBF7] rounded-2xl shadow-xl border border-[#EADBCE] overflow-hidden">
            <div className="bg-[#6E1423] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#E5C158]">
                  Client Profile
                </span>
                <h3 className="font-serif text-xl font-bold text-[#FDFBF7]">
                  {selectedCustomer.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs">
              {/* Contact Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-[#EADBCE]">
                <div>
                  <span className="text-[#8A7968] block">Phone:</span>
                  <a href={`tel:${selectedCustomer.phone}`} className="font-semibold text-[#6E1423]">
                    {selectedCustomer.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[#8A7968] block">Email:</span>
                  <span className="font-semibold text-[#2B2320]">
                    {selectedCustomer.email || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A7968] block">City:</span>
                  <span className="font-semibold text-[#2B2320]">
                    {selectedCustomer.city || 'None'}
                  </span>
                </div>
                {selectedCustomer.address && (
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-[#8A7968] block">Delivery Address:</span>
                    <span className="font-semibold text-[#2B2320]">
                      {selectedCustomer.address}
                    </span>
                  </div>
                )}
                {selectedCustomer.notes && (
                  <div className="col-span-2 sm:col-span-3 pt-2 border-t border-[#EADBCE]">
                    <span className="text-[#8A7968] block">Fitting Notes:</span>
                    <span className="italic text-[#6A5E57]">{selectedCustomer.notes}</span>
                  </div>
                )}
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h4 className="font-serif text-base font-bold text-[#6E1423] border-b border-[#EADBCE] pb-1">
                  Complete Order History ({selectedCustomer.orders?.length || 0})
                </h4>

                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 bg-white rounded-lg border border-[#EADBCE] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={ord.designImage || '/images/bridal-blouse-red.jpg'}
                            alt=""
                            className="w-10 h-12 object-cover rounded border"
                          />
                          <div>
                            <span className="font-mono font-bold text-[#6E1423] block text-[11px]">
                              {ord.orderNumber}
                            </span>
                            <span className="font-semibold text-[#2B2320] block">
                              {ord.designName}
                            </span>
                            <span className="text-[10px] text-[#8A7968]">
                              {ord.designCategory} • Fit: {ord.sizeType}
                            </span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="font-serif font-bold text-sm block text-[#2B2320]">
                            ₹{Number(ord.totalAmount).toLocaleString('en-IN')}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#FCF8EC] text-[#8C6D1F] border border-[#E5C158]">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8A7968] italic">No historical orders found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
