export default function RootLoading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 200, padding: 40,
    }}>
      <div className="loading-dots"><div /><div /><div /></div>
    </div>
  );
}
