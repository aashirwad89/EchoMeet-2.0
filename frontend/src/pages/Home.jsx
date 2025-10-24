import { Button, IconButton, TextField, ThemeProvider, createTheme } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Video, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
    },
    secondary: {
      main: '#10b981',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
  },
});

const Home = () => {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const {addtoUserHistory} = useContext(AuthContext);
  
  let handleVideoCall = async () => {
    await  addtoUserHistory(meetingCode)
    navigate(`/${meetingCode}`);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
        {/* Navbar */}
        <nav className="navbar px-8 py-4 flex items-center justify-between border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg">
          <div className="flex items-center gap-3"></div>
<br />
          <div className="flex items-center gap-2">
            <a href="/history">
            <IconButton 
              className="flex flex-col items-center gap-1"
              sx={{ 
                color: '#9ca3af',
                '&:hover': { 
                  backgroundColor: '#1f2937',
                  color: '#3b82f6'
                }
              }}
            >
              <History className="w-5 h-5" />
              <p className="text-xs">History</p>
            </IconButton>
            </a>
            
            <Button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/auth");
              }}
              variant="outlined"
              startIcon={<LogOut className="w-4 h-4" />}
              sx={{
                borderColor: '#374151',
                color: '#9ca3af',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#ef4444',
                  backgroundColor: '#7f1d1d',
                  color: '#ef4444'
                }
              }}
            >
              Logout
            </Button>
             
          </div>
        </nav>

        {/* Main Content */}
        <div id='Home' className="meetContainer flex items-center justify-between px-12 py-16 gap-12 max-w-7xl mx-auto">
          {/* Left Panel */}
          <div className="leftPanel flex-1">
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-bold text-white mb-3 leading-tight">
                  Providing Quality <br />
                  <span className="text-blue-500">Video Call</span> Service
                </h2>
                <p className="text-gray-400 text-lg">
                  Connect with your team seamlessly and collaborate in real-time
                </p>
              </div>
<br />
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-2xl">
                <h3 className=" join text-xl font-semibold text-white mb-6">Join a Meeting</h3>
                <br />
                <div className=" textField flex gap-6">
                  <TextField
                    onChange={e => setMeetingCode(e.target.value)}
                    id="outlined-basic"
                    label="Meeting Code"
                    variant="outlined"
                    className='w-100 h-17'
                    value={meetingCode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#374151',
                        },
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#9ca3af',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#3b82f6',
                      },
                      '& .MuiOutlinedInput-input': {
                        color: '#fff',
                      },
                    }}
                  />
                  
                  <Button
                    onClick={handleVideoCall}
                    variant="contained"
                    className='w-30 h-13'
                    sx={{
                      backgroundColor: '#3b82f6',
                      textTransform: 'none',
                      fontSize: '16px',
                      paddingX: '32px',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                      },
                      boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                    }}
                  >
                    Join
                  </Button>
                </div>
              </div>
<br />
              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 text-center hover:bg-gray-800/50 transition-all">
                  <div className="bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Video className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">HD Quality</p>
                  <p className="text-gray-500 text-xs mt-1">Crystal clear</p>
                </div>
                
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 text-center hover:bg-gray-800/50 transition-all">
                  <div className="bg-emerald-600/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Video className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">Secure</p>
                  <p className="text-gray-500 text-xs mt-1">End-to-end</p>
                </div>
                
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 text-center hover:bg-gray-800/50 transition-all">
                  <div className="bg-amber-600/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Video className="w-6 h-6 text-amber-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">Fast</p>
                  <p className="text-gray-500 text-xs mt-1">Low latency</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="right-panel flex-1 hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/20 rounded-3xl blur-3xl"></div>
              <img
                src="/images/login-banner.png"
                className="w-full h-auto object-cover rounded-3xl shadow-2xl relative z-10 border border-gray-700"
                alt="Video call illustration"
              />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Home;