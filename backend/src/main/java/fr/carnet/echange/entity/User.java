package fr.carnet.echange.entity;

import fr.carnet.echange.enums.SchoolLevel;
import fr.carnet.echange.enums.UserRole;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.STUDENT;

    @Enumerated(EnumType.STRING)
    private SchoolLevel schoolLevel;

    @ManyToOne(fetch = FetchType.EAGER)
    private Zone zone;

    @Column(nullable = false)
    private int stampBalance = 0;

    @Column(nullable = false)
    private int depositBalance = 0;

    /** Solde Mobile Money (FCFA) — livraison, caution bibliothèque, recharges */
    @Column(nullable = false)
    private int walletBalance = 0;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected User() {}

    public User(String firstName, String lastName, String email, String password,
                UserRole role, SchoolLevel schoolLevel, Zone zone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.schoolLevel = schoolLevel;
        this.zone = zone;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    @Override
    public String getPassword() { return password; }
    public UserRole getRole() { return role; }
    public SchoolLevel getSchoolLevel() { return schoolLevel; }
    public Zone getZone() { return zone; }
    public int getStampBalance() { return stampBalance; }
    public int getDepositBalance() { return depositBalance; }
    public int getWalletBalance() { return walletBalance; }
    public Instant getCreatedAt() { return createdAt; }

    public void setStampBalance(int stampBalance) { this.stampBalance = stampBalance; }
    public void setDepositBalance(int depositBalance) { this.depositBalance = depositBalance; }
    public void setWalletBalance(int walletBalance) { this.walletBalance = walletBalance; }
    public void setZone(Zone zone) { this.zone = zone; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setPassword(String password) { this.password = password; }
    public void setSchoolLevel(SchoolLevel schoolLevel) { this.schoolLevel = schoolLevel; }
}
