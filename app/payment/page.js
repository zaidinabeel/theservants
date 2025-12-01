'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentPage() {
  const [step, setStep] = useState(1); // 1: Form, 2: Processing, 3: Success/Failure
  const [paymentType, setPaymentType] = useState('donation');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    membershipTier: 'basic'
  });
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const membershipPlans = {
    basic: { name: 'Basic Membership', amount: 199, features: ['Monthly newsletter', 'Community updates', 'Event invitations'] },
    core: { name: 'Core Membership', amount: 499, features: ['All Basic features', 'Exclusive content', 'Priority events'] },
    premium: { name: 'Premium Membership', amount: 999, features: ['All Core features', 'VIP access', 'Recognition'] }
  };

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const amount = paymentType === 'donation' ? parseFloat(formData.amount) : membershipPlans[formData.membershipTier].amount;
      
      if (paymentType === 'donation' && (!amount || amount < 1)) {
        toast.error('Please enter a valid amount');
        setLoading(false);
        return;
      }

      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill all fields');
        setLoading(false);
        return;
      }

      const endpoint = paymentType === 'donation' ? '/api/payments/order' : '/api/payments/subscription';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          ...(paymentType === 'membership' && { membershipTier: formData.membershipTier })
        }),
      });

      const data = await response.json();
      setOrderDetails(data);

      if (data.isMocked) {
        // Show mock payment success
        setStep(2);
        setTimeout(() => {
          setPaymentStatus({
            success: true,
            orderId: data.orderId,
            paymentId: 'pay_mock_' + Date.now(),
            amount: amount,
            timestamp: new Date().toISOString(),
            message: 'Payment Successful (MOCKED - Configure Razorpay for real payments)'
          });
          setStep(3);
        }, 2000);
      } else {
        // Open Razorpay checkout
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'The Servants NGO',
          description: paymentType === 'donation' ? 'Donation' : `${membershipPlans[formData.membershipTier].name}`,
          order_id: data.orderId,
          handler: async function (response) {
            setStep(2);
            await verifyPayment(response);
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: '#D4AF37'
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
              toast.error('Payment cancelled');
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      toast.error('Failed to create order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (response) => {
    try {
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          email: formData.email
        }),
      });

      const result = await verifyRes.json();
      
      if (result.success) {
        setPaymentStatus({
          success: true,
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          amount: orderDetails.amount / 100,
          timestamp: new Date().toISOString(),
          message: 'Payment Verified Successfully!'
        });
      } else {
        setPaymentStatus({
          success: false,
          message: 'Payment verification failed'
        });
      }
      setStep(3);
    } catch (error) {
      setPaymentStatus({
        success: false,
        message: 'Payment verification failed'
      });
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => window.location.href = '/'} className="gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Button>
          </div>

          {step === 1 && (
            <Card className="shadow-2xl">
              <CardHeader className="bg-deep-blue text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Heart className="h-8 w-8 text-gold" />
                  <div>
                    <CardTitle className="text-3xl">Support Our Cause</CardTitle>
                    <CardDescription className="text-gray-200">Make a difference with your contribution</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Payment Type Selection */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Select Payment Type</Label>
                  <RadioGroup value={paymentType} onValueChange={setPaymentType} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="donation" id="donation" className="peer sr-only" />
                      <Label
                        htmlFor="donation"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-gold peer-data-[state=checked]:bg-gold/10 cursor-pointer"
                      >
                        <span className="text-lg font-semibold">One-Time Donation</span>
                        <span className="text-sm text-gray-500">Any amount</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="membership" id="membership" className="peer sr-only" />
                      <Label
                        htmlFor="membership"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-gold peer-data-[state=checked]:bg-gold/10 cursor-pointer"
                      >
                        <span className="text-lg font-semibold">Monthly Membership</span>
                        <span className="text-sm text-gray-500">Recurring</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Membership Plan Selection */}
                {paymentType === 'membership' && (
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">Choose Membership Plan</Label>
                    <RadioGroup value={formData.membershipTier} onValueChange={(value) => setFormData({ ...formData, membershipTier: value })} className="space-y-3">
                      {Object.entries(membershipPlans).map(([key, plan]) => (
                        <div key={key}>
                          <RadioGroupItem value={key} id={key} className="peer sr-only" />
                          <Label
                            htmlFor={key}
                            className="flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-gold peer-data-[state=checked]:bg-gold/10 cursor-pointer"
                          >
                            <div>
                              <span className="text-lg font-semibold block">{plan.name}</span>
                              <span className="text-sm text-gray-500">{plan.features.join(' • ')}</span>
                            </div>
                            <span className="text-2xl font-bold text-gold">₹{plan.amount}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Donation Amount */}
                {paymentType === 'donation' && (
                  <div>
                    <Label htmlFor="amount" className="text-lg font-semibold">Donation Amount (₹)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="text-2xl font-bold h-16 mt-2"
                      min="1"
                    />
                    <div className="flex gap-2 mt-4">
                      {[500, 1000, 5000, 10000].map((amt) => (
                        <Button
                          key={amt}
                          type="button"
                          variant="outline"
                          onClick={() => setFormData({ ...formData, amount: amt.toString() })}
                          className="flex-1 border-gold text-gold hover:bg-gold hover:text-deep-blue"
                        >
                          ₹{amt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personal Details */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Your Details</h3>
                  
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold">
                        {paymentType === 'donation' ? 'One-Time Donation' : membershipPlans[formData.membershipTier].name}
                      </span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-gold">
                      <span>Total Amount:</span>
                      <span>
                        ₹{paymentType === 'donation' ? (formData.amount || '0') : membershipPlans[formData.membershipTier].amount}
                        {paymentType === 'membership' && <span className="text-sm">/month</span>}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={createOrder}
                  disabled={loading}
                  className="w-full bg-gold text-deep-blue hover:bg-gold/90 text-xl py-7"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-5 w-5" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="shadow-2xl">
              <CardContent className="p-12 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-gold mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-deep-blue mb-2">Processing Payment...</h2>
                <p className="text-gray-600">Please wait while we verify your payment</p>
              </CardContent>
            </Card>
          )}

          {step === 3 && paymentStatus && (
            <Card className="shadow-2xl">
              <CardContent className="p-12 text-center">
                {paymentStatus.success ? (
                  <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h2>
                    <p className="text-lg text-gray-700 mb-8">{paymentStatus.message}</p>
                    
                    <div className="bg-gray-100 p-6 rounded-lg space-y-3 text-left max-w-md mx-auto mb-8">
                      <h3 className="font-semibold text-lg text-center mb-4">Transaction Details</h3>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-mono text-sm">{paymentStatus.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment ID:</span>
                        <span className="font-mono text-sm">{paymentStatus.paymentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-gold">₹{paymentStatus.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date & Time:</span>
                        <span className="text-sm">{new Date(paymentStatus.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="text-green-600 font-semibold">VERIFIED ✓</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6">
                      A confirmation email with your receipt has been sent to <strong>{formData.email}</strong>
                    </p>

                    <Button onClick={() => window.location.href = '/'} className="bg-deep-blue text-white hover:bg-deep-blue/90">
                      Return to Home
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <X className="h-12 w-12 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-red-600 mb-4">Payment Failed</h2>
                    <p className="text-lg text-gray-700 mb-8">{paymentStatus.message}</p>
                    
                    <div className="flex gap-4 justify-center">
                      <Button onClick={() => { setStep(1); setPaymentStatus(null); }} className="bg-gold text-deep-blue hover:bg-gold/90">
                        Try Again
                      </Button>
                      <Button onClick={() => window.location.href = '/'} variant="outline">
                        Return to Home
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
