export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant flex justify-between items-center h-16 px-margin-desktop">
      <div className="flex items-center gap-4">
        <span className="font-headline-sm text-headline-sm font-bold text-primary">
          PLC Software Management
        </span>
      </div>
    </header>
  );
}
