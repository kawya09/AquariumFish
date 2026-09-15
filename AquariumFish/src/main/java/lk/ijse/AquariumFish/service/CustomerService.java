package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.CustomerDTO;

import java.util.List;

public interface CustomerService {

    void saveCustomer(CustomerDTO customerDTO);

    List<CustomerDTO> getAllCustomers();

    void updateCustomer(CustomerDTO customerDTO);

    void changeCustomerStatus(long customerId);

    List<CustomerDTO> filterCustomers(String firstName);
}