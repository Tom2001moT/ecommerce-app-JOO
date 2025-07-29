import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export default function CheckoutSteps(props) {
  return (
    <Nav className="justify-content-center mb-4">
      <Nav.Item>
        {/* Step 1 is always accessible if you're in checkout */}
        <LinkContainer to="/login">
            <Nav.Link>Sign-In</Nav.Link>
        </LinkContainer>
      </Nav.Item>

      <Nav.Item>
        {/* You can access shipping if you've passed step 1 */}
        {props.step2 ? (
          <LinkContainer to="/shipping">
            <Nav.Link>Shipping</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>Shipping</Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {/* You can access payment if you've passed step 2 */}
        {props.step3 ? (
          <LinkContainer to="/payment">
            <Nav.Link>Payment</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>Payment</Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {/* You can access place order if you've passed step 3 */}
        {props.step4 ? (
          <LinkContainer to="/placeorder">
            <Nav.Link>Place Order</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>Place Order</Nav.Link>
        )}
      </Nav.Item>
    </Nav>
  );
}