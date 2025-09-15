import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export async function register({ email, password, name }) {
  return axios.post(`${API_URL}/auth/register`, { email, password, name });
}

export async function login({ email, password }) {
  return axios.post(`${API_URL}/auth/login`, { email, password });
}

export async function fetchEvents(token) {
  return axios.get(`${API_URL}/events/all-events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchEventById(id, token) {
  return axios.get(`${API_URL}/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchEventsForWeek(token, startDate, endDate) {
  return axios.get(`${API_URL}/events`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { startDate, endDate },
  });
}

export async function createEvent(event, token) {
  return axios.post(`${API_URL}/events/create`, event, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateEvent(id, event, token, updateType, overrideId) {
  const queryParams = overrideId ? `?updateType=${updateType}&overrideId=${overrideId}` : `?updateType=${updateType}`;
  
  return axios.put(`${API_URL}/events/update/${id}${queryParams}`, event, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function softDeleteEvent(id, token, deleteType, overrideId, event=null) {
  const queryParams = overrideId ? `?deleteType=${deleteType}&overrideId=${overrideId}` : `?deleteType=${deleteType}`;
  return axios.delete(`${API_URL}/events/delete/${id}${queryParams}`, {
    headers: { Authorization: `Bearer ${token}` },
    data: event,
  });
}

export async function getDeletedEvents(token) {
  return axios.get(`${API_URL}/events/deleted`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function restoreEvent(id, token, isOverride) {
  const query = `?isOverride=${isOverride}`;
  return axios.patch(`${API_URL}/events/restore/${id}${query}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function forceDeleteEvent(id, token, isOverride) {
  const query = `?isOverride=${isOverride}`;
  return axios.delete(`${API_URL}/events/force/${id}${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateProfile(user, token) {
  return axios.put(`${API_URL}/auth/update-profile`, user, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
export async function changePassword(oldPassword, newPassword, token) {
  return axios.put(`${API_URL}/auth/change-password`, { oldPassword, newPassword }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function searchEvents(query, token) {
  return axios.get(`${API_URL}/events/search`, {
    params: { query },
    headers: { Authorization: `Bearer ${token}` },
  });
}