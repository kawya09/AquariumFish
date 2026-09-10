package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.CustomerDTO;
import lk.ijse.AquariumFish.dto.DeliveryDTO;
import lk.ijse.AquariumFish.entity.Customer;
import lk.ijse.AquariumFish.entity.Delivery;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.DeliveryRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.DeliveryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class DeliveryServiceImpl implements DeliveryService {
    private final DeliveryService deliveryService;
    private final RoleRepository roleRepository;
    private final DeliveryRepository deliveryRepository;

    public DeliveryServiceImpl(DeliveryService deliveryService, RoleRepository roleRepository, DeliveryRepository deliveryRepository) {
        this.deliveryService = deliveryService;
        this.roleRepository = roleRepository;
        this.deliveryRepository = deliveryRepository;
    }
    @Override
    public void saveDelivery(DeliveryDTO deliveryDTO) {
        log.info("Saving Delivery");

        try {
            Role role = roleRepository.findById(deliveryDTO.getId())
                    .orElseThrow(() -> new RuntimeException( "delivery not found " ));
            Delivery delivery = new Delivery();
            delivery.setDeliveryDate(deliveryDTO.getDeliveryDate());
            delivery.setDeliveryAddress(deliveryDTO.getDeliveryAddress());
            delivery.setDeliveryStatus(deliveryDTO.getDeliveryStatus());
            delivery.setTrackingNo(deliveryDTO.getTrackingNo());
            deliveryRepository.save(delivery);
        }catch (Exception e){
            log.error("Error saving delivery",e);
            throw e;
        }
    }

    @Override
    public List<DeliveryDTO> getAllDeliveries() {
        try {
            List<DeliveryDTO> deliveryDTOList = new ArrayList<>();
            List<Delivery> deliveries =deliveryRepository.findAll();
            for (Delivery delivery : deliveries) {
                DeliveryDTO deliveryDTO = new DeliveryDTO();

                deliveryDTO.setId(delivery.getId());
                deliveryDTO.setDeliveryDate(delivery.getDeliveryDate());
                deliveryDTO.setDeliveryAddress(delivery.getDeliveryAddress());
                deliveryDTO.setDeliveryStatus(delivery.getDeliveryStatus());
                deliveryDTO.setTrackingNo(delivery.getTrackingNo());
                deliveryDTOList.add(deliveryDTO);

            }
            return deliveryDTOList;
        } catch (Exception e) {
            log.error("Error getting all deliveries");
            throw e;
        }
    }


    @Override
    public void updateDelivery(DeliveryDTO deliveryDTO) {
        log.info("Update Cart ");
        try{
            Optional<Delivery> delivery = deliveryRepository.findById(deliveryDTO.getId());
            if(delivery.isEmpty()){
                throw new RuntimeException( "Delivery  not found " );

            }
            Delivery delivery1 = delivery.get();
            delivery1.setDeliveryDate(deliveryDTO.getDeliveryDate());
            delivery1.setDeliveryAddress(deliveryDTO.getDeliveryAddress());
            delivery1.setDeliveryStatus(deliveryDTO.getDeliveryStatus());
            delivery1.setTrackingNo(deliveryDTO.getTrackingNo());
            deliveryRepository.save(delivery1);

            Role role = roleRepository.findById(deliveryDTO.getId()).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Delivery delivery2 =delivery.get();
            deliveryRepository.save(delivery1);
        }catch(Exception e){
            log.error("Error updating deliveries ");
            throw e;
        }

    }

    @Override
    public void changeDeliveryStatus(long deliveryId) {
        log.info("Change Delivery  status");
        try {
            Optional<Delivery> delivery = deliveryRepository.findById(deliveryId);
            if(delivery.isEmpty()){
                throw new RuntimeException( "deliver not found " );
            }
            Delivery delivery1 = delivery.get();
            delivery1.setStatus(UserStatus.INACTIVE);
            deliveryRepository.save(delivery1);
        } catch (Exception e) {
            log.error("Error changing delivery status");
            throw e;
        }

    }

    @Override
    public List<DeliveryDTO> filterDelivers(String username) {
        try {
            List<DeliveryDTO> deliveryDTOList = new ArrayList<>();
            List<Delivery> deliveries = deliveryRepository.findByUsernameContaining((username));
            for (Delivery delivery :deliveries) {
                DeliveryDTO deliveryDTO = new DeliveryDTO();
                deliveryDTO.setId(delivery.getId());
                deliveryDTO.setDeliveryDate(delivery.getDeliveryDate());
                deliveryDTO.setDeliveryAddress(delivery.getDeliveryAddress());
                deliveryDTO.setDeliveryStatus(delivery.getDeliveryStatus());
                deliveryDTO.setTrackingNo(delivery.getTrackingNo());

                deliveryDTOList.add(deliveryDTO);
            }
            return deliveryDTOList;
        } catch (Exception e) {
            log.error("Error filtering delivery ");
            throw e;
        }
    }

    @Override
    public void changeDeliveryRole(long deliveryID, long roleID) {
        log.info("Change delivery  role");
        try {
            Optional<Delivery> delivery = deliveryRepository.findById(deliveryID);
            if(delivery.isEmpty()){
                throw new RuntimeException( "delivery  not found " );
            }
            Role role = roleRepository.findById(roleID).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Delivery delivery1 = delivery.get();
            deliveryRepository.save(delivery1);
        }catch(Exception e){
            log.error("Error changing delivery item role");
            throw e;
        }

    }
}
