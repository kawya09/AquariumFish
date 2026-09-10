package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.ReviewDTO;
import lk.ijse.AquariumFish.entity.Review;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.entity.Seller;
import lk.ijse.AquariumFish.repository.ReviewRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.ReviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class ReviewServiceImpl implements ReviewService {
    private ReviewRepository reviewRepository;
    private RoleRepository roleRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, RoleRepository roleRepository) {
        this.reviewRepository = reviewRepository;
        this.roleRepository = roleRepository;
    }
    @Override
    public void saveReview(ReviewDTO reviewDTO) {
        log.info("Saving review");

        try {
            Role role = roleRepository.findById(reviewDTO.getId())
                    .orElseThrow(() -> new RuntimeException( "Review not found " ));
            Review review = new Review();



        }catch (Exception e){
            log.error("Error saving review",e);
            throw e;
        }
    }

    @Override
    public List<ReviewDTO> getAllReviews() {
        return List.of();
    }

    @Override
    public void updateReviews(ReviewDTO reviewDTO) {

    }

    @Override
    public void changeReviewStatus(long reviewDTO) {

    }

    @Override
    public List<ReviewDTO> filterReviews(String username) {
        return List.of();
    }
}
