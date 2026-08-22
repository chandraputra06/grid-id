export default function OnboardingLayout({ children }) {
  return (
    <div className="bg-grid-dots flex min-h-screen flex-col items-center justify-center bg-surface px-5 py-10">
      <div className="mb-6 font-headline-md text-headline-md font-bold text-primary-container">
        GRID<span className="text-secondary-container">·</span>ID
      </div>
      <div className="w-full max-w-[440px] rounded-2xl border border-outline-variant bg-card-surface p-8 shadow-[0_8px_30px_rgba(13,27,42,0.08)]">
        {children}
      </div>
    </div>
  );
}
