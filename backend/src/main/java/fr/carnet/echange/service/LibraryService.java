package fr.carnet.echange.service;

import fr.carnet.echange.dto.library.LibraryLoanDto;
import fr.carnet.echange.dto.transaction.TransactionDto;
import fr.carnet.echange.entity.BookCopy;
import fr.carnet.echange.entity.LibraryLoan;
import fr.carnet.echange.entity.Transaction;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.enums.TransactionType;
import fr.carnet.echange.repository.BookCopyRepository;
import fr.carnet.echange.repository.LibraryLoanRepository;
import fr.carnet.echange.repository.TransactionRepository;
import fr.carnet.echange.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class LibraryService {

    private final LibraryLoanRepository libraryLoanRepository;
    private final BookCopyRepository bookCopyRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BookCopyService bookCopyService;

    @Value("${app.library-deposit}")
    private int libraryDeposit;

    public LibraryService(LibraryLoanRepository libraryLoanRepository,
                          BookCopyRepository bookCopyRepository,
                          TransactionRepository transactionRepository,
                          UserRepository userRepository,
                          BookCopyService bookCopyService) {
        this.libraryLoanRepository = libraryLoanRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.bookCopyService = bookCopyService;
    }

    public List<BookCopy> availableLibraryBooks() {
        return bookCopyRepository.search(CopyStatus.AVAILABLE, null, null, true, null, null);
    }

    @Transactional
    public LibraryLoanDto borrow(User user, Long bookCopyId) {
        BookCopy copy = bookCopyService.getById(bookCopyId);
        if (!copy.isLibraryMode() || copy.getStatus() != CopyStatus.AVAILABLE) {
            throw new IllegalStateException("Ce livre n'est pas disponible en bibliothèque");
        }
        if (user.getWalletBalance() < libraryDeposit) {
            throw new IllegalStateException("Solde Mobile Money insuffisant (" + libraryDeposit + " F requis)");
        }

        user.setWalletBalance(user.getWalletBalance() - libraryDeposit);
        user.setDepositBalance(user.getDepositBalance() + libraryDeposit);
        userRepository.save(user);
        copy.setStatus(CopyStatus.LIBRARY_BORROWED);
        copy.setReservedBy(user);

        LibraryLoan loan = libraryLoanRepository.save(new LibraryLoan(copy, user, libraryDeposit));
        transactionRepository.save(new Transaction(
                user, TransactionType.LIBRARY_DEPOSIT, 0, libraryDeposit, copy,
                "Caution versée pour emprunt : " + copy.getTitle()));

        return toDto(loan);
    }

    @Transactional
    public LibraryLoanDto returnBook(User user, Long loanId) {
        LibraryLoan loan = libraryLoanRepository.findById(loanId)
                .orElseThrow(() -> new IllegalArgumentException("Emprunt introuvable"));
        if (!loan.getBorrower().getId().equals(user.getId())) {
            throw new IllegalStateException("Cet emprunt ne vous appartient pas");
        }
        if (!loan.isActive()) {
            throw new IllegalStateException("Cet emprunt est déjà clôturé");
        }

        loan.setActive(false);
        loan.setReturnedAt(Instant.now());
        BookCopy copy = loan.getBookCopy();
        copy.setStatus(CopyStatus.AVAILABLE);
        copy.setReservedBy(null);

        user.setDepositBalance(user.getDepositBalance() - loan.getDepositAmount());
        user.setWalletBalance(user.getWalletBalance() + loan.getDepositAmount());
        userRepository.save(user);
        transactionRepository.save(new Transaction(
                user, TransactionType.LIBRARY_REFUND, 0, loan.getDepositAmount(), copy,
                "Caution remboursée : " + copy.getTitle()));

        return toDto(libraryLoanRepository.save(loan));
    }

    public List<LibraryLoanDto> myLoans(User user) {
        return libraryLoanRepository.findByBorrowerIdAndActiveTrue(user.getId())
                .stream().map(this::toDto).toList();
    }

    public int getDepositAmount() {
        return libraryDeposit;
    }

    private LibraryLoanDto toDto(LibraryLoan loan) {
        return new LibraryLoanDto(
                loan.getId(),
                loan.getBookCopy().getId(),
                loan.getBookCopy().getTitle(),
                loan.getBookCopy().getPhotoUrl(),
                loan.getDepositAmount(),
                loan.isActive(),
                loan.getBorrowedAt(),
                loan.getReturnedAt()
        );
    }
}
