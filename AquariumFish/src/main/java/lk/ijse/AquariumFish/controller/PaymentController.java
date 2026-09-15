package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.PaymentDTO;
import lk.ijse.AquariumFish.service.PaymentService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/Payment")
@RestController
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse savePayment(@RequestBody PaymentDTO paymentDTO) {
        paymentService.savePayment(paymentDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllPayment() {
        List<PaymentDTO> paymentDTOList = paymentService.getAllPayments();
        return new CommonResponse(OPERATION_SUCCESS, paymentDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updatePayment(@RequestBody PaymentDTO paymentDTO) {
        paymentService.updatePayment(paymentDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deletePayment(@PathVariable Long id) {
        paymentService.changePaymentStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterPayment(@RequestParam String paymentMethod) {
        List<PaymentDTO> paymentDTOList = paymentService.filterPayments(paymentMethod);
        return new CommonResponse(OPERATION_SUCCESS, paymentDTOList, SUCCESS_MESSAGE);
    }
}