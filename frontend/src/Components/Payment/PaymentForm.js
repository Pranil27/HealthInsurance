// src/PaymentForm.js
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;
    
        setLoading(true);
        setMessage(''); // Clear previous messages
    
        try {
            const response = await fetch('http://localhost:5000/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 10000 }) // Amount in cents
            });
    
            if (!response.ok) {
                throw new Error('Failed to create PaymentIntent');
            }
    
            const { clientSecret } = await response.json();
    
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)
                }
            });
    
            if (error) {
                setMessage(`Payment failed: ${error.message}`);
            } else if (paymentIntent.status === 'succeeded') {
                const paymentResponse = await fetch('http://localhost:5000/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentIntentId: paymentIntent.id })
                });
    
                if (!paymentResponse.ok) {
                    throw new Error('Failed to verify payment');
                }
    
                const result = await paymentResponse.text();
                setMessage(result);
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="max-w-8xl mx-auto p-6 border border-gray-300 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-semibold mb-4">Payment Form</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-6 border rounded-md border-gray-300 bg-gray-50">
                    <div className="flex flex-col space-y-4">
                        <label className="font-medium">Card Details</label>
                        <div className="flex flex-col gap-2">
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: '#333',
                                            '::placeholder': {
                                                color: '#aaa'
                                            },
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '0.375rem',
                                            height: '3.5rem',
                                        },
                                        invalid: {
                                            color: '#fa755a',
                                            iconColor: '#fa755a',
                                        },
                                    }
                                }}
                                className="p-2 border rounded-md"
                            />
                        </div>
                    </div>
                </div>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className={`w-full py-3 px-4 rounded-md ${loading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'} text-white font-semibold`}
                >
                    {loading ? 'Processing...' : 'Pay'}
                </button>
                {message && (
                    <div className={`p-2 rounded-md ${message.startsWith('Payment failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default PaymentForm;
