import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [method, setMethod] = useState("offset");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3001/api/pagination", {
        params: { method, page },
      });
      setData(res.data.data);
      setDuration(res.data.durationMs);
    } catch (err) {
      setError("Failed to fetch data. Check the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [method, page]);

  return (
    <div className="p-4 font-sans max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Paginated Users ({method})</h1>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label className="text-gray-700">Method:</label>
        <select
          className="border p-2 rounded"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="offset">Offset</option>
          <option value="keyset">Keyset</option>
          <option value="join">Join</option>
          <option value="rownum">Rownum</option>
        </select>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>

        <span className="ml-auto text-gray-600">
          Request duration: <strong>{duration} ms</strong>
        </span>
      </div>

      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.username}</td>
              <td className="border px-4 py-2">{new Date(user.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;A