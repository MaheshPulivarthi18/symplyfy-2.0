// Employees.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";

const doctors = [
  { id: 1, firstName: 'Dr. Brown', lastName: 'Smith', email: 'brown.smith@example.com' },
  { id: 2, firstName: 'Dr. White', lastName: 'Johnson', email: 'white.johnson@example.com' },
  { id: 3, firstName: 'Dr. Green', lastName: 'Williams', email: 'green.williams@example.com' },
  { id: 4, firstName: 'Dr. Yellow', lastName: 'Jones', email: 'yellow.jones@example.com' },
  { id: 5, firstName: 'Dr. Red', lastName: 'Davis', email: 'red.davis@example.com' },
  { id: 6, firstName: 'Dr. Orange', lastName: 'Miller', email: 'orange.miller@example.com' },
];

const Employees = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);


  return (
    <div className="container mx-auto p-4 w-full">
    {/* {`container mx-auto p-4 w-full shadow-xl transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}             */}
      <Card className={`container mx-auto p-4 w-full shadow-xl transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Employees List</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {doctors.map((doctor) => (
              <li key={doctor.id}>
                <Link to={`/employees/settings/${doctor.id}`}>
                  <Button variant="outline" className="w-full text-left bg-secondary hover:bg-white">
                    <span>{doctor.firstName} {doctor.lastName}</span>
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;