import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import ListingCard from '../components/ListingCard.jsx';
import Loader from '../components/Loader.jsx';
import { STAY_TYPES } from '../utils/format.js';

const initial = { city: '', type: '', guests: '', maxPrice: '' };

export default function Home() {
  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = (filterParams, targetPage = 1, targetSort = sort) => {
    setLoading(true);
    setError('');
    const clean = Object.fromEntries(Object.entries(filterParams).filter(([, v]) => v !== ''));
    api
      .get('/listings', { params: { ...clean, page: targetPage, sort: targetSort, limit: 8 } })
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setListings(data);
          setPagination({ page: 1, totalPages: 1, total: data.length });
        } else {
          setListings(data.listings || []);
          setPagination({ page: data.page || 1, totalPages: data.totalPages || 1, total: data.total || 0 });
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    search(initial, 1, 'newest');
  }, []);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setPage(1);
    search(filters, 1, sort);
  };

  const handleSortChange = (e) => {
    const nextSort = e.target.value;
    setSort(nextSort);
    setPage(1);
    search(filters, 1, nextSort);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    search(filters, nextPage, sort);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section>
      <div className="hero">
        <h1>Find your next nest.</h1>
        <p className="muted">Homestays, havelis, villas and hostels across India.</p>
        <form className="search-bar card" onSubmit={submit}>
          <input placeholder="Where to? (e.g. Jaipur)" value={filters.city} onChange={set('city')} />
          <select value={filters.type} onChange={set('type')}>
            <option value="">Any type</option>
            {STAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" min="1" placeholder="Guests" value={filters.guests} onChange={set('guests')} />
          <input type="number" min="0" placeholder="Max ₹/night" value={filters.maxPrice} onChange={set('maxPrice')} />
          <button className="btn">Search</button>
        </form>
      </div>

      <div className="row-between" style={{ margin: '20px 0 16px' }}>
        <p className="muted small">
          {pagination.total} {pagination.total === 1 ? 'stay' : 'stays'} found
        </p>
        <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', width: 'auto' }}>
          <span>Sort by:</span>
          <select value={sort} onChange={handleSortChange} style={{ width: 'auto', padding: '6px 12px' }}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <Loader />
      ) : listings.length === 0 ? (
        <p className="muted">No stays match your search.</p>
      ) : (
        <>
          <div className="grid">
            {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
          </div>
          {pagination.totalPages > 1 && (
            <div className="row" style={{ justifyContent: 'center', gap: '12px', marginTop: '32px' }}>
              <button
                className="btn btn-ghost"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
              <span className="muted" style={{ alignSelf: 'center' }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-ghost"
                disabled={page >= pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
