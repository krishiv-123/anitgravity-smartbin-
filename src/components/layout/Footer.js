export default function Footer() {
  return (
    <footer className="bg-sp-panel border-t border-sp-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-sp-lime/20 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-sp-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-sm text-gray-400">
              Smart<span className="text-sp-lime">Park</span> — IoT Bin Monitoring System
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Greenfield Demo City</span>
            <span>•</span>
            <span>All readings are simulated demo data</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
