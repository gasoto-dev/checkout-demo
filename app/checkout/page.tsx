"use client"

import { useState } from "react"
import { useCart } from "@/components/CartContext"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useRouter } from "next/navigation"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface AddressData {
  name: string; email: string; address: string; city: string; state: string; zip: string
}
const emptyAddress: AddressData = { name: "", email: "", address: "", city: "", state: "", zip: "" }

const inputClass = (error?: string) =>
  `w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white ${
    error ? "border-red-400" : "border-gray-200"
  }`

const labelClass = "block text-xs font-semibold text-gray-500 tracking-wide uppercase mb-1.5"

function AddressStep({ onNext, initialData }: { onNext: (d: AddressData) => void; initialData: AddressData }) {
  const [form, setForm] = useState<AddressData>(initialData)
  const [errors, setErrors] = useState<Partial<AddressData>>({})

  const validate = (): boolean => {
    const e: Partial<AddressData> = {}
    if (!form.name.trim()) e.name = "Required"
    if (!form.email.trim()) e.email = "Required"
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email"
    if (!form.address.trim()) e.address = "Required"
    if (!form.city.trim()) e.city = "Required"
    if (!form.state.trim()) e.state = "Required"
    if (!form.zip.trim()) e.zip = "Required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const f = (key: keyof AddressData, label: string, placeholder: string, type = "text") => (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className={inputClass(errors[key])}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (validate()) onNext(form) }} className="space-y-4" data-testid="address-form">
      {f("name", "Full Name", "Jane Doe")}
      {f("email", "Email", "jane@example.com", "email")}
      {f("address", "Street Address", "123 Main St")}
      <div className="grid grid-cols-2 gap-4">
        {f("city", "City", "Springfield")}
        {f("state", "State", "CA")}
      </div>
      {f("zip", "ZIP Code", "90210")}
      <button
        type="submit"
        className="w-full bg-[#111] text-white py-4 rounded-full font-bold hover:bg-orange-500 transition-colors mt-2"
      >
        Continue to Payment →
      </button>
    </form>
  )
}

function PaymentStep({ addressData, onBack }: { addressData: AddressData; onBack: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          email: addressData.email,
          address: addressData,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Checkout failed")
      const { clientSecret, orderId } = await res.json()
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error("Card element not found")
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement, billing_details: { name: addressData.name, email: addressData.email } },
      })
      if (stripeError) throw new Error(stripeError.message)
      if (paymentIntent?.status === "succeeded") {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        })
        clearCart()
        router.push(`/checkout/success?orderId=${orderId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-testid="payment-form">
      <div>
        <label className={labelClass}>Card Details</label>
        <div className="border-2 border-gray-200 focus-within:border-orange-400 rounded-xl px-4 py-4 bg-white transition-colors">
          <CardElement options={{ style: { base: { fontSize: "15px", color: "#111", "::placeholder": { color: "#9ca3af" } } } }} />
        </div>
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <span>🔒</span> Secured by Stripe · Test card: <span className="font-mono">4242 4242 4242 4242</span>
        </p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 border-2 border-gray-200 text-gray-700 py-4 rounded-full font-semibold hover:border-gray-400 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className="flex-1 bg-orange-500 hover:bg-orange-400 text-white py-4 rounded-full font-bold disabled:opacity-50 transition-colors"
        >
          {loading ? "Processing..." : `Pay $${totalPrice.toFixed(2)}`}
        </button>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const { items, totalPrice } = useCart()
  const [step, setStep] = useState<1 | 2>(1)
  const [addressData, setAddressData] = useState<AddressData>(emptyAddress)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-8xl mb-6 grayscale opacity-40">🛒</div>
        <h2 className="text-2xl font-black text-gray-900 mb-4">Your cart is empty</h2>
        <a href="/" className="bg-[#111] text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-500 transition-colors">
          Browse Products
        </a>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="pt-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {[{ n: 1, label: "Shipping" }, { n: 2, label: "Payment" }].map(({ n, label }, idx) => (
            <div key={n} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 text-sm font-semibold ${step === n ? "text-orange-500" : step > n ? "text-green-600" : "text-gray-400"}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white ${step === n ? "bg-orange-500" : step > n ? "bg-green-500" : "bg-gray-300"}`}>
                  {step > n ? "✓" : n}
                </span>
                {label}
              </div>
              {idx === 0 && <div className="w-16 h-0.5 bg-gray-200 rounded" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-6">
              {step === 1 ? "Shipping Address" : "Payment"}
            </h2>
            {step === 1 ? (
              <AddressStep onNext={(d) => { setAddressData(d); setStep(2) }} initialData={addressData} />
            ) : (
              <PaymentStep addressData={addressData} onBack={() => setStep(1)} />
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#111] text-white rounded-2xl p-6 sticky top-24">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-5">Your Order</h2>
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-white/80">{item.name} × {item.quantity}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between font-black text-xl">
                <span>Total</span>
                <span className="text-orange-400">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  )
}
