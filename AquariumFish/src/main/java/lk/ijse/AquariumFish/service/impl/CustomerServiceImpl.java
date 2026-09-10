package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.CartDTO;
import lk.ijse.AquariumFish.dto.CustomerDTO;
import lk.ijse.AquariumFish.entity.Cart;
import lk.ijse.AquariumFish.entity.Customer;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.CustomerRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
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
    private final RoleRepository roleRepository;
    public CustomerServiceImpl(CustomerRepository customerRepository, RoleRepository roleRepository) {
        this.customerRepository = customerRepository;
        this.roleRepository = roleRepository;
    }
    @Override
    public void saveCustomer(CustomerDTO customerDTO) {
        log.info("Saving customer");

        try {
            Role role = roleRepository.findById(customerDTO.getId())
                    .orElseThrow(() -> new RuntimeException( "customer not found " ));
            Customer customer = new Customer();
            customer.setStatus(customerDTO.getStatus());
            customer.setAddress(customerDTO.getAddress());
            customer.setFirstName(customerDTO.getFirstName());
            customer.setLastName(customerDTO.getLastName());
            customer.setPhone(customerDTO.getPhone());

            customerRepository.save(customer);
        }catch (Exception e){
            log.error("Error saving customer",e);
            throw e;
        }

    }

    @Override
    public List<CustomerDTO> getAllCustomers() {
        try {
            List<CustomerDTO> customerDTOList = new ArrayList<>();
            List<Customer> customers =customerRepository.findAll();
            for (Customer customer : customers) {
                CustomerDTO customerDTO = new CustomerDTO();

                customerDTO.setId(customer.getId());
                customerDTO.setStatus(customer.getStatus());
                customerDTO.setAddress(customer.getAddress());
                customerDTO.setFirstName(customer.getFirstName());
                customerDTO.setLastName(customer.getLastName());
                customerDTO.setPhone(customer.getPhone());
                customerDTOList.add(customerDTO);
            }
            return customerDTOList;
        } catch (Exception e) {
            log.error("Error getting all customers");
            throw e;
        }
    }

    @Override
    public void updateCustomer(CustomerDTO customerDTO) {
        log.info("Update Cart ");
        try{
            Optional<Customer> customer = customerRepository.findById(customerDTO.getId());
            if(customer.isEmpty()){
                throw new RuntimeException( "Customer  not found " );

            }
            Customer customer1 = customer.get();
            customer1.setAddress(customerDTO.getAddress());
            customer1.setFirstName(customerDTO.getFirstName());
            customer1.setLastName(customerDTO.getLastName());
            customer1.setPhone(customerDTO.getPhone());
            customer1.setStatus(customerDTO.getStatus());

            Role role = roleRepository.findById(customerDTO.getId()).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Customer customer2 =customer.get();
            customerRepository.save(customer1);
        }catch(Exception e){
            log.error("Error updating customer ");
            throw e;
        }

    }

    @Override
    public void changeCustomerStatus(long customerId) {
        log.info("Change customer  status");
        try {
            Optional<Customer> customer = customerRepository.findById(customerId);
            if(customer.isEmpty()){
                throw new RuntimeException( "customer not found " );
            }
            Customer customer1 = customer.get();
            customer1.setStatus(UserStatus.INACTIVE);
            customerRepository.save(customer1);
        } catch (Exception e) {
            log.error("Error changing customer status");
            throw e;
        }

    }

    @Override
    public List<CustomerDTO> filterCustomers(String username) {
        try {
            List<CustomerDTO> customerDTOList = new ArrayList<>();
            List<Customer> customers = customerRepository.findByUsernameContaining((username));
            for (Customer customer :customers) {
                CustomerDTO customerDTO = new CustomerDTO();
                customerDTO.setId(customer.getId());
                customerDTO.setAddress(customer.getAddress());
                customerDTO.setFirstName(customer.getFirstName());
                customerDTO.setLastName(customer.getLastName());
                customerDTO.setPhone(customer.getPhone());
                customerDTO.setStatus(customer.getStatus());

                customerDTOList.add(customerDTO);
            }
            return customerDTOList;
        } catch (Exception e) {
            log.error("Error filtering customer ");
            throw e;
        }
    }

    @Override
    public void changeCustomerRole(long customerID, long roleID) {
        log.info("Change customer  role");
        try {
            Optional<Customer> customer = customerRepository.findById(customerID);
            if(customer.isEmpty()){
                throw new RuntimeException( "customer  not found " );
            }
            Role role = roleRepository.findById(roleID).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Customer customer1 = customer.get();
            customerRepository.save(customer1);
        }catch(Exception e){
            log.error("Error changing customer item role");
            throw e;
        }

    }
}
