export default function StandingsTable() {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl">
      <iframe
        width="100%"
        height="220"
        style={{ border: 'none', overflow: 'hidden' }}
        src="https://fcstats.com/get-table,87,es.php"
        title="Tabla de Posiciones Primera División"
      />
    </div>
  );
}
