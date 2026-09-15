package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.SellerDTO;
import lk.ijse.AquariumFish.service.SellerService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/Seller")
@RestController
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveSeller(@RequestBody SellerDTO sellerDTO) {
        sellerService.saveSeller(sellerDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllSeller() {
        List<SellerDTO> sellerDTOList = sellerService.getAllSellers();
        return new CommonResponse(OPERATION_SUCCESS, sellerDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateSeller(@RequestBody SellerDTO sellerDTO) {
        sellerService.updateSeller(sellerDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteSeller(@PathVariable Long id) {
        sellerService.changeSellerStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterSeller(@RequestParam String shopName) {
        List<SellerDTO> sellerDTOList =
                sellerService.filterSellers(shopName);

        return new CommonResponse(OPERATION_SUCCESS, sellerDTOList, SUCCESS_MESSAGE);
    }


}