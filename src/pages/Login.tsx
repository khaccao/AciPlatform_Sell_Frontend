import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AUTH_API = 'https://sit.sell.backend.nguyenbinh.info.vn/api/auth/login';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        // Assuming your backend returns { token: "..." }
        const token = data.token || data.accessToken || data.jwt;
        if (token) {
          localStorage.setItem('sell_token', token);
          navigate('/');
        } else {
          setError('Không tìm thấy Token trong phản hồi từ Server.');
        }
      } else {
        setError('Sai tài khoản hoặc mật khẩu!');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
      <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '360px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--primary-color)' }}>Đăng nhập Bán Hàng</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>Tài khoản</label>
            <input 
              className="search-input" 
              style={{ width: '100%' }} 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>Mật khẩu</label>
            <input 
              type="password"
              className="search-input" 
              style={{ width: '100%' }} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
