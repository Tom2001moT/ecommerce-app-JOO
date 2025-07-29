import React, { useContext, useEffect, useReducer } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, ListGroup, Image, Card, Alert, Button } from 'react-bootstrap';
import { Store } from '../context/Store';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST': return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS': return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL': return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST': return { ...state, loadingPay: true };
    case 'PAY_SUCCESS': return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL': return { ...state, loadingPay: false };
    case 'PAY_RESET': return { ...state, loadingPay: false, successPay: false };
    default: return state;
  }
}

export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;

  const [{ loading, error, order, successPay, loadingPay }, dispatch] = useReducer(reducer, {
    loading: true, order: {}, error: '', successPay: false, loadingPay: false,
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  // PayPal Functions
  function createOrder(data, actions) {
    return actions.order.create({ purchase_units: [{ amount: { value: order.totalPrice } }] }).then((orderID) => orderID);
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(`/api/orders/${order._id}/pay`, details, { headers: { authorization: `Bearer ${userInfo.token}` } });
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        alert('Order is paid');
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: 'Payment failed' });
        alert('Payment failed');
      }
    });
  }

  function onError(err) {
    alert('An error occurred with your payment');
  }

  // Razorpay Function
  const razorpayPaymentHandler = async () => {
      try {
        const { data: razorpayKey } = await axios.get('/api/config/razorpay');
        const { data: razorpayOrder } = await axios.post(`/api/orders/${order._id}/razorpay`, {}, {
            headers: { authorization: `Bearer ${userInfo.token}` }
        });
        
        const options = {
            key: razorpayKey,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "ProShop",
            description: `Payment for Order ${order._id}`,
            order_id: razorpayOrder.id,
            handler: async function (response) {
                try {
                    dispatch({ type: 'PAY_REQUEST' });
                    const { data } = await axios.put(`/api/orders/${order._id}/pay`, response, {
                        headers: { authorization: `Bearer ${userInfo.token}` }
                    });
                    dispatch({ type: 'PAY_SUCCESS', payload: data });
                    alert('Order is paid');
                } catch (err) {
                    dispatch({ type: 'PAY_FAIL' });
                    alert('Payment verification failed');
                }
            },
            prefill: {
                name: userInfo.name,
                email: userInfo.email,
            },
            theme: {
                color: "#3399cc"
            }
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } catch (err) {
          alert('Failed to initiate Razorpay payment');
      }
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, { headers: { authorization: `Bearer ${userInfo.token}` } });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: 'Order Not Found' });
      }
    };

    if (!userInfo) { return; }
    if (!order._id || successPay || (order._id && order._id !== orderId)) {
        fetchOrder();
        if (successPay) { dispatch({ type: 'PAY_RESET' }); }
    } else if (order.paymentMethod === 'PayPal') {
        const loadPaypalScript = async () => {
            const { data: clientId } = await axios.get('/api/config/paypal', { headers: { authorization: `Bearer ${userInfo.token}` } });
            paypalDispatch({ type: 'resetOptions', value: { 'client-id': clientId, currency: 'USD' } });
            paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
        }
        loadPaypalScript();
    }
  }, [order, userInfo, orderId, paypalDispatch, successPay]);

  return loading ? (<div>Loading...</div>) : error ? (<Alert variant="danger">{error}</Alert>) : (
    <div>
      <h1 className="my-3">Order {orderId}</h1>
      <Row>
        <Col md={8}>
          {/* ... (ListGroup for Shipping, Payment, Order Items remains the same) ... */}
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p><strong>Name:</strong> {order.shippingAddress.fullName} <br /><strong>Address: </strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
              {order.isDelivered ? (<Alert variant="success">Delivered at {order.deliveredAt}</Alert>) : (<Alert variant="danger">Not Delivered</Alert>)}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Payment</h2>
              <p><strong>Method:</strong> {order.paymentMethod}</p>
              {order.isPaid ? (<Alert variant="success">Paid on {new Date(order.paidAt).toLocaleString()}</Alert>) : (<Alert variant="danger">Not Paid</Alert>)}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Order Items</h2>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={2}><Image src={item.image} alt={item.name} rounded fluid /></Col>
                      <Col><Link to={`/product/${item.product}`}>{item.name}</Link></Col>
                      <Col md={4} className="text-end">{item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                {/* ... (Order Summary items remain the same) ... */}
                <ListGroup.Item><Row><Col>Items</Col><Col>${order.itemsPrice.toFixed(2)}</Col></Row></ListGroup.Item>
                <ListGroup.Item><Row><Col>Shipping</Col><Col>${order.shippingPrice.toFixed(2)}</Col></Row></ListGroup.Item>
                <ListGroup.Item><Row><Col>Tax</Col><Col>${order.taxPrice.toFixed(2)}</Col></Row></ListGroup.Item>
                <ListGroup.Item><Row><Col><strong>Order Total</strong></Col><Col><strong>${order.totalPrice.toFixed(2)}</strong></Col></Row></ListGroup.Item>
                
                {!order.isPaid && (
                  <ListGroup.Item>
                    {order.paymentMethod === 'PayPal' && (
                      isPending ? (<div>Loading PayPal...</div>) : (
                        <div>
                          <PayPalButtons createOrder={createOrder} onApprove={onApprove} onError={onError}></PayPalButtons>
                        </div>
                      )
                    )}
                    {order.paymentMethod === 'Razorpay' && (
                        <div className="d-grid">
                            <Button type="button" onClick={razorpayPaymentHandler}>Pay with Razorpay</Button>
                        </div>
                    )}
                    {loadingPay && <div>Loading...</div>}
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
