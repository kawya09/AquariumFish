package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.CustomerDTO;
import lk.ijse.AquariumFish.entity.Customer;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.CustomerRepository;
import lk.ijse.AquariumFish.service.CustomerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public void saveCustomer(CustomerDTO dto) {

        Customer customer = new Customer();

        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setStatus(dto.getStatus());

        customerRepository.save(customer);
    }

    @Override
    public List<CustomerDTO> getAllCustomers() {

        List<CustomerDTO> list = new ArrayList<>();

        for (Customer customer : customerRepository.findAll()) {

            CustomerDTO dto = new CustomerDTO();

            dto.setId(customer.getId());
            dto.setFirstName(customer.getFirstName());
            dto.setLastName(customer.getLastName());
            dto.setPhone(customer.getPhone());
            dto.setAddress(customer.getAddress());
            dto.setStatus(customer.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public CustomerDTO getCustomerById(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        CustomerDTO dto = new CustomerDTO();

        dto.setId(customer.getId());
        dto.setFirstName(customer.getFirstName());
        dto.setLastName(customer.getLastName());
        dto.setPhone(customer.getPhone());
        dto.setAddress(customer.getAddress());
        dto.setStatus(customer.getStatus());

        return dto;
    }

    @Override
    public void updateCustomer(CustomerDTO dto) {

        Customer customer = customerRepository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setStatus(dto.getStatus());

        customerRepository.save(customer);
    }

    @Override
    public void changeCustomerStatus(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        customer.setStatus(UserStatus.INACTIVE);

        customerRepository.save(customer);
    }

    @Override
    public List<CustomerDTO> filterCustomers(String name) {

        List<CustomerDTO> list = new ArrayList<>();

        for (Customer customer :
                customerRepository.findByFirstNameContaining(name)) {

            CustomerDTO dto = new CustomerDTO();

            dto.setId(customer.getId());
            dto.setFirstName(customer.getFirstName());
            dto.setLastName(customer.getLastName());
            dto.setPhone(customer.getPhone());
            dto.setAddress(customer.getAddress());
            dto.setStatus(customer.getStatus());

            list.add(dto);
        }

        return list;
    }
}