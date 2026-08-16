package fr.carnet.echange.service;

import fr.carnet.echange.dto.transaction.TransactionDto;
import fr.carnet.echange.entity.Transaction;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<TransactionDto> history(User user) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDto).toList();
    }

    private TransactionDto toDto(Transaction t) {
        return new TransactionDto(
                t.getId(),
                t.getType(),
                t.getStampDelta(),
                t.getAmount(),
                t.getBookCopy() != null ? t.getBookCopy().getTitle() : null,
                t.getDescription(),
                t.getCreatedAt()
        );
    }
}
