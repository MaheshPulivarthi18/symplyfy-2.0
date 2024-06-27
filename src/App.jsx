import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import './App.css'

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            {/* <li><Link to="/">Home</Link></li> */}
            {/* <li><Link to="/dashboard">Dashboard</Link></li> */}
            {/* <li><Link to="/schedule">Schedule</Link></li> */}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;