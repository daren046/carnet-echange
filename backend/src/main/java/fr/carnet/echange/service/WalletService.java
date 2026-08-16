package fr.carnet.echange.service;

import fr.carnet.echange.entity.BookCopy;
import fr.carnet.echange.entity.Transaction;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.enums.MobileMoneyProvider;
import fr.carnet.echange.enums.TransactionType;
import fr.carnet.echange.repository.TransactionRepository;
import fr.carnet.echange.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public WalletService(UserRepository userRepository, TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    public int getBalance(User user) {
        return user.getWalletBalance();
    }

    /**
     * Simule une recharge Mobile Money (Orange Money, MTN, Moov).
     * En production : appeler l'API du provider et confirmer via webhook.
     */
    @Transactional
    public int topUp(User user, MobileMoneyProvider provider, String phoneNumber, int amount) {
        if (amount < 100) {
            throw new IllegalArgumentException("Montant minimum : 100 F");
        }
        if (!phoneNumber.matches("^\\+?[0-9]{8,15}$")) {
            throw new IllegalArgumentException("Numéro de téléphone invalide");
        }

        user.setWalletBalance(user.getWalletBalance() + amount);
        userRepository.save(user);
        transactionRepository.save(new Transaction(
                user, TransactionType.WALLET_TOPUP, 0, amount, null,
                "Recharge " + provider.name().replace('_', ' ') + " (" + phoneNumber + ")"));

        return user.getWalletBalance();
    }

    @Transactional
    public void debit(User user, int amount, TransactionType type, BookCopy bookCopy, String description) {
        if (user.getWalletBalance() < amount) {
            throw new IllegalStateException("Solde insuffisant (" + amount + " F requis, "
                    + user.getWalletBalance() + " F disponibles)");
        }
        user.setWalletBalance(user.getWalletBalance() - amount);
        userRepository.save(user);
        transactionRepository.save(new Transaction(user, type, 0, amount, bookCopy, description));
    }

    @Transactional
    public void credit(User user, int amount, TransactionType type, BookCopy bookCopy, String description) {
        user.setWalletBalance(user.getWalletBalance() + amount);
        userRepository.save(user);
        transactionRepository.save(new Transaction(user, type, 0, amount, bookCopy, description));
    }
}
