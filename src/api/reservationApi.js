import axios from "axios";

const URL = "http://localhost:3001";

// Axios: restaurants, tables, reservations
export const getRestaurants = () => axios.get(`${URL}/restaurants`).then((r) => r.data);          // a) GET
export const getTables = () => axios.get(`${URL}/tables`).then((r) => r.data);                   // a) GET
export const getReservations = () => axios.get(`${URL}/reservations`).then((r) => r.data);
export const createReservation = (d) => axios.post(`${URL}/reservations`, d).then((r) => r.data);          // b) POST
export const updateReservation = (id, d) => axios.put(`${URL}/reservations/${id}`, d).then((r) => r.data); // c) PUT
export const patchReservation = (id, d) => axios.patch(`${URL}/reservations/${id}`, d).then((r) => r.data); // c) PATCH
export const cancelReservation = (id) => axios.delete(`${URL}/reservations/${id}`);                        // d) DELETE

// Fetch: history
export const getHistory = () =>
  fetch(`${URL}/history?_sort=timestamp&_order=desc`).then((r) => r.json());                 // e) GET
export const addHistory = (d) =>
  fetch(`${URL}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d),
  }).then((r) => r.json());