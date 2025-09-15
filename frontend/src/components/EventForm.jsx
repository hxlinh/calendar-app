import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import RecurringEventDialog from './RecurringEventDialog';

export default function EventForm({ eventData, onSubmit, isEdit }) {

const formattedEventData = eventData
  ? (() => {
      const start = eventData.startTime ? new Date(eventData.startTime) : null;
      const end = eventData.endTime ? new Date(eventData.endTime) : null;
      return {
        ...eventData,
        dateStart: start
          ? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`
          : "",
        timeStart: start
          ? `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`
          : "",
        dateEnd: end
          ? `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`
          : "",
        timeEnd: end
          ? `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`
          : "",
        repeatUntil: eventData.repeatUntil 
          ? new Date(eventData.repeatUntil).toISOString().split("T")[0] 
          : "",
        repeatCount: eventData.repeatCount || "",
      };
    })()
  : { title: "", dateStart: "", timeStart: "", dateEnd: "", timeEnd: "", repeatType: "none", daysOfWeek: [], location: "", description: "", endType: "none", repeatUntil: "", repeatCount: "" };

  const [event, setEvent] = useState(formattedEventData);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [dateChanged, setDateChanged] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dateStart' || name === 'dateEnd') {
      setDateChanged(true);
    }
    setEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (day) => {
    setEvent((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  // function preparePayload(event, eventData, actionType, startTime, endTime) {
  //   const basePayload = {
  //     title: event.title,
  //     location: event.location,
  //     description: event.description,
  //     startTime,
  //     endTime,
  //   };

  //   if (!isEdit) {
  //     Object.assign(basePayload, {
  //       repeatType: event.repeatType !== "none" ? event.repeatType : null,
  //       repeatDays: event.repeatType === "weekly" ? event.daysOfWeek.map(day => {
  //         const map = { "Chủ Nhật": 0, "Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3, "Thứ 5": 4, "Thứ 6": 5, "Thứ 7": 6 };
  //         return map[day];
  //       }).join(",") : null,
  //       repeatDate: event.repeatType === "monthly" || event.repeatType === "yearly" ? parseInt(event.dateStart.split("-")[2]) : null,
  //       repeatMonth: event.repeatType === "yearly" ? (parseInt(event.dateStart.split("-")[1]) - 1) : null,
  //       endType: event.endType,
  //       repeatUntil: event.endType === "afterDate" && event.repeatUntil ? new Date(event.repeatUntil) : null,
  //       repeatCount: event.endType === "afterTime" ? parseInt(event.repeatCount) || null : null,
  //     })
  //   }
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const startTime = new Date(`${event.dateStart}T${event.timeStart}`);
    const endTime = new Date(`${event.dateEnd}T${event.timeEnd}`);
    
    if (startTime >= endTime) return alert("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");

    const payload = {
      title: event.title,
      location: event.location,
      description: event.description,
      startTime,
      endTime,
      repeatType: event.repeatType !== "none" ? event.repeatType : null,
      repeatDays: event.repeatType === "weekly" ? event.daysOfWeek.map(day => {
        const map = { "Chủ Nhật": 0, "Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3, "Thứ 5": 4, "Thứ 6": 5, "Thứ 7": 6 };
        return map[day];
      }).join(",") : null,
      repeatDate: event.repeatType === "monthly" || event.repeatType === "yearly" ? parseInt(event.dateStart.split("-")[2]) : null,
      repeatMonth: event.repeatType === "yearly" ? (parseInt(event.dateStart.split("-")[1]) - 1) : null,
      endType: event.endType,
      repeatUntil: event.endType === "afterDate" && event.repeatUntil ? new Date(event.repeatUntil) : null,
      repeatCount: event.endType === "afterTime" ? parseInt(event.repeatCount) || null : null,
    };

    if (isEdit && (event.isRecurring || eventData.repeatType)) {
      setPendingPayload(payload);
      setShowEditDialog(true);
    } else {
      await onSubmit(payload);
    }
  };

  const handleEditConfirm = async (choice) => {
    setShowEditDialog(false);
    if (choice === "single") {
      const payload = {
      originalStartTime: eventData.originalStartTime? new Date (eventData.originalStartTime) : new Date (eventData.startTime),
      originalEndTime: eventData.originalEndTime? new Date (eventData.originalEndTime) : new Date (eventData.endTime),
      startTime: pendingPayload.startTime,
      endTime: pendingPayload.endTime,
      title: pendingPayload.title,
      location: pendingPayload.location,
      description: pendingPayload.description,
      };
      await onSubmit(payload, choice);
    } else if (choice === "follow") {
      const payload = {
        ...pendingPayload,
      originalStartTime: eventData.originalStartTime? new Date (eventData.originalStartTime) : new Date (eventData.startTime),
      originalEndTime: eventData.originalEndTime? new Date (eventData.originalEndTime) : new Date (eventData.endTime),
      };
      await onSubmit(payload, choice);
    } else {
      await onSubmit(pendingPayload, choice);
    }
    setPendingPayload(null);
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white flex justify-center items-center">
      <div className="max-w-4xl w-full bg-[#222] p-8 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-[#333] transition">
            <FaArrowLeft />
          </button>
          <h2 className="text-2xl font-semibold">{isEdit ? "Chỉnh sửa sự kiện" : "Tạo sự kiện"}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tiêu đề */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Tiêu đề:</label>
            <input
              required 
              type="text"
              name="title"
              value={event.title}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none"
            />
          </div>

          {/* Ngày & Giờ bắt đầu */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-1">Ngày bắt đầu:</label>
              <input
                required
                type="date"
                name="dateStart"
                value={event.dateStart}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Giờ bắt đầu:</label>
              <input
                required
                type="time"
                name="timeStart"
                value={event.timeStart}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none"
              />
            </div>
          </div>

          {/* Ngày & Giờ kết thúc */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-1">Ngày kết thúc:</label>
              <input
                required
                type="date"
                name="dateEnd"
                value={event.dateEnd}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Giờ kết thúc:</label>
              <input
                required
                type="time"
                name="timeEnd"
                value={event.timeEnd}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none"
              />
            </div>
          </div>

          {/* Loại lặp lại */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Lặp lại:</label>
            <select 
              name="repeatType" 
              value={event.repeatType} 
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none"
            >
              <option value="none">Không lặp lại</option>
              <option value="daily">Hàng ngày</option>
              <option value="weekly">Hàng tuần</option>
              <option value="monthly">Hàng tháng</option>
              <option value="yearly">Hàng năm</option>
            </select>
          </div>

          {/* Các ngày trong tuần cho lặp lại hàng tuần */}
          {event.repeatType === "weekly" && (
            <div className="mb-4">
              <label className="block text-sm mb-1">Chọn các ngày trong tuần:</label>
              <div className="grid grid-cols-4 gap-2">
                {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map((day, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input type="checkbox" checked={event.daysOfWeek.includes(day)} onChange={() => handleCheckboxChange(day)} />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Thời điểm kết thúc lặp lại */}
          {event.repeatType !== "none" && (
            <div>
              <label className="block text-sm mb-1">Kết thúc</label>
              <select 
                name="endType" 
                value={event.endType} 
                onChange={handleChange}
                className="w-50 px-3 py-2 bg-gray-700 rounded focus:outline-none"
              >
                <option value="none">Không bao giờ</option>
                <option value="afterDate">Vào ngày</option>
                <option value="afterTime">Sau</option>
              </select>
              {event.endType === "afterDate" && (
                <input
                  type="date"
                  name="repeatUntil"
                  value={event.repeatUntil}
                  onChange={handleChange}
                  className="ml-10 w-100 px-3 py-2 bg-gray-700 rounded focus:outline-none mt-2"
                />
              )}
              {event.endType === "afterTime" && (
                <input
                  type="number"
                  name="repeatCount"
                  value={event.repeatCount}
                  onChange={handleChange}
                  placeholder="Số lần xuất hiện"
                  className="ml-10 w-100 px-3 py-2 bg-gray-700 rounded focus:outline-none mt-2"
                />
              )}
            </div>
          )}

          {/* Địa điểm */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Địa điểm:</label>
            <input
              type="text"
              name="location"
              value={event.location}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none"
              placeholder="Vị trí sự kiện"
            />
          </div>

          {/* Mô tả */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Mô tả:</label>
            <textarea
              name="description"
              value={event.description}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 bg-gray-700 rounded focus:outline-none"
              placeholder="Mô tả sự kiện"
            />
          </div>

          {/* Nút lưu */}
          <button className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 transition">
            {isEdit ? "Lưu thay đổi" : "Tạo sự kiện"}
          </button>
        </form>

        <RecurringEventDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onConfirm={handleEditConfirm}
          type="edit"
          dateChanged={dateChanged}
        />
      </div>
    </div>
  );
}
