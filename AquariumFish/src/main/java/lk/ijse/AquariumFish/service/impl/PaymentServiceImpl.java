package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.PaymentDTO;
import lk.ijse.AquariumFish.entity.Payment;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.PaymentRepository;
import lk.ijse.AquariumFish.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public void savePayment(PaymentDTO paymentDTO) {
        log.info("Save payment");

        try {
            Payment payment = new Payment();

            payment.setPaymentMethod(paymentDTO.getPaymentMethod());
            payment.setPaymentDate(paymentDTO.getPaymentDate());
            payment.setAmount(paymentDTO.getAmount());
            payment.setStatus(paymentDTO.getStatus());

            paymentRepository.save(payment);

        } catch (Exception e) {
            log.error("Error saving payment", e);
            throw e;
        }
    }

    @Override
    public List<PaymentDTO> getAllPayments() {
        log.info("Get all payments");

        try {
            List<PaymentDTO> paymentDTOList = new ArrayList<>();

            List<Payment> payments = paymentRepository.findAll();

            for (Payment payment : payments) {
                PaymentDTO paymentDTO = new PaymentDTO();

                paymentDTO.setId(payment.getId());
                paymentDTO.setPaymentMethod(payment.getPaymentMethod());
                paymentDTO.setPaymentDate(payment.getPaymentDate());
                paymentDTO.setAmount(payment.getAmount());
                paymentDTO.setStatus(payment.getStatus());

                paymentDTOList.add(paymentDTO);
            }

            return paymentDTOList;

        } catch (Exception e) {
            log.error("Error getting all payments", e);
            throw e;
        }
    }

    @Override
    public void updatePayment(PaymentDTO paymentDTO) {
        log.info("Update payment");

        try {
            Optional<Payment> optionalPayment =
                    paymentRepository.findById(paymentDTO.getId());

            if (optionalPayment.isEmpty()) {
                throw new RuntimeException("Payment not found");
            }

            Payment payment = optionalPayment.get();

            payment.setPaymentMethod(paymentDTO.getPaymentMethod());
            payment.setPaymentDate(paymentDTO.getPaymentDate());
            payment.setAmount(paymentDTO.getAmount());
            payment.setStatus(paymentDTO.getStatus());

            paymentRepository.save(payment);

        } catch (Exception e) {
            log.error("Error updating payment", e);
            throw e;
        }
    }

    @Override
    public void changePaymentStatus(long paymentId) {
        log.info("Change payment status");

        try {
            Optional<Payment> optionalPayment =
                    paymentRepository.findById(paymentId);

            if (optionalPayment.isEmpty()) {
                throw new RuntimeException("Payment not found");
            }

            Payment payment = optionalPayment.get();

            payment.setStatus(UserStatus.INACTIVE);

            paymentRepository.save(payment);

        } catch (Exception e) {
            log.error("Error changing payment status", e);
            throw e;
        }
    }

    @Override
    public List<PaymentDTO> filterPayments(String paymentMethod) {
        log.info("Filter payments");

        try {
            List<PaymentDTO> paymentDTOList = new ArrayList<>();

            List<Payment> payments =
                    paymentRepository.findByPaymentMethodContaining(paymentMethod);

            for (Payment payment : payments) {
                PaymentDTO paymentDTO = new PaymentDTO();

                paymentDTO.setId(payment.getId());
                paymentDTO.setPaymentMethod(payment.getPaymentMethod());
                paymentDTO.setPaymentDate(payment.getPaymentDate());
                paymentDTO.setAmount(payment.getAmount());
                paymentDTO.setStatus(payment.getStatus());

                paymentDTOList.add(paymentDTO);
            }

            return paymentDTOList;

        } catch (Exception e) {
            log.error("Error filtering payments", e);
            throw e;
        }
    }
}