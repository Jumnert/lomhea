import Link from "next/link";
import { Home, Compass, Heart, User } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-zinc-50 dark:bg-zinc-900 flex flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Explore</h2>
        <nav className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <Home size={20} /> Home
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <Compass size={20} /> Explore
          </Link>
          <Link
            href="/favorites"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <Heart size={20} /> Favorites
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <User size={20} /> Profile
          </Link>
        </nav>
      </div>
    </aside>
  );
}
