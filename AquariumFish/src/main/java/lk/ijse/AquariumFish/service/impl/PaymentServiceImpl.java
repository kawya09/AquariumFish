package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.PaymentDTO;
import lk.ijse.AquariumFish.entity.Payment;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.PaymentRepository;
import lk.ijse.AquariumFish.service.PaymentService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository repository;

    public PaymentServiceImpl(PaymentRepository repository) {
        this.repository = repository;
    }

    @Override
    public void savePayment(PaymentDTO dto) {

        Payment payment = new Payment();

        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setAmount(dto.getAmount());
        payment.setStatus(dto.getStatus());

        repository.save(payment);
    }

    @Override
    public List<PaymentDTO> getAllPayments() {

        List<PaymentDTO> list = new ArrayList<>();

        for (Payment payment : repository.findAll()) {

            PaymentDTO dto = new PaymentDTO();

            dto.setId(payment.getId());
            dto.setPaymentMethod(payment.getPaymentMethod());
            dto.setPaymentDate(payment.getPaymentDate());
            dto.setAmount(payment.getAmount());
            dto.setPaymentStatus(payment.getPaymentStatus());
            dto.setStatus(payment.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public PaymentDTO getPaymentById(Long id) {

        Payment payment = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found"));

        PaymentDTO dto = new PaymentDTO();

        dto.setId(payment.getId());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setAmount(payment.getAmount());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setStatus(payment.getStatus());

        return dto;
    }

    @Override
    public void updatePayment(PaymentDTO dto) {

        Payment payment = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Payment not found"));

        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setAmount(dto.getAmount());
        payment.setPaymentStatus(dto.getPaymentStatus());
        payment.setStatus(dto.getStatus());

        repository.save(payment);
    }

    @Override
    public void changePaymentStatus(Long id) {

        Payment payment = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found"));

        payment.setStatus(UserStatus.INACTIVE);

        repository.save(payment);
    }

    @Override
    public List<PaymentDTO> filterPayments(String paymentStatus) {

        List<PaymentDTO> list = new ArrayList<>();

        for (Payment payment :
                repository.findByPaymentStatusContaining(paymentStatus)) {

            PaymentDTO dto = new PaymentDTO();

            dto.setId(payment.getId());
            dto.setPaymentMethod(payment.getPaymentMethod());
            dto.setPaymentDate(payment.getPaymentDate());
            dto.setAmount(payment.getAmount());
            dto.setPaymentStatus(payment.getPaymentStatus());
            dto.setStatus(payment.getStatus());

            list.add(dto);
        }

        return list;
    }
}