package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.DeliveryDTO;
import lk.ijse.AquariumFish.entity.Delivery;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.DeliveryRepository;
import lk.ijse.AquariumFish.service.DeliveryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;

    public DeliveryServiceImpl(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    @Override
    public void saveDelivery(DeliveryDTO deliveryDTO) {
        log.info("Save delivery");

        try {
            Delivery delivery = new Delivery();

            delivery.setDeliveryAddress(deliveryDTO.getDeliveryAddress());
            delivery.setDeliveryDate(deliveryDTO.getDeliveryDate());
            delivery.setDeliveryStatus(deliveryDTO.getDeliveryStatus());
            delivery.setTrackingNo(deliveryDTO.getTrackingNo());
            delivery.setStatus(deliveryDTO.getStatus());

            deliveryRepository.save(delivery);

        } catch (Exception e) {
            log.error("Error saving delivery", e);
            throw e;
        }
    }

    @Override
    public List<DeliveryDTO> getAllDeliveries() {
        log.info("Get all deliveries");

        try {
            List<DeliveryDTO> deliveryDTOList = new ArrayList<>();

            List<Delivery> deliveries =
                    deliveryRepository.findAll();

            for (Delivery delivery : deliveries) {
                DeliveryDTO deliveryDTO = new DeliveryDTO();

                deliveryDTO.setId(delivery.getId());
                deliveryDTO.setDeliveryAddress(delivery.getDeliveryAddress());
                deliveryDTO.setDeliveryDate(delivery.getDeliveryDate());
                deliveryDTO.setDeliveryStatus(delivery.getDeliveryStatus());
                deliveryDTO.setTrackingNo(delivery.getTrackingNo());
                deliveryDTO.setStatus(delivery.getStatus());

                deliveryDTOList.add(deliveryDTO);
            }

            return deliveryDTOList;

        } catch (Exception e) {
            log.error("Error getting all deliveries", e);
            throw e;
        }
    }

    @Override
    public void updateDelivery(DeliveryDTO deliveryDTO) {
        log.info("Update delivery");

        try {
            Optional<Delivery> optionalDelivery =
                    deliveryRepository.findById(deliveryDTO.getId());

            if (optionalDelivery.isEmpty()) {
                throw new RuntimeException("Delivery not found");
            }

            Delivery delivery = optionalDelivery.get();

            delivery.setDeliveryAddress(deliveryDTO.getDeliveryAddress());
            delivery.setDeliveryDate(deliveryDTO.getDeliveryDate());
            delivery.setDeliveryStatus(deliveryDTO.getDeliveryStatus());
            delivery.setTrackingNo(deliveryDTO.getTrackingNo());
            delivery.setStatus(deliveryDTO.getStatus());

            deliveryRepository.save(delivery);

        } catch (Exception e) {
            log.error("Error updating delivery", e);
            throw e;
        }
    }

    @Override
    public void changeDeliveryStatus(long deliveryId) {
        log.info("Change delivery status");

        try {
            Optional<Delivery> optionalDelivery =
                    deliveryRepository.findById(deliveryId);

            if (optionalDelivery.isEmpty()) {
                throw new RuntimeException("Delivery not found");
            }

            Delivery delivery = optionalDelivery.get();

            delivery.setStatus(UserStatus.INACTIVE);

            deliveryRepository.save(delivery);

        } catch (Exception e) {
            log.error("Error changing delivery status", e);
            throw e;
        }
    }

    @Override
    public List<DeliveryDTO> filterDeliveries(String trackingNo) {
        log.info("Filter deliveries");

        try {
            List<DeliveryDTO> deliveryDTOList = new ArrayList<>();

            List<Delivery> deliveries =
                    deliveryRepository.findByTrackingNoContaining(trackingNo);

            for (Delivery delivery : deliveries) {
                DeliveryDTO deliveryDTO = new DeliveryDTO();

                deliveryDTO.setId(delivery.getId());
                deliveryDTO.setDeliveryAddress(delivery.getDeliveryAddress());
                deliveryDTO.setDeliveryDate(delivery.getDeliveryDate());
                deliveryDTO.setDeliveryStatus(delivery.getDeliveryStatus());
                deliveryDTO.setTrackingNo(delivery.getTrackingNo());
                deliveryDTO.setStatus(delivery.getStatus());

                deliveryDTOList.add(deliveryDTO);
            }

            return deliveryDTOList;

        } catch (Exception e) {
            log.error("Error filtering deliveries", e);
            throw e;
        }
    }
}