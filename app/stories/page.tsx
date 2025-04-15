"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

const PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2ZkAAAAASUVORK5CYII=';

async function fetchUserStories() {
  const res = await fetch('/api/stories');
  if (!res.ok) return [];
  const data = await res.json();
  console.log('Cloudinary stories resources:', data.resources);
  // Only user-uploaded: has context.name or context.story (robust to missing fields)
  return (data.resources || []).filter((item: any) =>
    item.context?.name?.trim() || item.context?.story?.trim()
  );
}

export default function Stories() {
  const [name, setName] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  useEffect(() => {
    fetchUserStories().then((data) => {
      setStories(data);
      setLoadingStories(false);
    });
  }, [preview]); // refetch after new upload

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !caption.trim()) {
      setError('Name and story are required.');
      return;
    }
    setSubmitting(true);
    let mediaUrl = null;
    let public_id = null;
    const formData = new FormData();
    formData.append('context', `name=${name}|story=${caption}`);
    if (file) {
      formData.append('file', file);
    } else {
      // Upload placeholder image as file
      const res = await fetch(PLACEHOLDER_IMAGE);
      const blob = await res.blob();
      const placeholderFile = new File([blob], 'placeholder.png', { type: 'image/png' });
      formData.append('file', placeholderFile);
    }
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Upload failed');
      setSubmitting(false);
      return;
    }
    mediaUrl = data.url;
    public_id = data.public_id;
    setPreview({ name, caption, mediaUrl, public_id });
    setName('');
    setCaption('');
    setFile(null);
    setSubmitting(false);
  }

  return (
    <main style={{ background: 'linear-gradient(135deg, #ffe082 0%, #ffd54f 100%)', minHeight: '100vh', color: '#6d4c00', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', fontFamily: 'Comic Sans MS, Comic Sans, cursive', fontSize: '2.5rem', marginBottom: '1rem' }}>Stories & Tributes</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Share your memories, photos, and videos of Tensor below.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
        <Link href="/" style={{ background: '#ffecb3', padding: '0.7rem 1.5rem', borderRadius: '1rem', textDecoration: 'none', color: '#6d4c00', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 8px #ffd54f' }}>
          Home
        </Link>
        <Link href="/gallery" style={{ background: '#ffe082', padding: '0.7rem 1.5rem', borderRadius: '1rem', textDecoration: 'none', color: '#6d4c00', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 8px #ffd54f' }}>
          Gallery
        </Link>
      </div>
      <form onSubmit={handleSubmit} style={{ background: '#fffde7', borderRadius: '1.5rem', boxShadow: '0 2px 12px #ffd54f', padding: '2rem', maxWidth: 500, margin: '0 auto 2rem auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <label style={{ fontWeight: 'bold' }}>
          Name*:
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ffd54f', marginTop: 4 }} />
        </label>
        <label style={{ fontWeight: 'bold' }}>
          Your story with Tensor*:
          <textarea value={caption} onChange={e => setCaption(e.target.value)} required rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ffd54f', marginTop: 4 }} />
        </label>
        <label style={{ fontWeight: 'bold' }}>
          Photo or Video (optional):
          <input type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ marginTop: 4 }} />
        </label>
        {error && <div style={{ color: 'red', fontWeight: 'bold' }}>{error}</div>}
        <button type="submit" disabled={submitting} style={{ background: '#ffd54f', color: '#6d4c00', fontWeight: 'bold', border: 'none', borderRadius: '1rem', padding: '0.8rem', fontSize: '1.1rem', boxShadow: '0 2px 8px #ffd54f', cursor: 'pointer' }}>
          {submitting ? 'Submitting...' : 'Share Tribute'}
        </button>
      </form>
      {preview && (
        <div style={{ background: '#fffde7', borderRadius: '1.5rem', boxShadow: '0 2px 12px #ffd54f', padding: '1.5rem', color: '#bfa000', maxWidth: 500, margin: '0 auto 2rem auto' }}>
          <h3 style={{ color: '#6d4c00' }}>{preview.name}</h3>
          <p>{preview.caption}</p>
          {preview.mediaUrl && (
            preview.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={preview.mediaUrl} controls style={{ maxWidth: '100%', borderRadius: '1rem', marginTop: 8 }} />
            ) : (
              <img src={preview.mediaUrl} alt="Tribute media" style={{ maxWidth: '100%', borderRadius: '1rem', marginTop: 8 }} />
            )
          )}
        </div>
      )}
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ color: '#6d4c00', marginTop: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Stories Shared by Friends</h2>
        {loadingStories ? (
          <div style={{ textAlign: 'center', color: '#bfa000' }}>Loading stories...</div>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#bfa000' }}>No stories yet. Be the first to share a memory!</div>
        ) : (
          stories.map((story, idx) => (
            <div key={story.public_id || idx} style={{ background: '#fffde7', borderRadius: '1.5rem', boxShadow: '0 2px 12px #ffd54f', padding: '1.5rem', color: '#6d4c00', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{story.context?.name}</h3>
              <p style={{ fontStyle: 'italic', margin: '0.5rem 0 1rem 0' }}>{story.context?.story}</p>
              {story.resource_type === 'video' ? (
                <video src={story.secure_url} controls style={{ maxWidth: '100%', borderRadius: '1rem' }} />
              ) : story.secure_url && !story.secure_url.includes('placeholder') ? (
                <img src={story.secure_url} alt={story.context?.story} style={{ maxWidth: '100%', borderRadius: '1rem' }} />
              ) : (
                <div style={{ width: '100%', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffe082', borderRadius: '1rem', color: '#bfa000', fontSize: 32, fontWeight: 'bold' }}>
                  🐶 No image
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
} 