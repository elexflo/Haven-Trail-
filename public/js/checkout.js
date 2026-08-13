// Google Pay client demo (TEST environment)

(function(){
  // Minimal Google Pay integration for demo/testing. For production, follow Google's docs and use
  // a payment gateway or tokenization provider.

  const paymentsClient = new google.payments.api.PaymentsClient({environment: 'TEST'});

  const isReadyToPayRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [{
      type: 'CARD',
      parameters: { allowedAuthMethods: ['PAN_ONLY','CRYPTOGRAM_3DS'], allowedCardNetworks: ['AMEX','VISA','MASTERCARD'] }
    }]
  };

  function onGooglePayLoaded(){
    paymentsClient.isReadyToPay(isReadyToPayRequest).then(function(response){
      if (response.result) {
        const button = paymentsClient.createButton({onClick: onGooglePayClicked});
        document.getElementById('gpay-button').appendChild(button);
      } else {
        document.getElementById('gpay-button').innerText = 'Google Pay not available in this browser.';
      }
    }).catch(function(err){
      console.error('isReadyToPay error', err);
    });
  }

  function getPaymentDataRequest(total) {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId'
          }
        },
        parameters: { allowedAuthMethods: ['PAN_ONLY','CRYPTOGRAM_3DS'], allowedCardNetworks: ['AMEX','VISA','MASTERCARD'] }
      }],
      merchantInfo: {
        merchantName: 'Haven Trail',
        // In TEST mode you don't need a real merchant id
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: String(total || '0.00'),
        currencyCode: 'USD'
      }
    };
  }

  function onGooglePayClicked(){
    const container = document.getElementById('gpay-button');
    const bookingId = container.dataset.bookingId;
    const total = container.dataset.total || '0.00';
    const paymentDataRequest = getPaymentDataRequest(total);

    paymentsClient.loadPaymentData(paymentDataRequest).then(function(paymentData){
      // For demo we'll POST the booking_id and paymentData to server which will mark booking paid.
      fetch('/payments/googlepay/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, paymentData })
      }).then(r => r.json()).then(j => {
        if (j.success) {
          window.location.reload();
        } else {
          alert('Payment failed on server: ' + (j.message || 'unknown'));
        }
      }).catch(err => {
        console.error('Server error processing payment', err);
        alert('Payment processing error');
      });

    }).catch(function(err){
      console.error('loadPaymentData failed', err);
      alert('Payment cancelled or failed');
    });
  }

  // Wait for google pay library to be available
  window.addEventListener('load', function(){
    if (window.google && google.payments && google.payments.api) return onGooglePayLoaded();
    const s = document.createElement('script');
    s.src = 'https://pay.google.com/gp/p/js/pay.js';
    s.onload = onGooglePayLoaded;
    s.onerror = function(){ document.getElementById('gpay-button').innerText = 'Failed to load Google Pay'; };
    document.head.appendChild(s);
  });
})();
