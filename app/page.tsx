export default function HomePage() {
  return (
    <main className="min-h-screen p-8 bg-background text-text font-body">
      <h1 className="text-5xl font-heading text-heading mb-4">
        Build Beautifully
      </h1>
      <h2 className="text-2xl font-subheading text-subheading mb-6">
        Elegant UI with Smart Color Strategy
      </h2>
      <p className="mb-6 max-w-prose">
        This modern layout combines accessibility, aesthetic warmth, and purpose-driven design using subtle pinks, trusted neutrals, and expressive typography.
      </p>

      <a
        href="#"
        className="inline-block underline font-link text-link hover:opacity-80 mb-6"
      >
        Learn more
      </a>

      <div>
        <button className="px-6 py-3 rounded font-button bg-button text-white hover:bg-button-hover transition">
          Get Started
        </button>
      </div>
    </main>
  );
}
