export default function Debug() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Info</h1>
      <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'NOT SET'}</p>
      <p><strong>Dataset:</strong> {process.env.NEXT_PUBLIC_SANITY_DATASET || 'NOT SET'}</p>
      <p><strong>Node ENV:</strong> {process.env.NODE_ENV}</p>
    </div>
  )
}