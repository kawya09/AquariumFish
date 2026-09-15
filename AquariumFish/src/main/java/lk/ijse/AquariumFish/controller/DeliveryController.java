package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.DeliveryDTO;
import lk.ijse.AquariumFish.service.DeliveryService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/Delivery")
@RestController
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveDelivery(@RequestBody DeliveryDTO deliveryDTO) {
        deliveryService.saveDelivery(deliveryDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllDelivery() {
        List<DeliveryDTO> deliveryDTOList = deliveryService.getAllDeliveries();
        return new CommonResponse(OPERATION_SUCCESS, deliveryDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateDelivery(@RequestBody DeliveryDTO deliveryDTO) {
        deliveryService.updateDelivery(deliveryDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteDelivery(@PathVariable Long id) {
        deliveryService.changeDeliveryStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterDelivery(@RequestParam String trackingNo) {
        List<DeliveryDTO> deliveryDTOList = deliveryService.filterDeliveries(trackingNo);
        return new CommonResponse(OPERATION_SUCCESS, deliveryDTOList, SUCCESS_MESSAGE
        );
    }
}