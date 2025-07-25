import React, { useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";
import axios from "axios";

function App() {
  const [method, setMethod] = useState("offset");
  const [prevMethod, setPrevMethod] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [data, setData] = useState([]);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageInput, setPageInput] = useState(1);
  const [lastUserId, setLastUserId] = useState(null);
  const [cursorId, setCursorId] = useState(null);
  const [cursorArray, setCursorArray] = useState([]);
  const [pageSize, setPageSize] = useState(10);

  const localString = (value) => {
    // console.log("value: " + value);
    return value.toLocaleString();
  } 

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = method.startsWith("keyset") ? { method, cursorId, pageSize } : { method, page, pageSize };
      // console.log("params:"+ JSON.stringify(params) + "  cursorArray:" + cursorArray);
      // Before making next call, determine if the method has changed
      if (prevMethod !== method) {
        setPrevMethod(method);
        if (method.startsWith("keyset")) {
          setCursorArray([]);
        }
      }
      setDuration("- - - - - -"); // blank out duration during API call
      const res = await axios.get("http://localhost:3001/api/pagination", { params });
      setData(res.data.data);
      setDuration(res.data.durationMs.toLocaleString() + " ms");
      if (method.startsWith("keyset")) {
        const lastUser = res.data.data[res.data.data.length - 1];
        setLastUserId(lastUser.id);
        if (res.data.totalPages !==undefined && res.data.totalPages !== 0) setTotalPages(res.data.totalPages);
      } else if (res.data.totalPages) {
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
    if (method !== "keyset") {
      setPageInput(page);
    }
    // eslint-disable-next-line
  }, [method, page, cursorId, pageSize]);

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
    <div className="min-h-screen bg-gray-100 flex  justify-center p-6">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-5xl">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-center">Pagination Methods: Pros and Cons</h2>
          <ul className="text-sm text-gray-700 list-disc pl-6">
            <li><strong>Offset:</strong> Simple to implement. Slower on large datasets because it scans all rows before the offset.</li>
            <li><strong>Keyset:</strong> Fast and efficient for large datasets. Requires a unique column (e.g., ID) and doesn't support jumping to arbitrary pages.</li>
            <li><strong>Join:</strong> Supports complex data fetching. Slower due to table joins and extra processing.</li>
            <li><strong>RowNum:</strong> Works well with database-specific optimizations. May not be portable across DB engines.</li>
            <li><strong>Materialized View:</strong> Greatly speeds up expensive queries with pre-joined indexed data. Needs manual refreshing and data may be stale.</li>
          </ul>
        </div>

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
              setCursorId(null);
              setData([]);
            }}
          >
            <option value="offset">Offset</option>
            <option value="keyset">Keyset</option>
            <option value="keysetPages">Keyset w/PageCount</option>
            <option value="join">Join</option>
            <option value="rowNum">RowNum</option>
            <option value="materialized">MV Offset Query</option>
          </select>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={() => {
              if (method.startsWith("keyset")) {
                const tempArray = cursorArray;
                const prevCursor = tempArray.pop(); // get and remove the last cursor position
                setCursorArray(tempArray);
                setCursorId(prevCursor); // triggers fetch
              } else {
                setPage((prev) => Math.max(prev - 1, 1));
              }
            }}
            disabled={(!method.startsWith("keyset") && page === 1) || (method.startsWith("keyset")
              && (cursorId === null || cursorArray.length === 0))}
          >
            Prev
          </button>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => {
              if (method.startsWith("keyset")) {
                // Before making next call, capture ID of first element of the current page
                const startCursorPos = data[0].id - 1;
                const tempArray = cursorArray;
                if (data.length !== 0 && tempArray[tempArray.length - 1] !== startCursorPos) tempArray.push(startCursorPos); // Add to Cursor Array
                setCursorArray(tempArray);
                setCursorId(lastUserId); // triggers fetch with current cursor position
              } else {
                setPage((prev) => Math.min(prev + 1, totalPages));
              }
            }}
          >
            Next
          </button>

          {!method.startsWith("keyset") && (
            <>
              <label className="text-gray-700">Go to page:</label>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={pageInput}
                onChange={handlePageInputChange}
                className="border p-2 rounded w-50"
              />
              <button
                className="bg-green-500 text-white px-3 py-2 rounded"
                onClick={goToPage}
              >
                Go
              </button>
            </>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          {!method.startsWith("keyset") && (
            <span className="text-gray-600">
              Page <strong>{localString(page)}</strong> of <strong>{localString(totalPages)}</strong>
            </span>
          )}
          {method === "keyset" && (
            <span className="text-gray-600">
              Page <strong>{localString(cursorArray.length + 1)}</strong> of <strong>?</strong>
            </span>
          )}
          {method === "keysetPages" && (
            <span className="text-gray-600">
              Page <strong>{localString(cursorArray.length + 1)}</strong> of <strong>{localString(totalPages)}</strong>
            </span>
          )}
          <span className="text-gray-600">
            Request duration: <strong>{duration.toLocaleString()}</strong>
          </span>
        </div>
          
        {loading && <p className="" style={{ padding: '70px', placeItems: 'center'}}>
          <MoonLoader
            color={"#2B68BE"}
            loading={loading}
            size={100}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          </p>}
        {!loading && <p className="text-blue-500 text-center">&#x200B;</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && (method !== "join" &&  method !== "materialized") && <table className="table-auto w-full border">
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
        </table>}
        {!loading && method === "join" && <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">City</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2 text-center">{user.id}</td>
                <td className="border px-4 py-2">{user.username}</td>
                <td className="border px-4 py-2">{user.phone}</td>
                <td className="border px-4 py-2">{user.city}</td>
                
                <td className="border px-4 py-2">{new Date(user.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>}
        {!loading && method === "materialized" && <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">Street</th>
              <th className="border px-4 py-2">City</th>
              <th className="border px-4 py-2">State</th>
              <th className="border px-4 py-2">Zip Code</th>
              <th className="border px-4 py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2 text-center">{user.id}</td>
                <td className="border px-4 py-2">{user.username}</td>
                <td className="border px-4 py-2">{user.phone}</td>
                <td className="border px-4 py-2">{user.street}</td>
                <td className="border px-4 py-2">{user.city}</td>
                <td className="border px-4 py-2">{user.state}</td>
                <td className="border px-4 py-2">{user.zipCode}</td>
                <td className="border px-4 py-2">{new Date(user.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>}
        <label htmlFor="pageSize" className="mr-2 font-semibold">Rows per page:</label>
        <select
          id="changePageSize"
          value={pageSize}
          onChange={(e) => {
            const newPageSize = parseInt(e.target.value);
            setPageSize(newPageSize);
            setPage(1); // Reset to page 1 on size change
            setCursorId(null);
            setCursorArray([]);
          }}
          className="border px-2 py-1 rounded"
        >
          {[5, 10, 25, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default App;