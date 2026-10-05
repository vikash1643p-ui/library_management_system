// libraryApi.js
// Simulated REST endpoints. Books/member are served as real static JSON
// over HTTP by Vite's dev server (public/ folder), so axios/fetch here
// perform genuine async network requests, not just in-memory reads.
import axios from "axios";

const NETWORK_DELAY = 600; // ms, so loading states are actually visible
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// a) Fetch book list — via Axios
export async function fetchBooks() {
  await delay(NETWORK_DELAY);
  const response = await axios.get("/books.json");
  return response.data;
}

// a) Fetch member info — via Axios
export async function fetchMember() {
  await delay(NETWORK_DELAY);
  const response = await axios.get("/member.json");
  return response.data;
}

// c) Fetch a single book's details dynamically — via Fetch API
export async function fetchBookById(id) {
  await delay(NETWORK_DELAY);
  const response = await fetch("/books.json");
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const books = await response.json();
  const book = books.find((b) => b.id === Number(id));
  if (!book) {
    throw new Error(`Book with id ${id} not found`);
  }
  return book;
}

// b) Search + category filtering — server-side style, via Fetch API
export async function searchBooks({ keyword = "", category = "", author = "" } = {}) {
  await delay(NETWORK_DELAY);
  const response = await fetch("/books.json");
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const books = await response.json();
  return books.filter((b) => {
    const matchesKeyword = b.title.toLowerCase().includes(keyword.toLowerCase());
    const matchesCategory = category ? b.category === category : true;
    const matchesAuthor = author ? b.author === author : true;
    return matchesKeyword && matchesCategory && matchesAuthor;
  });
}

// f) API-based recommendations — via Axios
export async function fetchRecommendations(categories = []) {
  await delay(NETWORK_DELAY);
  const response = await axios.get("/books.json");
  return response.data.filter((b) => categories.includes(b.category) && b.available).slice(0, 3);
}
// f) An extra Fetch-based call — confirming a return/renewal action with the "server"
export async function confirmBookAction(bookId, action) {
  await delay(NETWORK_DELAY);
  const response = await fetch("/books.json");
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const books = await response.json();
  const book = books.find((b) => b.id === Number(bookId));
  if (!book) {
    throw new Error(`Book with id ${bookId} not found`);
  }
  return { bookId, action, confirmedAt: new Date().toISOString(), book };
}