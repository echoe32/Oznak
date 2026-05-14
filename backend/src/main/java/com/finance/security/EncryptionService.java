package com.finance.security;

import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Service
public class EncryptionService {
    private static final String ALGORITHM = "AES";
    private final SecretKeySpec keySpec;

    public EncryptionService() {
        this.keySpec = new SecretKeySpec("cybersecurity123".getBytes(), ALGORITHM);
    }

    public String encrypt(String data) {
        try {
            if (data == null) {
                data = "";
            }
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            return Base64.getEncoder().encodeToString(cipher.doFinal(data.getBytes()));
        } catch (Exception e) { throw new RuntimeException(e); }
    }

    public String decrypt(String encryptedData) {
        try {
            if (encryptedData == null || encryptedData.isEmpty()) {
                return "";
            }
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            return new String(cipher.doFinal(Base64.getDecoder().decode(encryptedData)));
        } catch (Exception e) { throw new RuntimeException(e); }
    }
}