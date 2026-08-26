package fr.carnet.echange.service;

import fr.carnet.echange.entity.BookCopy;
import fr.carnet.echange.entity.Transaction;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.enums.TransactionType;
import fr.carnet.echange.repository.TransactionRepository;
import fr.carnet.echange.repository.UserRepository;
import fr.carnet.echange.util.CaurisLabels;
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
                "Cauris de bienvenue à l'inscription"));
    }

    @Transactional
    public void creditDeposit(User user, BookCopy bookCopy, int amount) {
        int credit = amount < 1 ? 1 : amount;
        user.setStampBalance(user.getStampBalance() + credit);
        userRepository.save(user);
        transactionRepository.save(new Transaction(
                user, TransactionType.DEPOSIT, credit, 0, bookCopy,
                CaurisLabels.of(credit) + " gagnés pour : " + bookCopy.getTitle()));
    }

    @Transactional
    public void creditExtra(User user, BookCopy bookCopy, int amount) {
        if (amount < 1) {
            throw new IllegalArgumentException("Le nombre de cauris supplémentaires doit être au moins 1");
        }
        user.setStampBalance(user.getStampBalance() + amount);
        userRepository.save(user);
        transactionRepository.save(new Transaction(
                user, TransactionType.EXTRA_CAURIS, amount, 0, bookCopy,
                CaurisLabels.extra(amount) + " pour : " + bookCopy.getTitle()));
    }

    @Transactional
    public void creditTeamGrant(User user, int amount) {
        if (amount < 1) {
            throw new IllegalArgumentException("Le nombre de cauris doit être au moins 1");
        }
        user.setStampBalance(user.getStampBalance() + amount);
        userRepository.save(user);
        transactionRepository.save(new Transaction(
                user, TransactionType.TEAM_GRANT, amount, 0, null,
                CaurisLabels.of(amount) + " accordés par l’équipe"));
    }

    @Transactional
    public void debitPickup(User user, BookCopy bookCopy) {
        int cost = bookCopy.getPickupCaurisCost();
        if (user.getStampBalance() < cost) {
            throw new IllegalStateException("Solde de cauris insuffisant (" + CaurisLabels.of(cost) + " requis)");
        }
        user.setStampBalance(user.getStampBalance() - cost);
        userRepository.save(user);
        transactionRepository.save(new Transaction(
                user, TransactionType.PICKUP, -cost, 0, bookCopy,
                CaurisLabels.of(cost) + " utilisés pour récupérer : " + bookCopy.getTitle()));
    }

    @Transactional
    public void refundPickup(User user, BookCopy bookCopy, int amount) {
        int refund = amount < 1 ? 1 : amount;
        user.setStampBalance(user.getStampBalance() + refund);
        userRepository.save(user);
        transactionRepository.save(new Transaction(
                user, TransactionType.PICKUP_REFUND, refund, 0, bookCopy,
                CaurisLabels.of(refund) + " remboursés — annulation : " + bookCopy.getTitle()));
    }
}
