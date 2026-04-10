import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('/api/items/' + id)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setItem(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        navigate('/');
      });
  }, [id, navigate]);

  if (loading) return (
    <div className="container">
      <div className="skeleton" style={{ height: '300px', marginTop: '2rem' }}></div>
    </div>
  );

  if (!item) return null;

  return (
    <div className="container">
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '2rem', display: 'inline-block' }}>
        ← Back to Items
      </Link>
      
      <div className="item-list" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>{item.name}</h2>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Category</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{item.category || 'N/A'}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Price</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>${item.price.toFixed(2)}</p>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Description</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            {item.description || 'No description available for this item.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;