import { useState, useEffect } from 'react';
import { ShoppingCart, FileText, Plus, Search, RefreshCw, X, MoreHorizontal, Check, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const API_BASE = 'https://sit.sell.backend.nguyenbinh.info.vn/api/sell';

interface Order {
  id: string;
  orderCode: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  customerId: string;
  notes: string;
  totalPricePaid: number;
  fullName: string;
}

const initialForm = {
  fullName: '',
  tell: '',
  totalPricePaid: 0,
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'bills'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sell_token');
      const res = await fetch(`${API_BASE}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const resObj = await res.json();
        const data = resObj.data || resObj.Data || [];
        if (data.length > 0) {
          setOrders(data);
        } else {
          setOrders(mockOrders);
        }
      } else {
        // Fallback to mock data if API is not fully seeded yet
        setOrders(mockOrders);
      }
    } catch (e) {
      setOrders(mockOrders);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('sell_token');
      const res = await fetch(`${API_BASE}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerId: 0,
          totalPrice: formData.totalPricePaid,
          totalPriceDiscount: 0,
          totalPricePaid: formData.totalPricePaid,
          shippingAddress: "Tại quầy",
          tell: formData.tell,
          fullName: formData.fullName,
          email: "",
          paymentMethod: 1,
          promotion: ""
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData(initialForm);
        fetchOrders();
      } else {
        alert("Có lỗi xảy ra khi tạo đơn hàng!");
      }
    } catch (e) {
      alert("Lỗi kết nối Server");
    }
    setIsSubmitting(false);
  };

  const handleCancelOrder = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    try {
      const token = localStorage.getItem('sell_token');
      const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (e) {
      alert("Lỗi kết nối Server");
    }
  };

  const getStatusBadge = (status: string | number) => {
    if (status === 1 || String(status).toLowerCase() === 'pending') return <span className="badge badge-warning">Mới tạo</span>;
    if (status === 2 || String(status).toLowerCase() === 'completed') return <span className="badge badge-success">Hoàn thành</span>;
    if (status === 0 || String(status).toLowerCase() === 'cancelled') return <span className="badge badge-danger" style={{ background: '#fef2f2', color: '#ef4444' }}>Đã hủy</span>;
    return <span className="badge badge-gray">{status}</span>;
  };

  return (
    <div className="erp-layout">
      {/* Sidebar Mini */}
      <div className="erp-sidebar">
        <div 
          className={`erp-sidebar-icon ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
          title="Quản lý Đơn hàng"
        >
          <ShoppingCart size={24} />
        </div>
        <div 
          className={`erp-sidebar-icon ${activeTab === 'bills' ? 'active' : ''}`}
          onClick={() => setActiveTab('bills')}
          title="Quản lý Hóa đơn"
        >
          <FileText size={24} />
        </div>
      </div>

      <div className="erp-main">
        {/* Header */}
        <div className="erp-header">
          <div className="erp-header-title">
            {activeTab === 'orders' ? 'Quản lý Đơn bán hàng' : 'Quản lý Hóa đơn'}
          </div>
          <div>
            <div className="badge badge-success">Module Bán Hàng Độc Lập</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="erp-content">
          {/* Master Table */}
          <div className="erp-master">
            <div className="erp-toolbar">
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={16}/> Thêm mới
              </button>
              <button className="btn" onClick={fetchOrders}><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Làm mới</button>
              <div style={{ flex: 1 }}></div>
              <div style={{ position: 'relative' }}>
                <input type="text" className="search-input" placeholder="Tìm kiếm mã đơn..." />
                <Search size={16} style={{ position: 'absolute', right: 8, top: 8, color: '#9ca3af' }}/>
              </div>
            </div>
            
            <div className="erp-table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Mã Đơn Hàng</th>
                    <th>Ngày lập</th>
                    <th>Khách hàng</th>
                    <th style={{ textAlign: 'right' }}>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr 
                      key={order.id} 
                      className={selectedOrder?.id === order.id ? 'selected' : ''}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{order.orderCode || `ORD-${order.id}`}</td>
                      <td>{order.orderDate ? format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm') : format(new Date(), 'dd/MM/yyyy HH:mm')}</td>
                      <td>{order.fullName || order.customerId || 'Khách lẻ'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPricePaid || order.totalAmount || 0)}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Panel */}
          {selectedOrder ? (
            <div className="erp-detail">
              <div className="erp-detail-header">
                <span>Chi tiết Đơn hàng</span>
                <X size={18} style={{ cursor: 'pointer', color: '#6b7280' }} onClick={() => setSelectedOrder(null)} />
              </div>
              <div className="erp-detail-content">
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                  <h2 style={{ fontSize: '18px', color: 'var(--primary-dark)', marginBottom: '4px' }}>{selectedOrder.orderCode || `ORD-${selectedOrder.id}`}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                    <Clock size={14}/> {selectedOrder.orderDate ? format(new Date(selectedOrder.orderDate), 'dd/MM/yyyy HH:mm') : format(new Date(), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Khách hàng</span>
                  <span className="detail-value">{selectedOrder.fullName || selectedOrder.customerId || 'Khách lẻ'}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Trạng thái</span>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Tổng tiền thanh toán</span>
                  <span className="detail-value" style={{ color: 'var(--primary-color)', fontSize: '18px' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalPricePaid || selectedOrder.totalAmount || 0)}
                  </span>
                </div>

                <div className="detail-row" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }}><Check size={16}/> Cập nhật</button>
                    <button className="btn btn-danger" onClick={() => handleCancelOrder(selectedOrder.id)}><Trash2 size={16}/> Hủy đơn</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="erp-detail" style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>Chọn một đơn hàng để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Thêm Mới */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary-dark)' }}>Tạo Đơn Bán Hàng</h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowCreateModal(false)} />
            </div>
            
            <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Tên Khách Hàng *</label>
                <input 
                  className="search-input" 
                  style={{ width: '100%' }} 
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Số điện thoại</label>
                <input 
                  className="search-input" 
                  style={{ width: '100%' }} 
                  value={formData.tell}
                  onChange={e => setFormData({...formData, tell: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Tổng tiền thanh toán (VNĐ) *</label>
                <input 
                  type="number"
                  className="search-input" 
                  style={{ width: '100%', fontSize: '14px', fontWeight: 600, color: 'var(--primary-color)' }} 
                  required
                  min="0"
                  value={formData.totalPricePaid}
                  onChange={e => setFormData({...formData, totalPricePaid: Number(e.target.value)})}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCreateModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Đơn Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// Dữ liệu mẫu (Mock Data) trong trường hợp Backend chưa có dữ liệu thật
const mockOrders: Order[] = [
  { id: '1', orderCode: 'ORD-2026-0001', orderDate: '2026-04-28T08:30:00Z', totalAmount: 15500000, totalPricePaid: 15500000, status: 'Completed', customerId: 'CUS-0092', fullName: 'Nguyễn Văn A', notes: '' },
  { id: '2', orderCode: 'ORD-2026-0002', orderDate: '2026-04-28T09:15:00Z', totalAmount: 2300000, totalPricePaid: 2300000, status: 'Pending', customerId: 'CUS-0104', fullName: 'Trần Thị B', notes: '' },
  { id: '3', orderCode: 'ORD-2026-0003', orderDate: '2026-04-28T10:45:00Z', totalAmount: 45000000, totalPricePaid: 45000000, status: 'Pending', customerId: 'CUS-0012', fullName: 'Lê C', notes: '' },
];
