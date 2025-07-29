/*
 * =================================================================
 * FILE: /src/screens/ProductListScreen.js (NEW FILE)
 * =================================================================
 * The new screen for the admin product list.
 * Create this file in `frontend/src/screens`.
 */
import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Table } from 'react-bootstrap';
import { Store } from '../context/Store';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };
    case 'DELETE_RESET':
      return { ...state, successDelete: false };
    default:
      return state;
  }
};

export default function ProductListScreen() {
  const navigate = useNavigate();
  const [{ loading, error, products, loadingCreate, successDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/products`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: 'Failed to fetch products' });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const createHandler = async () => {
    if (window.confirm('Are you sure you want to create a new product?')) {
      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const { data } = await axios.post('/api/products', {}, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        alert('Product created successfully');
        dispatch({ type: 'CREATE_SUCCESS' });
        navigate(`/admin/product/${data._id}`); // We will build this edit screen next
      } catch (err) {
        alert('Failed to create product');
        dispatch({ type: 'CREATE_FAIL' });
      }
    }
  };

  const deleteHandler = async (product) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
        try {
            dispatch({ type: 'DELETE_REQUEST' });
            await axios.delete(`/api/products/${product._id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            alert('Product deleted successfully');
            dispatch({ type: 'DELETE_SUCCESS' });
        } catch (err) {
            alert('Failed to delete product');
            dispatch({ type: 'DELETE_FAIL' });
        }
    }
  }

  return (
    <div>
      <Row>
        <Col><h1>Products</h1></Col>
        <Col className="col text-end">
          <div>
            <Button type="button" onClick={createHandler} disabled={loadingCreate}>
              Create Product
            </Button>
          </div>
        </Col>
      </Row>

      {loadingCreate && <div>Creating...</div>}
      {loading ? ( <div>Loading...</div> ) : error ? ( <div>{error}</div> ) : (
        <Table striped bordered hover responsive className="table-sm mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>PRICE</th>
              <th>CATEGORY</th>
              <th>BRAND</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product._id}</td>
                <td>{product.name}</td>
                <td>${product.price}</td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  <Button type="button" variant="light" size="sm" onClick={() => navigate(`/admin/product/${product._id}`)}>Edit</Button>
                  &nbsp;
                  <Button type="button" variant="light" size="sm" onClick={() => deleteHandler(product)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
