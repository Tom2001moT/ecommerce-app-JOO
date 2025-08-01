/*
 * =================================================================
 * FILE: /src/screens/ProductEditScreen.js
 * =================================================================
 */
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Store } from '../context/Store';

export default function ProductEditScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: productId } = params;

  const { state } = useContext(Store);
  const { userInfo } = state;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/products/${productId}`);
        setName(data.name);
        setPrice(data.price);
        setImage(data.image);
        setCategory(data.category);
        setCountInStock(data.countInStock);
        setBrand(data.brand);
        setDescription(data.description);
        setLoading(false);
      } catch (err) {
        setError('Could not fetch product details');
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoadingUpdate(true);
      await axios.put( `/api/products/${productId}`,
        { _id: productId, name, price, image, category, brand, countInStock, description },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setLoadingUpdate(false);
      alert('Product updated successfully');
      navigate('/admin/products');
    } catch (err) {
      alert('Failed to update product');
      setLoadingUpdate(false);
    }
  };

  return (
    <Container className="small-container" style={{maxWidth: '600px', margin: '2rem auto'}}>
        <Button className='my-3' onClick={() => navigate('/admin/products')}>Go Back to Products</Button>
        <h1>Edit Product {productId}</h1>
        {loading ? ( <div>Loading...</div> ) : error ? ( <Alert variant="danger">{error}</Alert> ) : (
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="name"><Form.Label>Name</Form.Label><Form.Control value={name} onChange={(e) => setName(e.target.value)} required /></Form.Group>
                <Form.Group className="mb-3" controlId="price"><Form.Label>Price</Form.Label><Form.Control value={price} onChange={(e) => setPrice(e.target.value)} required /></Form.Group>
                <Form.Group className="mb-3" controlId="image"><Form.Label>Image File</Form.Label><Form.Control value={image} onChange={(e) => setImage(e.target.value)} required /></Form.Group>
                <Form.Group className="mb-3" controlId="category"><Form.Label>Category</Form.Label><Form.Control value={category} onChange={(e) => setCategory(e.target.value)} required /></Form.Group>
                <Form.Group className="mb-3" controlId="brand"><Form.Label>Brand</Form.Label><Form.Control value={brand} onChange={(e) => setBrand(e.target.value)} required /></Form.Group>
                <Form.Group className="mb-3" controlId="countInStock"><Form.Label>Count In Stock</Form.Label><Form.Control value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required /></Form.Group>
                <Form.Group className="mb-3" controlId="description"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required /></Form.Group>
                <div className="mb-3">
                    <Button type="submit" disabled={loadingUpdate}>Update</Button>
                    {loadingUpdate && <div>Updating...</div>}
                </div>
            </Form>
        )}
    </Container>
  );
}

