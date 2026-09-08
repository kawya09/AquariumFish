package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
}
