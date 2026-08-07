from pydantic import BaseModel, Field
from typing import List, Optional

class RazorpayOrderRequest(BaseModel):
    show_id: str = Field(..., example="65b9a101f82c019a2e3a3001")
    seat_numbers: List[str] = Field(..., min_items=1, example=["A3", "A4"])

class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: int  # Amount in paise (e.g. 2650 for Rs 26.50)
    currency: str = "INR"
    key_id: str
    seat_numbers: List[str]

class RazorpayPaymentVerify(BaseModel):
    show_id: str
    seat_numbers: List[str]
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
