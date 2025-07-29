/*
 * =================================================================
 * FILE: /src/components/AdminRoute.js (NEW FILE)
 * =================================================================
 * A special component to protect routes that only admins should see.
 * Create this file in `frontend/src/components`.
 */
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Store } from '../context/Store';

export default function AdminRoute() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  return userInfo && userInfo.isAdmin ? <Outlet /> : <Navigate to="/login" />;
}