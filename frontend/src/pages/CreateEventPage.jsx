import EventForm from "../components/EventForm";
import { createEvent } from "../api";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { notify } = useNotification();


  const handleCreateEvent = async (event) => {

    try {
      const res = await createEvent(event, token);
      notify(res.data.message, 'success');
      navigate("/home");
    } catch (err) {
      notify(err.response?.data?.message || 'Lỗi khi tạo sự kiện', 'error');
    }
  };

  return <EventForm onSubmit={handleCreateEvent} isEdit={false} />;
}
