package com.finance.controller;

import com.finance.model.Transaction;
import com.finance.model.User;
import com.finance.repository.TransactionRepository;
import com.finance.repository.UserRepository;
import com.finance.security.EncryptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@Validated
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final EncryptionService encryptionService;

    public TransactionController(TransactionRepository transactionRepository, UserRepository userRepository, EncryptionService encryptionService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.encryptionService = encryptionService;
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@Valid @RequestBody Transaction transaction, Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        transaction.setUser(user);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setDescription(encryptionService.encrypt(transaction.getDescription()));

        Transaction saved = transactionRepository.save(transaction);
        saved.setDescription(encryptionService.decrypt(saved.getDescription()));
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody Transaction payload,
            Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Transaction existing = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        existing.setAmount(payload.getAmount());
        existing.setCategory(payload.getCategory());
        if (payload.getDescription() != null) {
            existing.setDescription(encryptionService.encrypt(payload.getDescription()));
        }

        Transaction saved = transactionRepository.save(existing);
        saved.setDescription(encryptionService.decrypt(saved.getDescription()));
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id, Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Transaction existing = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transactionRepository.delete(existing);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByUserOrderByCreatedAtDesc(user);

        transactions.forEach(t -> t.setDescription(encryptionService.decrypt(t.getDescription())));

        return ResponseEntity.ok(transactions);
    }
}