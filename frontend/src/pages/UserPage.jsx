import { useState, useEffect } from "react";
import { FaEdit, FaKey, FaUser, FaEnvelope, FaArrowLeft, FaCheck, FaTimes, FaLock, FaShieldAlt, FaExclamationCircle } from "react-icons/fa";
import { updateProfile, changePassword } from "../api";
import { useNavigate } from "react-router-dom";
import avatarImage from "../assets/img/avatar.jpg";

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userInfo);
    setUser(parsedUser);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      await updateProfile({ name: user.name, email: user.email }, token);

      // Update local storage with new user info
      localStorage.setItem("userInfo", JSON.stringify(user));
      setEditMode(false);
      setMessage("Thông tin đã được cập nhật thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật thông tin"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordInput) {
      setError("Vui lòng nhập mật khẩu hiện tại!");
      return;
    }
    
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới!");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      await changePassword(passwordInput, newPassword, token);

      setMessage("Thay đổi mật khẩu thành công!");
      setPasswordInput("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setChangePasswordMode(false);
        setMessage("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const cancelPasswordChange = () => {
    setChangePasswordMode(false);
    setError("");
    setPasswordInput("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => window.history.back()} 
            className="p-2.5 rounded-full hover:bg-[#333] transition-colors bg-[#222] flex items-center justify-center"
            aria-label="Go back"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Thông tin người dùng
          </h1>
        </div>

        {/* Alert messages */}
        {message && (
          <div className="mb-6 bg-green-900/40 border border-green-500/50 rounded-lg p-3 flex items-start gap-3 text-green-400">
            <FaCheck className="mt-0.5 flex-shrink-0" />
            <p>{message}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-900/40 border border-red-500/50 rounded-lg p-3 flex items-start gap-3 text-red-400">
            <FaExclamationCircle className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="bg-gradient-to-br from-[#222] to-[#292929] rounded-xl overflow-hidden shadow-lg">
            {/* Profile header with avatar */}
            <div className="relative">
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#222] shadow-lg">
                  <img 
                    src={avatarImage} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Profile info */}
            <div className="pt-20 pb-6 px-6 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-1">{user.name}</h2>
              <div className="text-gray-400 flex items-center text-sm mb-5">
                <FaEnvelope className="text-blue-400 mr-2" /> {user.email}
              </div>
              
              <div className="border-t border-gray-700 w-full my-4"></div>
              
              {/* Action buttons */}
              {!changePasswordMode && (
                <div className="w-full space-y-3">
                  <button
                    className={`w-full px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#333] hover:bg-[#444]'
                    }`}
                    onClick={editMode ? handleSave : () => setEditMode(true)}
                    disabled={loading || changePasswordMode}
                  >
                    {editMode ? <FaCheck /> : <FaEdit />} 
                    <span>{editMode ? "Lưu thông tin" : "Chỉnh sửa thông tin"}</span>
                  </button>
                  
                  <button
                    className="w-full px-4 py-2.5 rounded-lg bg-[#333] hover:bg-[#444] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    onClick={() => setChangePasswordMode(true)}
                    disabled={loading || editMode}
                  >
                    <FaLock /> 
                    <span>Đổi mật khẩu</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-2">
            {!changePasswordMode ? (
              <div className="bg-[#222] rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FaUser className="mr-2 text-blue-400" /> 
                  Thông tin cá nhân
                </h2>
                
                <div className="space-y-5">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Họ và tên
                    </label>
                    <div className="relative">
                      {editMode ? (
                        <input
                          type="text"
                          name="name"
                          value={user.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-[#333] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                          placeholder="Nhập họ và tên"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-[#333] rounded-lg border border-gray-700">
                          {user.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      {editMode ? (
                        <input
                          type="email"
                          name="email"
                          value={user.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-[#333] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                          placeholder="Nhập email"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-[#333] rounded-lg border border-gray-700">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#222] rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FaKey className="mr-2 text-blue-400" /> 
                  Đổi mật khẩu
                </h2>
                
                <div className="space-y-5">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full px-4 py-3 bg-[#333] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[#333] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Nhập mật khẩu mới"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[#333] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Xác nhận mật khẩu mới"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                  <button
                    className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    onClick={handlePasswordChange}
                    disabled={loading}
                  >
                    <FaCheck /> 
                    <span>Xác nhận</span>
                  </button>
                  
                  <button
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#333] hover:bg-[#444] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    onClick={cancelPasswordChange}
                    disabled={loading}
                  >
                    <FaTimes /> 
                    <span>Hủy</span>
                  </button>
                </div>
              
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
