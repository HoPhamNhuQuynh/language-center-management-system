import pytest
from django.urls import reverse
from rest_framework import status
from model_bakery import baker

@pytest.mark.django_db
class TestPaymentModule:

    def test_create_payment_returns_vnpay_payment_url(self, api_client, active_user, classroom):
        enrollment = baker.make('enrollments.Enrollment', student=active_user, classroom=classroom)
        
        api_client.force_authenticate(user=active_user)
        url = reverse('payment-list')
        data = {
            "enrollment": enrollment.id,
            "amount": 4000000,
            "payment_method": "VNPAY"
        }
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert "payment_url" in response.data

    @pytest.mark.parametrize("vnp_code, final_payment_status, final_enroll_status", [
        ("00", "SUCCESS", "SUCCESS"),        # Giao dịch thành công
        ("24", "FAILED", "PENDING_PAYMENT"), # Giao dịch bị hủy bởi khách hàng
        ("99", "FAILED", "PENDING_PAYMENT"), # Các lỗi khác
    ])
    def test_vnpay_ipn_callback_updates_payment_and_enrollment_to_success(self, api_client, vnp_code, final_payment_status, final_enroll_status):
        """Test giả lập VNPay gọi lại IPN khi thanh toán thành công """
        payment = baker.make('enrollments.Payment', payment_status="PENDING")
    
        url = reverse('payment-vnpay-ipn')
        api_client.get(f"{url}?vnp_TxnRef={payment.id}&vnp_ResponseCode={vnp_code}")
        
        payment.refresh_from_db()
        assert payment.payment_status == final_payment_status
        assert payment.enrollment.enrollment_status == final_enroll_status

    @pytest.mark.parametrize("amount, expected_status", [
        (1000000, status.HTTP_400_BAD_REQUEST), # Dưới 50%
        (2999999, status.HTTP_400_BAD_REQUEST), # Sát biên dưới 50%
        (3000000, status.HTTP_200_OK),          # Vừa đủ 50%
        (4000000, status.HTTP_200_OK),          # Trên 50%
    ])
    def test_create_payment_amount_validation(self, api_client, active_user, classroom, amount, expected_status):
        """Kiểm tra ngưỡng thanh toán tối thiểu 50% học phí dựa trên giá lớp học 6tr"""
        enrollment = baker.make('enrollments.Enrollment', student=active_user, classroom=classroom)
        api_client.force_authenticate(user=active_user)
        
        data = {"enrollment": enrollment.id, "amount": amount, "payment_method": "VNPAY"}
        response = api_client.post(reverse('payment-list'), data)
        
        assert response.status_code == expected_status

    def test_create_payment_returns_momo_pay_url(self, api_client, active_user, classroom): # cần check lại momo 
        """ Mock thanh toán MoMo"""
        enrollment = baker.make('enrollments.Enrollment', student=active_user, classroom=classroom)
        api_client.force_authenticate(user=active_user)
        
        url = reverse('payment-list')
        data = {
            "enrollment": enrollment.id,
            "amount": 3000000,
            "payment_method": "MOMO" #
        }
        response = api_client.post(url, data)
        assert response.status_code == 200
        assert "payUrl" in response.data

    def test_vnpay_callback_returns_failure_message_when_response_code_not_success(self, api_client):
        """ Test callback hiển thị thông báo thất bại do giao dịch thất bại """
        url = reverse('payment-vnpay-callback')
        # vnp_ResponseCode khác 00 
        response = api_client.get(f"{url}?vnp_ResponseCode=99")
        assert response.status_code == 200
        assert "Thanh toán thất bại" in response.data['message']

    def test_vnpay_ipn_returns_already_confirmed_when_payment_already_success(self, api_client):
        """ IPN gọi lại cho đơn đã SUCCESS thì kh bị duplicate record """
        payment = baker.make('enrollments.Payment', payment_status="SUCCESS")
        url = reverse('payment-vnpay-ipn')
        response = api_client.get(f"{url}?vnp_TxnRef={payment.id}")
        
        assert response.data['Message'] == "Already confirmed"

    def test_vnpay_ipn_sets_payment_failed_when_response_code_not_success(self, api_client):
        """ VNPay báo thanh toán thất bại -> cập nhật status payment là failed """
        payment = baker.make('enrollments.Payment', payment_status="PENDING")
        url = reverse('payment-vnpay-ipn')
        # vnp_ResponseCode != 00
        api_client.get(f"{url}?vnp_TxnRef={payment.id}&vnp_ResponseCode=24")
        
        payment.refresh_from_db()
        assert payment.payment_status == "FAILED"

    def test_vnpay_ipn_returns_not_found_response_when_payment_not_exist(self, api_client):
        """ Test VNPay gửi lên payment kh có trong hệ thống và báo lỗi về VNPay """
        url = reverse('payment-vnpay-ipn')
        response = api_client.get(f"{url}?vnp_TxnRef=99999")
        
        assert response.data['RspCode'] == "01"
        assert "not found" in response.data['Message']
        assert response.status_code == 200