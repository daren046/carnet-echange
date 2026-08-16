package fr.carnet.echange.repository;

import fr.carnet.echange.entity.LibraryLoan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LibraryLoanRepository extends JpaRepository<LibraryLoan, Long> {
    List<LibraryLoan> findByBorrowerIdAndActiveTrue(Long borrowerId);
    Optional<LibraryLoan> findByBookCopyIdAndActiveTrue(Long bookCopyId);
}
