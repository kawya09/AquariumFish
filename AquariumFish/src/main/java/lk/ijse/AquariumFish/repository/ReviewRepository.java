package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query(value = "SELECT * FROM review WHERE ?1 IS NULL OR comment LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Review> findByCommentContaining(String comment);

}