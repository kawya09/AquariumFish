package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.CustomerDTO;

import java.util.List;

public interface CustomerService {

    void saveCustomer(CustomerDTO customerDTO);

    List<CustomerDTO> getAllCustomers();

    CustomerDTO getCustomerById(Long id);

    void updateCustomer(CustomerDTO customerDTO);

    void changeCustomerStatus(Long id);

    List<CustomerDTO> filterCustomers(String name);
}