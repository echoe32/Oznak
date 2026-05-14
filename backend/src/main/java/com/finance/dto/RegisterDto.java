package com.finance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterDto {

    @NotBlank
    @Size(max = 254)
    @Email(message = "Invalid email format")
    @Pattern(
            regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,24}$",
            message = "Email must look like a real address (local@domain.tld, no spaces)"
    )
    private String email;

    @NotBlank
    @Size(min = 8, max = 128)
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*(?:[0-9]|[!@#$%^&*])).{8,128}$",
            message = "Password must be 8–128 characters with upper, lower, and a number or symbol (!@#$%^&*)"
    )
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email == null ? null : email.trim(); }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}