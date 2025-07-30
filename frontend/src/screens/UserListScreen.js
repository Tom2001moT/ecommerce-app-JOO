/*
 * =================================================================
 * FILE: /src/screens/UserListScreen.js (UPDATED)
 * =================================================================
 * This version enables the "Edit" button and makes it navigate to the
 * new UserEditScreen.
 */
import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Table, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Store } from '../context/Store';

const reducer = (state, action) => {
  // ... reducer code remains the same
  switch (action.type) {
    case 'FETCH_REQUEST': return { ...state, loading: true };
    case 'FETCH_SUCCESS': return { ...state, users: action.payload, loading: false };
    case 'FETCH_FAIL': return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST': return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS': return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL': return { ...state, loadingDelete: false };
    case 'DELETE_RESET': return { ...state, successDelete: false };
    case 'UPDATE_REQUEST': return { ...state, loadingUpdate: true, successUpdate: false };
    case 'UPDATE_SUCCESS': return { ...state, loadingUpdate: false, successUpdate: true };
    case 'UPDATE_FAIL': return { ...state, loadingUpdate: false };
    case 'UPDATE_RESET': return { ...state, successUpdate: false };
    default: return state;
  }
};

export default function UserListScreen() {
  const navigate = useNavigate();
  const [{ loading, error, users, successDelete, successUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/users`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: 'Failed to fetch users' });
      }
    };
    if (successDelete || successUpdate) {
        if(successDelete) dispatch({ type: 'DELETE_RESET' });
        if(successUpdate) dispatch({ type: 'UPDATE_RESET' });
        fetchData();
    } else {
        fetchData();
    }
  }, [userInfo, successDelete, successUpdate]);

  const deleteHandler = async (user) => {
      if (window.confirm('Are you sure you want to delete this user?')) {
          try {
              dispatch({ type: 'DELETE_REQUEST' });
              await axios.delete(`/api/users/${user._id}`, {
                  headers: { Authorization: `Bearer ${userInfo.token}` },
              });
              alert('User deleted successfully');
              dispatch({ type: 'DELETE_SUCCESS' });
          } catch (err) {
              alert(err.response?.data?.message || 'Failed to delete user');
              dispatch({ type: 'DELETE_FAIL' });
          }
      }
  };

  const toggleAdminHandler = async (user, makeAdmin) => {
      const action = makeAdmin ? 'recruit' : 'remove';
      if (window.confirm(`Are you sure you want to ${action} ${user.name} as an admin?`)) {
          try {
              dispatch({ type: 'UPDATE_REQUEST' });
              await axios.put(`/api/users/${user._id}`, 
                { isAdmin: makeAdmin }, 
                {
                  headers: { Authorization: `Bearer ${userInfo.token}` },
                }
              );
              alert(`User admin status updated successfully`);
              dispatch({ type: 'UPDATE_SUCCESS' });
          } catch (err) {
              alert(err.response?.data?.message || 'Failed to update user');
              dispatch({ type: 'UPDATE_FAIL' });
          }
      }
  }

  return (
    <div>
      <h1>Users</h1>
      {loading ? ( <div>Loading...</div> ) : error ? ( <Alert variant="danger">{error}</Alert> ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>IS ADMIN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                <td>
                  {/* --- THIS BUTTON IS NOW ENABLED --- */}
                  <Button 
                    type="button" 
                    variant="light" 
                    size="sm" 
                    onClick={() => navigate(`/admin/user/${user._id}`)}
                  >
                    Edit
                  </Button>
                  &nbsp;
                  <Button type="button" variant="light" size="sm" onClick={() => deleteHandler(user)} disabled={user._id === userInfo._id}>
                    Delete
                  </Button>
                  &nbsp;
                  {user.isAdmin ? (
                    <Button type="button" variant="light" size="sm" onClick={() => toggleAdminHandler(user, false)} disabled={user._id === userInfo._id}>
                      Remove Admin
                    </Button>
                  ) : (
                    <Button type="button" variant="light" size="sm" onClick={() => toggleAdminHandler(user, true)}>
                      Recruit as Admin
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
