import React, { useState, useContext, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Store } from '../context/Store';
import CheckoutSteps from '../components/CheckoutSteps';

export default function ShippingAddressScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;

  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/shipping');
    }
  }, [userInfo, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: { fullName, address, city, postalCode, country },
    });
    navigate('/payment');
  };

  return (
    <div>
      {/* FIX: Pass step2 to correctly highlight the progress bar */}
      <CheckoutSteps step1 step2 />
      <div className="container small-container" style={{maxWidth: '600px', margin: '2rem auto'}}>
        <h1 className="my-3">Shipping Address</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName"><Form.Label>Full Name</Form.Label><Form.Control value={fullName} onChange={(e) => setFullName(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-3" controlId="address"><Form.Label>Address</Form.Label><Form.Control value={address} onChange={(e) => setAddress(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-3" controlId="city"><Form.Label>City</Form.Label><Form.Control value={city} onChange={(e) => setCity(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-3" controlId="postalCode"><Form.Label>Postal Code</Form.Label><Form.Control value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-3" controlId="country"><Form.Label>Country</Form.Label><Form.Control value={country} onChange={(e) => setCountry(e.target.value)} required /></Form.Group>
          <div className="mb-3">
            <Button variant="primary" type="submit">Continue</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}