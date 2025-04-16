"use client";
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmefvkfsv';

async function fetchMedia() {
  const res = await fetch('/api/gallery');
  if (!res.ok) return [];
  return res.json();
}

export default function Gallery() {
  const [media, setMedia] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  const next = useCallback(() => {
    if (media.length === 0) return;
    setCurrent((c) => (c + 1) % media.length);
  }, [media.length]);

  const prev = useCallback(() => {
    if (media.length === 0) return;
    setCurrent((c) => (c - 1 + media.length) % media.length);
  }, [media.length]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        prev();
      } else if (e.key === 'ArrowRight') {
        next();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev]);

  useEffect(() => {
    fetchMedia().then((data) => {
      const resources = data.resources || [];
      if (resources.length > 0) {
        // Log the first few assets for debugging
        console.log('Sample Cloudinary asset:', resources.slice(0, 3));
      }
      // Only show admin-owned assets (no context.custom.name or context.custom.story)
      const adminAssets = resources.filter((item: any) => {
        // Exclude if context.custom.name or context.custom.story exists and is non-empty
        if (item.context && item.context.custom) {
          const { name, story } = item.context.custom;
          if ((name && name.trim() !== '') || (story && story.trim() !== '')) {
            return false;
          }
        }
        return true;
      });
      setMedia(adminAssets);
      setLoading(false);
    });
  }, []);

  return (
    <main style={{ background: 'linear-gradient(135deg, #ffe082 0%, #ffd54f 100%)', minHeight: '100vh', color: '#6d4c00', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', fontFamily: 'Comic Sans MS, Comic Sans, cursive', fontSize: '2.5rem', marginBottom: '1rem' }}>Gallery</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Enjoy photos and videos of Tensor. Use ← → arrow keys to navigate.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
        <Link href="/" style={{ background: '#ffecb3', padding: '0.7rem 1.5rem', borderRadius: '1rem', textDecoration: 'none', color: '#6d4c00', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 8px #ffd54f' }}>
          Home
        </Link>
        <Link href="/stories" style={{ background: '#ffe082', padding: '0.7rem 1.5rem', borderRadius: '1rem', textDecoration: 'none', color: '#6d4c00', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 8px #ffd54f' }}>
          Stories & Tributes
        </Link>
      </div>
      <div style={{ background: '#fffde7', borderRadius: '1.5rem', minHeight: '300px', boxShadow: '0 2px 12px #ffd54f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#bfa000', flexDirection: 'column', position: 'relative', maxWidth: 600, margin: '0 auto' }}>
        {loading ? (
          <div>Loading gallery...</div>
        ) : media.length === 0 ? (
          <div>No media found. Upload photos and videos to see them here!</div>
        ) : (
          <>
            <div style={{ width: '100%', textAlign: 'center' }}>
              {media[current]?.resource_type === 'video' ? (
                <video src={media[current]?.secure_url} controls style={{ maxWidth: '100%', borderRadius: '1rem' }} />
              ) : (
                <img src={media[current]?.secure_url} alt={media[current]?.public_id} style={{ maxWidth: '100%', borderRadius: '1rem' }} />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: 16 }}>
              <button onClick={prev} style={{ background: '#ffd54f', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.5rem', color: '#6d4c00', fontWeight: 'bold', cursor: 'pointer' }}>← Prev</button>
              <button onClick={next} style={{ background: '#ffd54f', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.5rem', color: '#6d4c00', fontWeight: 'bold', cursor: 'pointer' }}>Next →</button>
            </div>
            <div style={{ marginTop: 8, color: '#bfa000' }}>{current + 1} / {media.length}</div>
          </>
        )}
      </div>
    </main>
  );
} 