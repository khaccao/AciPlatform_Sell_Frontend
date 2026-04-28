import { useState, useEffect } from 'react';
import { ShoppingCart, FileText, Plus, Search, RefreshCw, X, MoreHorizontal, Check, Clock } from 'lucide-react';
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
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'bills'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
        const data = await res.json();
        setOrders(data);
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <span className="badge badge-success">Hoàn thành</span>;
      case 'pending': return <span className="badge badge-warning">Chờ xử lý</span>;
      default: return <span className="badge badge-gray">{status}</span>;
    }
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
              <button className="btn btn-primary"><Plus size={16}/> Thêm mới</button>
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
                      <td style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{order.orderCode}</td>
                      <td>{format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm')}</td>
                      <td>{order.customerId || 'Khách lẻ'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
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
                  <h2 style={{ fontSize: '18px', color: 'var(--primary-dark)', marginBottom: '4px' }}>{selectedOrder.orderCode}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                    <Clock size={14}/> {format(new Date(selectedOrder.orderDate), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Khách hàng</span>
                  <span className="detail-value">{selectedOrder.customerId || 'Khách lẻ'}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Trạng thái</span>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Tổng tiền thanh toán</span>
                  <span className="detail-value" style={{ color: 'var(--primary-color)', fontSize: '18px' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount)}
                  </span>
                </div>

                <div className="detail-row" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }}><Check size={16}/> Duyệt đơn</button>
                    <button className="btn btn-danger"><MoreHorizontal size={16}/></button>
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
    </div>
  );
}

export default Dashboard;

// Dữ liệu mẫu (Mock Data) trong trường hợp Backend chưa có dữ liệu thật
const mockOrders: Order[] = [
  { id: '1', orderCode: 'ORD-2026-0001', orderDate: '2026-04-28T08:30:00Z', totalAmount: 15500000, status: 'Completed', customerId: 'CUS-0092', notes: '' },
  { id: '2', orderCode: 'ORD-2026-0002', orderDate: '2026-04-28T09:15:00Z', totalAmount: 2300000, status: 'Pending', customerId: 'CUS-0104', notes: '' },
  { id: '3', orderCode: 'ORD-2026-0003', orderDate: '2026-04-28T10:45:00Z', totalAmount: 45000000, status: 'Pending', customerId: 'CUS-0012', notes: '' },
  { id: '4', orderCode: 'ORD-2026-0004', orderDate: '2026-04-28T11:20:00Z', totalAmount: 890000, status: 'Completed', customerId: 'CUS-0233', notes: '' },
  { id: '5', orderCode: 'ORD-2026-0005', orderDate: '2026-04-28T14:05:00Z', totalAmount: 12400000, status: 'Processing', customerId: 'CUS-0088', notes: '' },
];
