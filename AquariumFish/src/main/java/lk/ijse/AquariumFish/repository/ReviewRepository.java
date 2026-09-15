package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCommentContaining(String comment);
}
