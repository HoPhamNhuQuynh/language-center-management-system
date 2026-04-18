
from django.conf import settings
from urllib.parse import urlencode
import datetime
from .utils import hmacsha512

class VNPayService:
    @classmethod
    def create_payment_url(cls, payment, ip_address):
        vnp_params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': settings.VNPAY_TMN_CODE,
            'vnp_Amount': int(payment.amount * 100), # do don vi vnpay tinh la xu
            'vnp_CreateDate': datetime.datetime.now().strftime('%Y%m%d%H%M%S'),
            'vnp_CurrCode': 'VND',
            'vnp_IpAddr': ip_address,
            'vnp_Locale': 'vn',
            'vnp_OrderInfo': f'Thanh toan don hang {payment.id}',
            'vnp_OrderType': 'billpayment',
            'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
            'vnp_TxnRef': str(payment.id),
        }

        vnp_params = dict(sorted(vnp_params.items()))
        query_string = urlencode(vnp_params)
        secure_hash = hmacsha512(settings.VNPAY_HASH_SECRET, query_string)

        return f'{settings.VNPAY_URL}?{query_string}&vnp_SecureHash={secure_hash}'