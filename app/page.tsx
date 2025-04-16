import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main} style={{ background: 'linear-gradient(135deg, #ffe082 0%, #ffd54f 100%)', minHeight: '100vh', color: '#6d4c00' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive', fontSize: '3rem', marginBottom: '1rem' }}>Remembering Tensor</h1>
        <p style={{ fontSize: '1.3rem', marginBottom: '2rem' }}>
          2018.06.05-2025.04.15
        </p>
        <img
          src="/family.jpg"
          alt="Featured Tensor"
          style={{ borderRadius: '2rem', boxShadow: '0 4px 24px #ffd54f', width: '320px', maxWidth: '90%', marginBottom: '2rem' }}
        />
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <Link href="/gallery" style={{ background: '#ffecb3', padding: '1rem 2rem', borderRadius: '1rem', textDecoration: 'none', color: '#6d4c00', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 8px #ffd54f' }}>
            Gallery
          </Link>
          <Link href="/stories" style={{ background: '#ffe082', padding: '1rem 2rem', borderRadius: '1rem', textDecoration: 'none', color: '#6d4c00', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 8px #ffd54f' }}>
            Stories & Tributes
          </Link>
        </div>
      </div>
    </main>
  );
}
