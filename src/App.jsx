// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "./components/ui/toaster";
import Navbar from './components/navbar/NavBar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './components/Home';
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
import ClinicSettings from './components/clinic/ClinicSettings';
import Clinic from './components/clinic/Clinic';
import AddClinic from './components/clinic/AddClinic';
import Roles from './components/profile/roles/Roles';
import RoleSettings from './components/profile/roles/RoleSetting';
import Product from './components/profile/product/Product';
import UpdateProduct from './components/profile/product/UpdateProduct';
import ScheduleSettings from './components/profile/schedulesettings/ScheduleSettings';
import WorkingHours from './components/profile/schedulesettings/WorkingHours';
import ResetPassword from './components/auth/ResetPassword';

function App() {
  return (
    <Router>
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/signup' element={<SignUp />}/>
            <Route path='/login' element={<Login />}/>
            <Route path='/forgotpassword' element={<ForgotPassword />}/>
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/clinic/:clinic_id"element={
              <ProtectedRoute>
                <Navbar />
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/clinic/:clinic_id/schedule" element={
              <ProtectedRoute>
                <Navbar />
                <Schedule />
              </ProtectedRoute>
            } />
            <Route path="/clinic" element={
              <ProtectedRoute>
                <Navbar />
                <Clinic />
              </ProtectedRoute>
              } />
            <Route path="/clinic/:clinic_id/settings" element={
              <ProtectedRoute>
                <Navbar />
                <ClinicSettings />
              </ProtectedRoute>
            } />
            <Route path="/clinic/:clinic_id/schedulesettings" element={
              <ProtectedRoute>
                <Navbar />
                <ScheduleSettings />
              </ProtectedRoute>
            } />
            <Route path="/clinic/:clinic_id/workinghours" element={
              <ProtectedRoute>
                <Navbar />
                <WorkingHours />
              </ProtectedRoute>
            } />
            <Route path="/add-clinic" element={
              <ProtectedRoute>
                <Navbar />
                <AddClinic />
              </ProtectedRoute>
            } />
            <Route path="/clinic/:clinic_id/roles" element={
                <ProtectedRoute>
                  <Navbar />
                  <Roles />
                </ProtectedRoute>
              } />
            <Route path="/clinic/:clinic_id/roles/:role_id" element={
                <ProtectedRoute>
                  <Navbar />
                  <RoleSettings />
                </ProtectedRoute>
              } />
            <Route path="/clinic/:clinic_id/employees" element={
              <ProtectedRoute>
                <Navbar />
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="/clinic/:clinic_id/employees/:employee_id" element={
              <ProtectedRoute>
                <Navbar />
                <EmployeeSettings />
              </ProtectedRoute>
              } />
            <Route path="/clinic/:clinic_id/sellable" element={
              <ProtectedRoute>
                <Navbar />
                <Product />
              </ProtectedRoute>
              } />
            <Route path="/clinic/:clinic_id/sellable/:sellable_id" element={
              <ProtectedRoute>
                <Navbar />
                <UpdateProduct />
              </ProtectedRoute>
              } />
            <Route path="/clinic/:clinic_id/employees/:employee_id" element={
              <ProtectedRoute>
                <Navbar />
                <EmployeeSettings />
              </ProtectedRoute>
              } />
            <Route path="/clinic/:clinic_id/patients" element={
              <ProtectedRoute>
                <Navbar />
                <PatientList />
              </ProtectedRoute>
            } />
            <Route path="/clinic/:clinic_id/patients/:patient_id" element={
              <ProtectedRoute>
                <Navbar />
                <PatientProfile />
              </ProtectedRoute>
              } />
            <Route path="/clinic/:clinic_id/patients/:patient_id/schedule" element={
              <ProtectedRoute>
                <Navbar />
                <PatientSchedule />
              </ProtectedRoute>
              } />
            <Route path="/clinic/:clinic_id/patients/new" element={
              <ProtectedRoute>
                <Navbar />
                <NewPatient />
              </ProtectedRoute>
              } />
            <Route path="/clinic/:clinic_id/profile" element={
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