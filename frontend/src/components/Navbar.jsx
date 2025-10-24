import { useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation();
  
  // Check if current path is /auth or a meeting room
  const isAuthPage = location.pathname === '/auth';
  const isMeetingRoom = location.pathname !== '/' && 
                        location.pathname !== '/auth' && 
                        !location.pathname.includes('#');
  
  // Show minimal navbar on auth and meeting pages
  const showMinimalNav = isAuthPage || isMeetingRoom;

  return (
    <nav className="bg-black text-white h-16 w-full flex items-center justify-between px-6 shadow-md">
      
      {/* Left - Logo */}
      <div className="flex items-center gap-2">
        <a href="/" className="flex items-center gap-2">
          <img src="/images/echomeet.png" alt="EchoMeet Logo" className="h-14 w-13" />
          <span className="text-base font-semibold tracking-wide">Echo Meet</span>
        </a>
      </div>

      {/* Center - Nav Links (Hidden on /auth and meeting pages) */}
      {!showMinimalNav && (
        <div className="hidden md:flex gap-6 text-gray-300 text-md font-medium">
          <a href="/" className="hover:text-white  transition">Home</a>
          <a href="#" className="hover:text-white transition">Join as Guest</a>
          <a href="#about" className="hover:text-white transition">About us</a>
        </div>
      )}

      {/* Right - Buttons (Hidden on /auth and meeting pages) */}
      {!showMinimalNav && (
        <div className="flex items-center gap-3 text-md">
          <button className="h-9 w-24 px-4 cursor-pointer rounded-md bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition font-medium">
            <a href="/auth">Sign In</a>
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar