/*
 * =================================================================
 * FILE: /src/screens/OrderHistoryScreen.js
 * =================================================================
 */
import React, { useContext, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store } from '../context/Store';
import { Table, Button, Alert } from 'react-bootstrap';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST': return { ...state, loading: true };
    case 'FETCH_SUCCESS': return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL': return { ...state, loading: false, error: action.payload };
    default: return state;
  }
};

export default function OrderHistoryScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/orders/mine`, { headers: { Authorization: `Bearer ${userInfo.token}` } });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: 'Failed to fetch order history' });
      }
    };
    if (!userInfo) {
      navigate('/login');
    } else {
        fetchData();
    }
  }, [userInfo, navigate]);

  return (
    <div>
      <Button className='my-3' onClick={() => navigate('/')}>Go Back</Button>
      <h1>Order History</h1>
      {loading ? ( <div>Loading...</div> ) : error ? ( <Alert variant="danger">{error}</Alert> ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toFixed(2)}</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                <td>{order.isDelivered ? order.deliveredAt.substring(0, 10) : 'No'}</td>
                <td>
                  <Button type="button" variant="light" onClick={() => { navigate(`/order/${order._id}`); }}>
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}