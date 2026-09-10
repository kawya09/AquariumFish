package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.PaymentDTO;
import lk.ijse.AquariumFish.dto.SellerDTO;
import lk.ijse.AquariumFish.entity.Payment;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.entity.Seller;
import lk.ijse.AquariumFish.repository.PaymentRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final RoleRepository roleRepository;
    public  PaymentServiceImpl(PaymentRepository paymentRepository, RoleRepository roleRepository) {
        this.paymentRepository = paymentRepository;
        this.roleRepository = roleRepository;
    }
    @Override
    public void savePayment(PaymentDTO paymentDTO) {
        log.info("Saving Payment");

        try {
            Role role = roleRepository.findById(paymentDTO.getId())
                    .orElseThrow(() -> new RuntimeException( "Payment not found " ));
            Payment payment = new Payment();
            payment.setAmount(paymentDTO.getAmount());
            payment.setPaymentDate(paymentDTO.getPaymentDate());
            payment.setPaymentMethod(paymentDTO.getPaymentMethod());
            payment.setPaymentStatus(payment.getPaymentStatus());
            paymentRepository.save(payment);

        }catch (Exception e){
            log.error("Error saving payment",e);
            throw e;
        }
    }

    @Override
    public List<PaymentDTO> getAllPayments() {
        try {
            List<PaymentDTO> paymentDTOList = new ArrayList<>();
            List<Payment> payments = paymentRepository.findAll();
            for (Payment payment : payments) {
                PaymentDTO paymentDTO = new PaymentDTO();
                paymentDTO.setId(payment.getId());
                paymentDTO.setAmount(payment.getAmount());
                paymentDTO.setPaymentDate(payment.getPaymentDate());
                paymentDTO.setPaymentMethod(payment.getPaymentMethod());
                paymentDTO.setStatus(payment.getStatus());
                paymentDTOList.add(paymentDTO);

            }
            return paymentDTOList;
        } catch (Exception e) {
            log.error("Error getting all payments");
            throw e;
        }
    }

    @Override
    public void updatePayments(PaymentDTO paymentDTO) {

    }

    @Override
    public void changePaymentStatus(long paymentDTO) {

    }

    @Override
    public List<PaymentDTO> filterPayments(String username) {
        return List.of();
    }
}
