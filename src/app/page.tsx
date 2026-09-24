import Link from "next/link";

export default function HomePage() {
  return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold">
            Welcome
          </h1>

          <div className="flex gap-4">
            <Link
                href="/login"
                className="bg-black px-4 py-2 text-white"
            >
              Login
            </Link>

            <Link
                href="/signup"
                className="border px-4 py-2"
            >
              Sign up
            </Link>

            <Link
                href="/dashboard"
                className="border px-4 py-2"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>
  );
}