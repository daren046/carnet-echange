package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.stats.ImpactStatsDto;
import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.repository.BookCopyRepository;
import fr.carnet.echange.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stats")
public class StatsController {

    private static final int AVERAGE_BOOK_PRICE_CFA = 8000;

    private final BookCopyRepository bookCopyRepository;
    private final UserRepository userRepository;

    public StatsController(BookCopyRepository bookCopyRepository, UserRepository userRepository) {
        this.bookCopyRepository = bookCopyRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ApiResponse<ImpactStatsDto> impact() {
        long pending = bookCopyRepository.countByStatus(CopyStatus.PENDING_REVIEW);
        long rejected = bookCopyRepository.countByStatus(CopyStatus.REJECTED);
        long deposited = bookCopyRepository.count() - pending - rejected;
        long available = bookCopyRepository.countByStatus(CopyStatus.AVAILABLE);
        long delivered = bookCopyRepository.countByStatus(CopyStatus.DELIVERED);
        long members = userRepository.count();
        return ApiResponse.ok(new ImpactStatsDto(
                deposited,
                available,
                delivered,
                members,
                delivered * AVERAGE_BOOK_PRICE_CFA
        ));
    }
}
