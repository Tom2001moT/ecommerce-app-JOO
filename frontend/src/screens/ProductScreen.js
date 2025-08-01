/*
 * =================================================================
 * FILE: /src/screens/ProductScreen.js
 * =================================================================
 */
import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { Store } from '../context/Store';

export default function ProductScreen() {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const [product, setProduct] = useState({});
    const [qty, setQty] = useState(1);
    const { id: productId } = useParams();
    useEffect(() => {
        const fetchProduct = async () => {
            const { data } = await axios.get(`/api/products/${productId}`);
            setProduct(data);
        };
        fetchProduct();
    }, [productId]);
    const addToCartHandler = () => {
        ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...product, qty } });
        navigate('/cart');
    };
    return (
        <>
            <Link className='btn btn-light my-3' to='/'>Go Back</Link>
            <Row>
                <Col md={6}><Image src={product.image} alt={product.name} fluid /></Col>
                <Col md={3}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item><h3>{product.name}</h3></ListGroup.Item>
                        <ListGroup.Item>Price: ${product.price}</ListGroup.Item>
                        <ListGroup.Item>Description: {product.description}</ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={3}>
                    <Card>
                        <ListGroup variant='flush'>
                            <ListGroup.Item><Row><Col>Price:</Col><Col><strong>${product.price}</strong></Col></Row></ListGroup.Item>
                            <ListGroup.Item><Row><Col>Status:</Col><Col>{product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}</Col></Row></ListGroup.Item>
                            {product.countInStock > 0 && (
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Qty</Col>
                                        <Col>
                                            <Form.Control as="select" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                                                {[...Array(product.countInStock).keys()].map((x) => (
                                                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                                                ))}
                                            </Form.Control>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            )}
                            <ListGroup.Item className="d-grid">
                                <Button onClick={addToCartHandler} className='btn-block' type='button' disabled={product.countInStock === 0}>Add To Cart</Button>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </>
    );
};
