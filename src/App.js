import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [method, setMethod] = useState("offset");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [data, setData] = useState([]);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageInput, setPageInput] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3001/api/pagination", {
        params: { method, page },
      });
      setData(res.data.data);
      setDuration(res.data.durationMs);
      if (res.data.totalPages) {
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      setError("Failed to fetch data. Check the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setPageInput(page);
  }, [method, page]);

  const handlePageInputChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) setPageInput(val);
  };

  const goToPage = () => {
    if (pageInput >= 1 && pageInput <= totalPages) {
      setPage(pageInput);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Paginated Users ({method})
        </h1>

        <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
          <label className="text-gray-700">Method:</label>
          <select
            className="border p-2 rounded"
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              setPage(1);
            }}
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
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>

          <label className="text-gray-700">Go to page:</label>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={pageInput}
            onChange={handlePageInputChange}
            className="border p-2 rounded w-20"
          />
          <button
            className="bg-green-500 text-white px-3 py-2 rounded"
            onClick={goToPage}
          >
            Go
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <span className="text-gray-600">
            Request duration: <strong>{duration} ms</strong>
          </span>
        </div>

        {loading && <p className="text-blue-500 text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

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
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2 text-center">{user.id}</td>
                <td className="border px-4 py-2">{user.username}</td>
                <td className="border px-4 py-2">{new Date(user.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;