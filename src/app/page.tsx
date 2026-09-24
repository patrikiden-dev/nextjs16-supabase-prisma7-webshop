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
                className="border border-black px-6 py-3 hover:bg-black hover:text-white"
            >
              Login
            </Link>

            <Link
                href="/signup"
                className="border border-black px-6 py-3 hover:bg-black hover:text-white"
            >
              Sign up
            </Link>
          </div>
        </div>
      </main>
  );
}