import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

const apiClient = axios.create({
  baseURL: 'https://sit.sell.backend.nguyenbinh.info.vn/api/sell',
})

function App() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    // Fetch orders dynamically from the Backend Gateway
    apiClient.get('/orders')
      .then(res => {
        if (res.data?.data) {
          setOrders(res.data.data)
        }
      })
      .catch(err => console.error("API Error: ", err));
  }, [])

  return (
    <div className="App">
      <h1>🚀 Sell Module Dashboard (Độc lập 100%)</h1>
      <p>Module Bán hàng được tải từ domain riêng: <code>sit.sell.nguyenbinh.info.vn</code></p>
      
      <div className="card">
        <h2>📦 Danh sách Đơn hàng</h2>
        {orders.length === 0 ? (
          <p>Chưa có đơn hàng nào.</p>
        ) : (
          <table border={1} cellPadding={10} style={{ width: '100%', marginTop: 20 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Khách hàng (ID)</th>
                <th>Tổng thanh toán</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customerId}</td>
                  <td>{order.totalPricePaid.toLocaleString()} VND</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>{order.status === 1 ? 'Mới' : 'Hoàn thành'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <button onClick={() => alert("Hệ thống độc lập sẵn sàng nhúng vào bên thứ 3!")}>Thêm Hóa Đơn Mới</button>
    </div>
  )
}

export default App
