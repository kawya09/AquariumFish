package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.PaymentDTO;

import java.util.List;

public interface PaymentService {

    void savePayment(PaymentDTO dto);

    List<PaymentDTO> getAllPayments();

    PaymentDTO getPaymentById(Long id);

    void updatePayment(PaymentDTO dto);

    void changePaymentStatus(Long id);

    List<PaymentDTO> filterPayments(String paymentStatus);
}