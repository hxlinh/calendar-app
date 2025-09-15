import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import EventForm from "../components/EventForm";
import { fetchEventById, updateEvent } from "../api";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

export default function EditEventPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [eventData, setEventData] = useState(null);
  const token = localStorage.getItem('token');
  const eventId = location.state.isOverride ? id.split("&")[0] : id;
  const overrideId = location.state.isOverride ? id.split("&")[1]: null;

  useEffect(() => {
    async function fetchEventData() {
      const res = await fetchEventById(eventId, token);
      let data = res.data;
      if (location.state.isOverride) {
        const overrideEvent = data.overrides.find(event => event.id === parseInt(overrideId));
        if (overrideEvent) {
          data = {
            ...overrideEvent,
            repeatType: data.repeatType,
            userId: data.userId,
            groupId: data.groupId,
            repeatDate: data.repeatDate,
            repeatDays: data.repeatDays,
            repeatMonth: data.repeatMonth,
            endType: data.endType,
            isOverride: location.state.isOverride,
          }
        }
      } else {
        if (location.state.startTime) {
          data = {
            ...data,
            startTime: location.state.startTime,
            endTime: location.state.endTime,
            isOverride: location.state.isOverride,
          }
        }
      }
      setEventData(data);
    }
    fetchEventData();
  }, [id, token, location.state]);

  const handleEditEvent = async (event, updateType) => {
    try {
      const res = await updateEvent(eventId, event, token, updateType, overrideId);
      setEventData(event);
      notify(res.data.message, 'success');
      navigate("/home");
    } catch (err) {
      notify(err.response?.data?.message || 'Lỗi khi cập nhật sự kiện', 'error');
    }
  };

  return eventData ? <EventForm eventData={eventData} onSubmit={handleEditEvent} isEdit={true} /> : <p>Đang tải...</p>;
}
