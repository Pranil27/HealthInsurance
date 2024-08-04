
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51PTVxBP9R43T6Z9PV1LphYlnWMj9RhwqhPRKffQmuqRLP7Cia7PA5Qam8rlvnB4R5bQ9ra8OPfWDKZQTjjoHEc7H008x6GyBc4'); // Replace with your Stripe publishable key

const StripeProvider = ({ children }) => {
    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    );
};

export default StripeProvider;
