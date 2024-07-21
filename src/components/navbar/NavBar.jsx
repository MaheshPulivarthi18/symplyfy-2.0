// components/Navbar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from '../../contexts/AuthContext';
import logo from "../../assets/logo_ai 2.svg";
import { Card } from '../ui/card';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/profile':
        return 'Profile';
      case '/patients':
        return 'Patients';
      case '/employees':
        return 'Employees'
      default:
        return 'Symplify';
    }
  };

  return (
    <Card className="flex justify-between items-center p-4 bg-white shadow-md w-full mb-2">
      <div className="flex items-center space-x-2" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
        <img src={logo} alt="Symplify Logo" className="h-8 w-8" />
        <span className="font-bold text-xl">Symplify</span>
      </div>
      <div className="text-lg font-semibold">
        {getPageTitle(location.pathname)}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 text-center text-primary">
            <AvatarFallback>{user?.first_name[0]}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
};

export default Navbar;