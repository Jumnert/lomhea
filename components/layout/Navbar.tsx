export default function Navbar() {
  return (
    <header className="h-16 px-6 flex items-center justify-between border-b bg-white dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight">Lomhea</h1>
      </div>
      <div className="flex items-center gap-4">{/* User Profile / Auth */}</div>
    </header>
  );
}
