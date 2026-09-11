package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.Cart_ItemDTO;
import lk.ijse.AquariumFish.dto.CustomerDTO;
import lk.ijse.AquariumFish.service.CustomerService;
import lk.ijse.AquariumFish.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("V1/customer")
@RestController
public class CustomerController {
    private CustomerService customerService;
    private UserService userService;
    public CustomerController(CustomerService customerService, UserService userService) {
        this.customerService = customerService;
        this.userService = userService;
    }
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveCustomer(@RequestBody CustomerDTO customerDTO){
        customerService.saveCustomer(customerDTO);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);
    }
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllCustomer(){
        List<CustomerDTO> customerDTOList = customerService.getAllCustomers();
        return new CommonResponse(OPERATION_SUCCESS,customerDTOList,SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateCustomer(@RequestBody CustomerDTO customerDTO){
        customerService.updateCustomer(customerDTO);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);

    }

    @DeleteMapping(value = "/filter",produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteCustomer(@PathVariable Long id){
        customerService.changeCustomerStatus(id);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter",produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterCustomer(@RequestParam String Username){
        List<CustomerDTO> customerDTOList = customerService.filterCustomers(Username) ;
        return new CommonResponse(OPERATION_SUCCESS,customerDTOList,SUCCESS_MESSAGE);
    }
}
