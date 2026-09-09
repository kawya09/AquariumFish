package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.PaymentDTO;
import lk.ijse.AquariumFish.dto.ReviewDTO;

import java.util.List;

public interface PaymentService {
    void savePayment(PaymentDTO paymentDTO);

    List<PaymentDTO> getAllPayments();

    void updatePayments(PaymentDTO paymentDTO);

    void changePaymentStatus(long paymentDTO);

    List<PaymentDTO> filterPayments(String username);
}
