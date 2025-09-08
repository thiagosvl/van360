export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-2">Total de Motoristas</h2>
          <p className="text-muted-foreground">Em breve...</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-2">Cobranças Pendentes</h2>
          <p className="text-muted-foreground">Em breve...</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-2">Receita Mensal</h2>
          <p className="text-muted-foreground">Em breve...</p>
        </div>
      </div>
    </div>
  );
}