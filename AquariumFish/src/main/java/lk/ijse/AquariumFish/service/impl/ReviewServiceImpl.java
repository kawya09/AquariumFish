package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.ReviewDTO;
import lk.ijse.AquariumFish.entity.Review;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.ReviewRepository;
import lk.ijse.AquariumFish.service.ReviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @Override
    public void saveReview(ReviewDTO reviewDTO) {
        log.info("Save review");

        try {
            Review review = new Review();

            review.setRating(reviewDTO.getRating());
            review.setComment(reviewDTO.getComment());
            review.setReviewDate(reviewDTO.getReviewDate());
            review.setStatus(reviewDTO.getStatus());

            reviewRepository.save(review);

        } catch (Exception e) {
            log.error("Error saving review", e);
            throw e;
        }
    }

    @Override
    public List<ReviewDTO> getAllReviews() {
        log.info("Get all reviews");

        try {
            List<ReviewDTO> reviewDTOList = new ArrayList<>();

            List<Review> reviews = reviewRepository.findAll();

            for (Review review : reviews) {
                ReviewDTO reviewDTO = new ReviewDTO();

                reviewDTO.setId(review.getId());
                reviewDTO.setRating(review.getRating());
                reviewDTO.setComment(review.getComment());
                reviewDTO.setReviewDate(review.getReviewDate());
                reviewDTO.setStatus(review.getStatus());

                reviewDTOList.add(reviewDTO);
            }

            return reviewDTOList;

        } catch (Exception e) {
            log.error("Error getting all reviews", e);
            throw e;
        }
    }

    @Override
    public void updateReview(ReviewDTO reviewDTO) {
        log.info("Update review");

        try {
            Optional<Review> optionalReview =
                    reviewRepository.findById(reviewDTO.getId());

            if (optionalReview.isEmpty()) {
                throw new RuntimeException("Review not found");
            }

            Review review = optionalReview.get();

            review.setRating(reviewDTO.getRating());
            review.setComment(reviewDTO.getComment());
            review.setReviewDate(reviewDTO.getReviewDate());
            review.setStatus(reviewDTO.getStatus());

            reviewRepository.save(review);

        } catch (Exception e) {
            log.error("Error updating review", e);
            throw e;
        }
    }

    @Override
    public void changeReviewStatus(long reviewId) {
        log.info("Change review status");

        try {
            Optional<Review> optionalReview =
                    reviewRepository.findById(reviewId);

            if (optionalReview.isEmpty()) {
                throw new RuntimeException("Review not found");
            }

            Review review = optionalReview.get();

            review.setStatus(UserStatus.INACTIVE);

            reviewRepository.save(review);

        } catch (Exception e) {
            log.error("Error changing review status", e);
            throw e;
        }
    }

    @Override
    public List<ReviewDTO> filterReviews(String comment) {
        log.info("Filter reviews");

        try {
            List<ReviewDTO> reviewDTOList = new ArrayList<>();

            List<Review> reviews =
                    reviewRepository.findByCommentContaining(comment);

            for (Review review : reviews) {
                ReviewDTO reviewDTO = new ReviewDTO();

                reviewDTO.setId(review.getId());
                reviewDTO.setRating(review.getRating());
                reviewDTO.setComment(review.getComment());
                reviewDTO.setReviewDate(review.getReviewDate());
                reviewDTO.setStatus(review.getStatus());

                reviewDTOList.add(reviewDTO);
            }

            return reviewDTOList;

        } catch (Exception e) {
            log.error("Error filtering reviews", e);
            throw e;
        }
    }
}