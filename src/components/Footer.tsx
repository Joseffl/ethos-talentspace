export function Footer() {
  return (
    // <footer className="bg-[#0d1f0e] text-white w-full h-auto mt-12">
    <footer className="bg-gradient-to-r from-[#28ac30] to-[#1f8a26] text-white w-full h-auto mt-12">
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4">MAGS LMS</h4>
            <p className="text-white">
              Your gateway to professional engineering education
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Company</h5>
            <ul className="space-y-2 text-white">
              <li>
                <a href="#" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Resources</h5>
            <ul className="space-y-2 text-white">
              <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Legal</h5>
            <ul className="space-y-2 text-white">
              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white mt-8 pt-8 text-center text-white">
          <p>&copy; 2022 MAGS ENGINEERING LIMITED. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}