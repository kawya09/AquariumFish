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
import java.util.Optional;

@Service
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public void saveCustomer(CustomerDTO customerDTO) {
        log.info("Save customer");

        try {
            Customer customer = new Customer();

            customer.setFirstName(customerDTO.getFirstName());
            customer.setLastName(customerDTO.getLastName());
            customer.setPhone(customerDTO.getPhone());
            customer.setAddress(customerDTO.getAddress());
            customer.setStatus(customerDTO.getStatus());

            customerRepository.save(customer);

        } catch (Exception e) {
            log.error("Error saving customer", e);
            throw e;
        }
    }

    @Override
    public List<CustomerDTO> getAllCustomers() {
        log.info("Get all customers");

        try {
            List<CustomerDTO> customerDTOList = new ArrayList<>();

            List<Customer> customers = customerRepository.findAll();

            for (Customer customer : customers) {
                CustomerDTO customerDTO = new CustomerDTO();

                customerDTO.setId(customer.getId());
                customerDTO.setFirstName(customer.getFirstName());
                customerDTO.setLastName(customer.getLastName());
                customerDTO.setPhone(customer.getPhone());
                customerDTO.setAddress(customer.getAddress());
                customerDTO.setStatus(customer.getStatus());

                customerDTOList.add(customerDTO);
            }

            return customerDTOList;

        } catch (Exception e) {
            log.error("Error getting all customers", e);
            throw e;
        }
    }

    @Override
    public void updateCustomer(CustomerDTO customerDTO) {
        log.info("Update customer");

        try {
            Optional<Customer> optionalCustomer =
                    customerRepository.findById(customerDTO.getId());

            if (optionalCustomer.isEmpty()) {
                throw new RuntimeException("Customer not found");
            }

            Customer customer = optionalCustomer.get();

            customer.setFirstName(customerDTO.getFirstName());
            customer.setLastName(customerDTO.getLastName());
            customer.setPhone(customerDTO.getPhone());
            customer.setAddress(customerDTO.getAddress());
            customer.setStatus(customerDTO.getStatus());

            customerRepository.save(customer);

        } catch (Exception e) {
            log.error("Error updating customer", e);
            throw e;
        }
    }

    @Override
    public void changeCustomerStatus(long customerId) {
        log.info("Change customer status");

        try {
            Optional<Customer> optionalCustomer =
                    customerRepository.findById(customerId);

            if (optionalCustomer.isEmpty()) {
                throw new RuntimeException("Customer not found");
            }

            Customer customer = optionalCustomer.get();

            customer.setStatus(UserStatus.INACTIVE);

            customerRepository.save(customer);

        } catch (Exception e) {
            log.error("Error changing customer status", e);
            throw e;
        }
    }

    @Override
    public List<CustomerDTO> filterCustomers(String firstName) {
        log.info("Filter customers");

        try {
            List<CustomerDTO> customerDTOList = new ArrayList<>();

            List<Customer> customers =
                    customerRepository.findByFirstNameContaining(firstName);

            for (Customer customer : customers) {
                CustomerDTO customerDTO = new CustomerDTO();

                customerDTO.setId(customer.getId());
                customerDTO.setFirstName(customer.getFirstName());
                customerDTO.setLastName(customer.getLastName());
                customerDTO.setPhone(customer.getPhone());
                customerDTO.setAddress(customer.getAddress());
                customerDTO.setStatus(customer.getStatus());

                customerDTOList.add(customerDTO);
            }

            return customerDTOList;

        } catch (Exception e) {
            log.error("Error filtering customers", e);
            throw e;
        }
    }
}