package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.PaymentDTO;

import java.util.List;

public interface PaymentService {

    void savePayment(PaymentDTO paymentDTO);

    List<PaymentDTO> getAllPayments();

    void updatePayment(PaymentDTO paymentDTO);

    void changePaymentStatus(long paymentId);

    List<PaymentDTO> filterPayments(String paymentMethod);
}