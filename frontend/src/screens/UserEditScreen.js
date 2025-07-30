/*
 * =================================================================
 * FILE: /src/screens/UserEditScreen.js
 * =================================================================
 */
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Store } from '../context/Store';

export default function UserEditScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: userId } = params;

  const { state } = useContext(Store);
  const { userInfo } = state;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setName(data.name);
        setEmail(data.email);
        setIsAdmin(data.isAdmin);
        setLoading(false);
      } catch (err) {
        setError('Could not fetch user details');
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoadingUpdate(true);
      await axios.put( `/api/users/${userId}`,
        { _id: userId, name, email, isAdmin },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setLoadingUpdate(false);
      alert('User updated successfully');
      navigate('/admin/users');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
      setLoadingUpdate(false);
    }
  };

  return (
    <Container className="small-container" style={{maxWidth: '600px', margin: '2rem auto'}}>
      <Button className='my-3' onClick={() => navigate('/admin/users')}>Go Back to Users</Button>
      <h1>Edit User {userId}</h1>
      {loading ? ( <div>Loading...</div> ) : error ? ( <Alert variant="danger">{error}</Alert> ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name"><Form.Label>Name</Form.Label><Form.Control value={name} onChange={(e) => setName(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-3" controlId="email"><Form.Label>Email</Form.Label><Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Form.Group>
          <Form.Check className="mb-3" type="checkbox" id="isAdmin" label="Is Admin" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
          <div className="mb-3">
            <Button type="submit" disabled={loadingUpdate}>Update</Button>
            {loadingUpdate && <div>Updating...</div>}
          </div>
        </Form>
      )}
    </Container>
  );
}
