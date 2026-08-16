package fr.carnet.echange.config;

import fr.carnet.echange.entity.BookCopy;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.entity.Zone;
import fr.carnet.echange.enums.BookCondition;
import fr.carnet.echange.enums.SchoolLevel;
import fr.carnet.echange.enums.Subject;
import fr.carnet.echange.enums.UserRole;
import fr.carnet.echange.repository.BookCopyRepository;
import fr.carnet.echange.repository.UserRepository;
import fr.carnet.echange.repository.ZoneRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final ZoneRepository zoneRepository;
    private final UserRepository userRepository;
    private final BookCopyRepository bookCopyRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(ZoneRepository zoneRepository, UserRepository userRepository,
                      BookCopyRepository bookCopyRepository, PasswordEncoder passwordEncoder) {
        this.zoneRepository = zoneRepository;
        this.userRepository = userRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedZones();
        seedUsers();
        seedBooks();
    }

    private void seedZones() {
        if (zoneRepository.count() == 0) {
            zoneRepository.save(new Zone("NORD", "Quartier Nord"));
            zoneRepository.save(new Zone("CENTRE", "Centre-ville"));
            zoneRepository.save(new Zone("SUD", "Quartier Sud"));
            zoneRepository.save(new Zone("EST", "Quartier Est"));
        }
    }

    private void seedUsers() {
        if (userRepository.findByEmail("livreur@carnet.fr").isEmpty()) {
            Zone centre = zoneRepository.findByCode("CENTRE").orElseThrow();
            User deliverer = new User("Jean", "Livreur", "livreur@carnet.fr",
                    passwordEncoder.encode("livreur123"), UserRole.DELIVERER, null, centre);
            userRepository.save(deliverer);
        }

        if (userRepository.findByEmail("demo@carnet.fr").isEmpty()) {
            Zone nord = zoneRepository.findByCode("NORD").orElseThrow();
            User demo = new User("Marie", "Demo", "demo@carnet.fr",
                    passwordEncoder.encode("demo1234"), UserRole.STUDENT, SchoolLevel.SIXIEME, nord);
            demo.setStampBalance(1);
            demo.setWalletBalance(10000);
            userRepository.save(demo);
        }

        if (userRepository.findByEmail("paul@carnet.fr").isEmpty()) {
            Zone sud = zoneRepository.findByCode("SUD").orElseThrow();
            User paul = new User("Paul", "Martin", "paul@carnet.fr",
                    passwordEncoder.encode("demo1234"), UserRole.STUDENT, SchoolLevel.CINQUIEME, sud);
            paul.setStampBalance(2);
            paul.setWalletBalance(5000);
            userRepository.save(paul);
        }

        if (userRepository.findByEmail("sophie@carnet.fr").isEmpty()) {
            Zone est = zoneRepository.findByCode("EST").orElseThrow();
            User sophie = new User("Sophie", "Diallo", "sophie@carnet.fr",
                    passwordEncoder.encode("demo1234"), UserRole.PARENT, SchoolLevel.CM2, est);
            sophie.setStampBalance(1);
            sophie.setWalletBalance(8000);
            userRepository.save(sophie);
        }

        if (userRepository.findByEmail("karim@carnet.fr").isEmpty()) {
            Zone centre = zoneRepository.findByCode("CENTRE").orElseThrow();
            User karim = new User("Karim", "Benali", "karim@carnet.fr",
                    passwordEncoder.encode("demo1234"), UserRole.STUDENT, SchoolLevel.TROISIEME, centre);
            karim.setStampBalance(3);
            karim.setWalletBalance(6000);
            userRepository.save(karim);
        }
    }

    private void seedBooks() {
        if (bookCopyRepository.count() > 0) {
            return;
        }

        User paul = userRepository.findByEmail("paul@carnet.fr").orElseThrow();
        User sophie = userRepository.findByEmail("sophie@carnet.fr").orElseThrow();
        User karim = userRepository.findByEmail("karim@carnet.fr").orElseThrow();
        User demo = userRepository.findByEmail("demo@carnet.fr").orElseThrow();

        Zone nord = zoneRepository.findByCode("NORD").orElseThrow();
        Zone centre = zoneRepository.findByCode("CENTRE").orElseThrow();
        Zone sud = zoneRepository.findByCode("SUD").orElseThrow();
        Zone est = zoneRepository.findByCode("EST").orElseThrow();

        // ——— Collège ———
        saveBook("Transmath 6ème — Nathan", Subject.MATHEMATIQUES, SchoolLevel.SIXIEME,
                BookCondition.BON, img(0), demo, nord, false);
        saveBook("Français 6ème — Hachette", Subject.FRANCAIS, SchoolLevel.SIXIEME,
                BookCondition.BON, img(1), karim, centre, false);
        saveBook("Histoire-Géo 5ème — Belin", Subject.HISTOIRE_GEO, SchoolLevel.CINQUIEME,
                BookCondition.MOYEN, img(2), paul, sud, false);
        saveBook("Transmath 5ème — Nathan", Subject.MATHEMATIQUES, SchoolLevel.CINQUIEME,
                BookCondition.BON, img(3), paul, sud, false);
        saveBook("Enjoy English 4ème — Didier", Subject.ANGLAIS, SchoolLevel.QUATRIEME,
                BookCondition.BON, img(4), karim, centre, false);
        saveBook("SVT 5ème — Bordas", Subject.SVT, SchoolLevel.CINQUIEME,
                BookCondition.BON, img(5), paul, sud, false);
        saveBook("Physique-Chimie 3ème — Hatier", Subject.PHYSIQUE_CHIMIE, SchoolLevel.TROISIEME,
                BookCondition.MOYEN, img(6), karim, centre, false);
        saveBook("Technologie 4ème — Delagrave", Subject.TECHNOLOGIE, SchoolLevel.QUATRIEME,
                BookCondition.BON, img(7), demo, nord, false);

        // ——— Lycée ———
        saveBook("Maths Seconde — Transmath", Subject.MATHEMATIQUES, SchoolLevel.SECONDE,
                BookCondition.NEUF, img(8), karim, centre, false);
        saveBook("Espagnol LV2 — Première", Subject.ESPAGNOL, SchoolLevel.PREMIERE,
                BookCondition.BON, img(9), paul, sud, false);
        saveBook("Physique-Chimie Terminale — Bordas", Subject.PHYSIQUE_CHIMIE, SchoolLevel.TERMINALE,
                BookCondition.BON, img(10), karim, centre, false);

        // ——— Primaire (déposés par un parent) ———
        saveBook("J'apprends à lire — CP", Subject.FRANCAIS, SchoolLevel.CP,
                BookCondition.BON, img(11), sophie, est, false);
        saveBook("Mon livre de maths CM2", Subject.MATHEMATIQUES, SchoolLevel.CM2,
                BookCondition.MOYEN, img(12), sophie, est, false);
        saveBook("Histoire-Géo CM1 — Magnard", Subject.HISTOIRE_GEO, SchoolLevel.CM1,
                BookCondition.BON, img(13), sophie, est, false);

        // ——— Bibliothèque (emprunt avec caution) ———
        saveBook("Le Petit Prince — Saint-Exupéry", Subject.FRANCAIS, SchoolLevel.CM2,
                BookCondition.BON, img(14), sophie, est, true);
        saveBook("Harry Potter à l'école des sorciers", Subject.FRANCAIS, SchoolLevel.CM1,
                BookCondition.BON, img(15), paul, sud, true);
        saveBook("L'Arabe facile — initiation", Subject.AUTRE, SchoolLevel.SIXIEME,
                BookCondition.NEUF, img(16), demo, nord, true);

        System.out.println("✅ " + bookCopyRepository.count() + " manuels d'exemple chargés");
    }

    private void saveBook(String title, Subject subject, SchoolLevel level, BookCondition condition,
                          String photoUrl, User depositor, Zone zone, boolean libraryMode) {
        bookCopyRepository.save(new BookCopy(title, subject, level, condition, photoUrl, depositor, zone, libraryMode));
    }

    /** Photos libres Unsplash (manuels / livres scolaires) */
    private static String img(int i) {
        String[] urls = {
                "https://images.unsplash.com/photo-1544947950-fa07a98da237?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1497633762263-9fc17917d001?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1524995997942-0b3838dd88d8?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1512820790816-018553691102?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1589998059176-2d986453492c?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1516979187450-637abb451f72?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1471107340939-44b1c99858a5?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1543002588-bfa74002ed6e?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1532012197260-d72c4e121124?w=600&h=450&fit=crop",
                "https://images.unsplash.com/photo-1551882547-ff40c63fe906?w=600&h=450&fit=crop",
        };
        return urls[i % urls.length];
    }
}
