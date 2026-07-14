package com.apartment.management.shared.config;

import com.apartment.management.features.auth.repository.AccountRepository;
import com.apartment.management.shared.entity.Account;
import com.apartment.management.shared.enums.AccountStatus;
import com.apartment.management.shared.enums.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class InitializeData implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(InitializeData.class);

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public InitializeData(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Tạo tài khoản System Admin mặc định
        if (!accountRepository.existsByAccountName("admin")) {
            Account admin = Account.builder()
                    .accountName("admin")
                    .email("admin@system.com")
                    .password(passwordEncoder.encode("123456"))
                    .role(Role.ADMIN)
                    .status(AccountStatus.ACTIVE)
                    .build();
            accountRepository.save(admin);
            logger.info("Đã tạo tài khoản System Admin mặc định: admin / 123456");
        }

        // Tạo tài khoản Landlord mặc định
        if (!accountRepository.existsByAccountName("landlord01")) {
            Account landlord = Account.builder()
                    .accountName("landlord01")
                    .email("landlord01@hosteye.com")
                    .password(passwordEncoder.encode("123456"))
                    .role(Role.LANDLORD)
                    .status(AccountStatus.ACTIVE)
                    .build();
            accountRepository.save(landlord);
            logger.info("Đã tạo tài khoản Landlord mặc định: landlord01 / 123456");
        }
    }
}
