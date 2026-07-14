package com.apartment.management.features.auth.security;

import com.apartment.management.features.auth.repository.AccountRepository;
import com.apartment.management.shared.entity.Account;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AccountRepository accountRepository;

    public UserDetailsServiceImpl(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = accountRepository.findByAccountName(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Account not found with username: " + username));
        return new UserDetailsImpl(account);
    }
}
