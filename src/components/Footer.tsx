export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white w-full h-auto mt-12">
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4">Ethos Talentspace</h4>
            <p className="text-white">
              The trust layer for the on-chain economy. Connecting verified talent with top Web3 projects.
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Talentspace</h5>
            <ul className="space-y-2 text-white">
              <li>
                <a href="/explore" className="hover:text-white">
                  Explore Talent
                </a>
              </li>
              <li>
                <a href="/all-courses" className="hover:text-white">
                  Browse Services
                </a>
              </li>
              <li>
                <a href="/jobs" className="hover:text-white">
                  Active Gigs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Platform</h5>
            <ul className="space-y-2 text-white">
              <li>
                <a href="/reputation" className="hover:text-white">
                  Reputation System
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="hover:text-white">
                  Vouch & Slash
                </a>
              </li>
              <li>
                <a href="/docs" className="hover:text-white">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Legal</h5>
            <ul className="space-y-2 text-white">
              <li>
                <a href="/privacy" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/safety" className="hover:text-white">
                  Trust & Safety
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white mt-8 pt-8 text-center text-white">
          <p>&copy; {new Date().getFullYear()} Ethos Talentspace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}