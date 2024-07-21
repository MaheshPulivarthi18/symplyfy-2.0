import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "./components/ui/toaster";
import Navbar from './components/navbar/NavBar';
import ProtectedRoute from './components/auth/ProtectedRoute';
// import Home from './components/Home';
import Dashboard from './components/dashboard/Dashboard';
import Schedule from './components/schedule/Schedule';
import SignUp from './components/auth/SignUp';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import Employees from './components/profile/employees/Employees';
import Profile from './components/profile/Profile';
import './App.css';
import './index.css';
import EmployeeSettings from './components/profile/employees/EmployeeSetting';
import NewPatient from './components/patient/profile/NewPatient';
import PatientSchedule from './components/patient/patientschedule/PatienSchedule';
import PatientProfile from './components/patient/profile/PatientProfile';
import PatientList from './components/patient/Patients';

function App() {
  return (
    <Router>
      <AuthProvider>
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path='/signup' element={<SignUp />}/>
            <Route path='/login' element={<Login />}/>
            <Route path='/forgotpassword' element={<ForgotPassword />}/>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navbar />
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <Navbar />
                <Schedule />
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <Navbar />
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="/employees/settings/:id" element={
              <ProtectedRoute>
                <Navbar />
                <EmployeeSettings />
              </ProtectedRoute>
              } />
            <Route path="/patients" element={
              <ProtectedRoute>
                <Navbar />
                <PatientList />
              </ProtectedRoute>
            } />
            <Route path="/patient/profile/:id" element={
              <ProtectedRoute>
                <Navbar />
                <PatientProfile />
              </ProtectedRoute>
              } />
            <Route path="/patient/profile/:id/schedule" element={
              <ProtectedRoute>
                <Navbar />
                <PatientSchedule />
              </ProtectedRoute>
              } />
            <Route path="/patient/new" element={
              <ProtectedRoute>
                <Navbar />
                <NewPatient />
              </ProtectedRoute>
              } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Navbar />
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;