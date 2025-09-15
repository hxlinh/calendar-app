import { useState, useEffect } from 'react';
import { register, login } from '../api';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { notify } = useNotification();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // User is already authenticated, redirect to home
      navigate('/home');
      notify('Bạn đã đăng nhập rồi', 'info');
    }
  }, [navigate, notify]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (!isLogin && !name)) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Mật khẩu không khớp.');
      return;
    }
    try {
      if (isLogin) {
        const res = await login({ email, password });
        localStorage.setItem('token', res.data.token);
        // Store complete user info
        const userInfo = {
          email: res.data.email,
          name: res.data.name,
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        navigate('/home');
      } else {
        await register({ email, password, name });
        setIsLogin(true);
        notify(res.data.message, 'sucess');
      }
    } catch (err) {
      notify(err.response?.data?.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
        </h2>
        {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {!isLogin && (
            <input
              type="text"
              placeholder="Tên"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-xl hover:bg-indigo-600 transition duration-200 cursor-pointer"
          >
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
          <button
            onClick={toggleForm}
            className="text-indigo-500 font-semibold hover:underline cursor-pointer"
          >
            {isLogin ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </div>
  );
}
