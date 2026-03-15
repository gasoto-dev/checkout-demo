// Mock @stripe/react-stripe-js for tests
export const Elements = ({ children }: { children: React.ReactNode }) => children
export const CardElement = () => <div data-testid="card-element" />
export const useStripe = () => ({
  confirmCardPayment: jest.fn().mockResolvedValue({
    paymentIntent: { status: "succeeded" },
    error: null,
  }),
})
export const useElements = () => ({
  getElement: jest.fn().mockReturnValue({}),
})
