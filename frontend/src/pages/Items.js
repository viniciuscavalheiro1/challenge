import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';

// Move Row outside to prevent unnecessary re-renders and potential hook issues
const Row = ({ index, style, data }) => {
  const item = data[index];
  if (!item) return null;
  return (
    <div style={style} className="item-row">
      <Link to={'/items/' + item.id} style={{ fontWeight: 500 }}>
        {item.name}
      </Link>
      <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
        ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
      </span>
    </div>
  );
};

function Items() {
  const { items = [], loading, pagination, fetchItems } = useData();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const performFetch = async () => {
      if (active) {
        await fetchItems({ page: pagination?.page || 1, q: debouncedSearch }, controller.signal);
      }
    };

    performFetch();

    return () => {
      active = false;
      controller.abort();
    };
  }, [fetchItems, pagination?.page, debouncedSearch]);

  const handlePageChange = (newPage) => {
    fetchItems({ page: newPage, q: debouncedSearch });
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Discover Items</h1>
        <p style={{ color: 'var(--text-muted)' }}>Explore our curated list of items with real-time search and smooth virtualization.</p>
      </header>

      <div className="search-container">
        <input
          type="text"
          className="input"
          placeholder="Search items by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="item-list">
        {loading && items.length === 0 ? (
          <div className="loading-spinner">
            <div className="skeleton" style={{ height: '300px' }}></div>
          </div>
        ) : items && items.length > 0 ? (
          <List
            height={400}
            itemCount={items.length}
            itemSize={50}
            width="100%"
            itemData={items}
          >
            {Row}
          </List>
        ) : (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {loading ? 'Searching...' : 'No items found matching your search.'}
          </p>
        )}
      </div>

      <div className="pagination">
        <button
          className="btn btn-outline"
          disabled={(pagination?.page || 1) <= 1 || loading}
          onClick={() => handlePageChange((pagination?.page || 1) - 1)}
        >
          Previous
        </button>
        <span style={{ fontWeight: 600 }}>
          Page {pagination?.page || 1} of {pagination?.totalPages || 1}
        </span>
        <button
          className="btn btn-outline"
          disabled={(pagination?.page || 1) >= (pagination?.totalPages || 1) || loading}
          onClick={() => handlePageChange((pagination?.page || 1) + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Items;