import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchEvents } from '../api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();
  const queryParam = searchParams.get('query') || '';

  // Effect để tìm kiếm khi tham số URL thay đổi
  useEffect(() => {
    if (queryParam) {
      performSearch(queryParam);
    }
  }, [queryParam]);

  // Hàm thực hiện tìm kiếm
  const performSearch = async (query) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await searchEvents(query, token);
      setSearchResults(response.data);
      
      if (response.data.length === 0) {
        showNotification('Không tìm thấy kết quả nào', 'info');
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sự kiện:', error);
      showNotification(error.response?.data?.message || 'Đã xảy ra lỗi khi tìm kiếm sự kiện', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Format thời gian sự kiện
  const formatEventTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const dateStr = format(start, 'EEEE, dd/MM/yyyy', { locale: vi });
    const timeStr = `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
    
    return { dateStr, timeStr };
  };
  
  return (
    <Layout>      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {queryParam ? `Kết quả tìm kiếm cho "${queryParam}"` : 'Tìm kiếm sự kiện'}
        </h1>
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Đang tìm kiếm...</p>
          </div>
        )}
        
        {!isLoading && searchResults.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Kết quả tìm kiếm ({searchResults.length})</h2>
            <div className="divide-y divide-gray-200">
              {searchResults.map(event => {
                const { dateStr, timeStr } = formatEventTime(event.startTime, event.endTime);
                
                return (
                  <div key={event.id} className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          <Link to={`/events/edit/${event.id}`} className="text-blue-600 hover:underline">
                            {event.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600">{dateStr}</p>
                        <p className="text-gray-600">{timeStr}</p>
                        {event.location && (
                          <p className="text-gray-600">
                            <span className="font-medium">Địa điểm:</span> {event.location}
                          </p>
                        )}
                      </div>
                      <div>
                        <Link 
                          to={`/events/edit/${event.id}`}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                    
                    {event.description && (
                      <div className="mt-2 text-gray-600">
                        <p className="line-clamp-2">{event.description}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>        ) : queryParam && !isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy kết quả nào cho "{queryParam}"</p>
          </div>
        ) : !queryParam && !isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Hãy sử dụng thanh tìm kiếm ở trên để tìm kiếm sự kiện</p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default SearchPage;
