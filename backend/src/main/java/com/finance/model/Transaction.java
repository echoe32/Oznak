package com.finance.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Positive
    private double amount;
    @NotNull
    @Enumerated(EnumType.STRING)
    private TransactionCategory category;
    @Size(max = 500)
    private String description;
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    private User user;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public TransactionCategory getCategory() { return category; }
    public void setCategory(TransactionCategory category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    @JsonIgnore
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
