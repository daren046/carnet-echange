package fr.carnet.echange.service;

import fr.carnet.echange.entity.BookCopy;
import fr.carnet.echange.entity.Transaction;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.enums.TransactionType;
import fr.carnet.echange.repository.TransactionRepository;
import fr.carnet.echange.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StampService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Value("${app.welcome-stamps}")
    private int welcomeStamps;

    public StampService(UserRepository userRepository, TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public void grantWelcomeBonus(User user) {
        user.setStampBalance(user.getStampBalance() + welcomeStamps);
        userRepository.save(user);
        transactionRepository.save(new Transaction(
                user, TransactionType.WELCOME_BONUS, welcomeStamps, 0, null,
                "Tampon de bienvenue à l'inscription"));
    }

    @Transactional
    public void creditDeposit(User user, BookCopy bookCopy) {
        user.setStampBalance(user.getStampBalance() + 1);
        userRepository.save(user);
        transactionRepository.save(new Transaction(
                user, TransactionType.DEPOSIT, 1, 0, bookCopy,
                "Tampon gagné pour le dépôt : " + bookCopy.getTitle()));
    }

    @Transactional
    public void debitPickup(User user, BookCopy bookCopy) {
        if (user.getStampBalance() < 1) {
            throw new IllegalStateException("Solde de tampons insuffisant");
        }
        user.setStampBalance(user.getStampBalance() - 1);
        userRepository.save(user);
        transactionRepository.save(new Transaction(
                user, TransactionType.PICKUP, -1, 0, bookCopy,
                "Tampon utilisé pour récupérer : " + bookCopy.getTitle()));
    }

    @Transactional
    public void refundPickup(User user, BookCopy bookCopy) {
        user.setStampBalance(user.getStampBalance() + 1);
        userRepository.save(user);
        transactionRepository.save(new Transaction(
                user, TransactionType.PICKUP_REFUND, 1, 0, bookCopy,
                "Tampon remboursé — annulation : " + bookCopy.getTitle()));
    }
}
