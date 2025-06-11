export default function BlogAdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 via-yellow-300 to-orange-500 py-10">
      <div className="mx-auto w-full max-w-4xl rounded-xl bg-white/80 p-8 shadow-lg">
        <div className="mx-auto w-full max-w-4xl p-6">{children}</div>
      </div>
    </div>
  );
}
