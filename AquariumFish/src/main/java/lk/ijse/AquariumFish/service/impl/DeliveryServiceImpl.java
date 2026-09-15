package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.DeliveryDTO;
import lk.ijse.AquariumFish.entity.Delivery;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.DeliveryRepository;
import lk.ijse.AquariumFish.service.DeliveryService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository repository;

    public DeliveryServiceImpl(DeliveryRepository repository) {
        this.repository = repository;
    }

    @Override
    public void saveDelivery(DeliveryDTO dto) {

        Delivery delivery = new Delivery();

        delivery.setDeliveryAddress(dto.getDeliveryAddress());
        delivery.setDeliveryDate(dto.getDeliveryDate());
        delivery.setDeliveryStatus(dto.getDeliveryStatus());
        delivery.setTrackingNo(dto.getTrackingNo());
        delivery.setStatus(dto.getStatus());

        repository.save(delivery);
    }

    @Override
    public List<DeliveryDTO> getAllDeliveries() {

        List<DeliveryDTO> list = new ArrayList<>();

        for (Delivery delivery : repository.findAll()) {

            DeliveryDTO dto = new DeliveryDTO();

            dto.setId(delivery.getId());
            dto.setDeliveryAddress(delivery.getDeliveryAddress());
            dto.setDeliveryDate(delivery.getDeliveryDate());
            dto.setDeliveryStatus(delivery.getDeliveryStatus());
            dto.setTrackingNo(delivery.getTrackingNo());
            dto.setStatus(delivery.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public DeliveryDTO getDeliveryById(Long id) {

        Delivery delivery = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Delivery not found"));

        DeliveryDTO dto = new DeliveryDTO();

        dto.setId(delivery.getId());
        dto.setDeliveryAddress(delivery.getDeliveryAddress());
        dto.setDeliveryDate(delivery.getDeliveryDate());
        dto.setDeliveryStatus(delivery.getDeliveryStatus());
        dto.setTrackingNo(delivery.getTrackingNo());
        dto.setStatus(delivery.getStatus());

        return dto;
    }

    @Override
    public void updateDelivery(DeliveryDTO dto) {

        Delivery delivery = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Delivery not found"));

        delivery.setDeliveryAddress(dto.getDeliveryAddress());
        delivery.setDeliveryDate(dto.getDeliveryDate());
        delivery.setDeliveryStatus(dto.getDeliveryStatus());
        delivery.setTrackingNo(dto.getTrackingNo());
        delivery.setStatus(dto.getStatus());

        repository.save(delivery);
    }

    @Override
    public void changeDeliveryStatus(Long id) {

        Delivery delivery = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Delivery not found"));

        delivery.setStatus(UserStatus.INACTIVE);

        repository.save(delivery);
    }

    @Override
    public List<DeliveryDTO> filterDeliveries(String trackingNo) {

        List<DeliveryDTO> list = new ArrayList<>();

        for (Delivery delivery :
                repository.findByTrackingNoContaining(trackingNo)) {

            DeliveryDTO dto = new DeliveryDTO();

            dto.setId(delivery.getId());
            dto.setDeliveryAddress(delivery.getDeliveryAddress());
            dto.setDeliveryDate(delivery.getDeliveryDate());
            dto.setDeliveryStatus(delivery.getDeliveryStatus());
            dto.setTrackingNo(delivery.getTrackingNo());
            dto.setStatus(delivery.getStatus());

            list.add(dto);
        }

        return list;
    }
}