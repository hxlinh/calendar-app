import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import vi from "date-fns/locale/vi";
import avatar from '../assets/img/avatar.jpg';

export default function HomeHeader({ weekEnd, onNextWeek, onPrevWeek, onToday }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 w-full flex items-center justify-between gap-4 p-4 border-b border-gray-700 bg-[#2c2c2c] z-50">
      <div className="flex items-center gap-3 min-w-fit">
        <button 
          onClick={onToday}
          className="bg-[#2c2c2c] border border-white px-3 py-1 rounded-full hover:bg-gray-600 text-white text-sm cursor-pointer">
          Hôm nay
        </button>
        <i className="fa-solid fa-angle-left text-white cursor-pointer hover:text-gray-400" onClick={onPrevWeek}></i>
        <i className="fa-solid fa-angle-right text-white cursor-pointer hover:text-gray-400" onClick={onNextWeek}></i>
        <span className="text-lg font-semibold text-white">
          {format(weekEnd, "MMMM yyyy", { locale: vi })}
        </span>
      </div>      <form onSubmit={(e) => {
        e.preventDefault();
        const searchInput = e.target.elements.searchQuery.value.trim();
        if (searchInput) {
          navigate(`/search?query=${encodeURIComponent(searchInput)}`);
        } else {
          navigate('/search');
        }
      }} className="flex-1">
        <input
          name="searchQuery"
          type="text"
          placeholder="Tìm kiếm"
          className="w-full bg-[#131314] rounded px-4 py-2 text-sm text-white focus:outline-none"
        />
      </form>

      <div className="flex items-center gap-4 min-w-fit relative">
        <div 
          className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
        </div>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#2c2c2c] rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={() => navigate('/user')}
              className="w-full text-left px-4 py-2 text-white hover:bg-gray-600"
            >
              Hồ sơ của tôi
            </button>
            <button
              onClick={() => navigate('/trash')}
              className="w-full text-left px-4 py-2 text-white hover:bg-gray-600"
            >
              Thùng rác
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-white hover:bg-gray-600"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

