import React from 'react';
import { useNavigate } from 'react-router-dom';
import BillingManagerDashboard from './billing-manager-dashboard';

const BillingManagement = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return <BillingManagerDashboard />;
};

export default BillingManagement;
