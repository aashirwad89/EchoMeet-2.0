import React from 'react'
import Landing from './pages/Landing'
import {Route , BrowserRouter as Router, Routes} from 'react-router-dom'
import Authentication from './pages/Authentication'
import { AuthProvider } from './context/AuthContext'
import VideoMeet from './pages/VideoMeet'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import History from './pages/History'

function App() {
  return (
   <>
   <Router>
    <Navbar/>
    <AuthProvider>
    <Routes>
      <Route path='/' element={<Landing/>}/>
      <Route path='/auth' element={<Authentication/>}/>
      <Route path='/:url' element={<VideoMeet/>}/>
      <Route path='/home' element={<Home/>}/>
      <Route path='/history' element={<History/>}/>
    </Routes>
    </AuthProvider>
   </Router>
   </>
  )
}

export default App
