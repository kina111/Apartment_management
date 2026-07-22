package com.apartment.management.features.auth.security;

import com.apartment.management.shared.entity.Account;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {

    private final Long accountId;
    private final String username;
    private final String password;
    private final String role;
    private final Collection<? extends GrantedAuthority> authorities;

    private final boolean isEnabled;

    public UserDetailsImpl(Account account) {
        this.accountId = account.getAccountId();
        this.username = account.getAccountName();
        this.password = account.getPassword();
        this.role = account.getRole().name();
        // Spring Security expects roles prefixed with ROLE_
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + account.getRole().name()));
        this.isEnabled = account.getStatus() == com.apartment.management.shared.enums.AccountStatus.ACTIVE;
    }

    public Long getAccountId() {
        return accountId;
    }

    public String getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isEnabled;
    }
}
