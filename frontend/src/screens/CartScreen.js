import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Button, Card } from 'react-bootstrap';
import { Store } from '../context/Store';

const CartScreen = () => {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart: { cartItems } } = state;

    const removeItemHandler = (item) => {
        ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
    };

    const checkoutHandler = () => {
        // Navigate to login, which will then redirect to shipping
        navigate('/login?redirect=/shipping');
    };

    return (
        <Row>
            <Col md={8}>
                <h1>Shopping Cart</h1>
                {cartItems.length === 0 ? (
                    <h3>Your cart is empty <Link to='/'>Go Back</Link></h3>
                ) : (
                    <ListGroup variant='flush'>
                        {cartItems.map((item) => (
                            <ListGroup.Item key={item._id}>
                                <Row className="align-items-center">
                                    <Col md={2}><Image src={item.image} alt={item.name} fluid rounded /></Col>
                                    <Col md={3}><Link to={`/product/${item._id}`}>{item.name}</Link></Col>
                                    <Col md={2}>${item.price}</Col>
                                    <Col md={2}>Qty: {item.qty}</Col>
                                    <Col md={1}>
                                        <Button onClick={() => removeItemHandler(item)} type='button' variant='light'><i className='fas fa-trash'></i></Button>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Col>
            <Col md={4}>
                <Card>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items</h2>
                            <h4>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</h4>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-grid">
                            <Button onClick={checkoutHandler} type='button' className='btn-block' disabled={cartItems.length === 0}>
                                Proceed to Checkout
                            </Button>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    );
};
export default CartScreen;
