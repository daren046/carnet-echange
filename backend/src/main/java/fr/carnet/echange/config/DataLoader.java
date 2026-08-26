package fr.carnet.echange.config;

import fr.carnet.echange.entity.BookCopy;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.entity.Zone;
import fr.carnet.echange.enums.BookCondition;
import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.enums.SchoolLevel;
import fr.carnet.echange.enums.Subject;
import fr.carnet.echange.enums.UserRole;
import fr.carnet.echange.repository.BookCopyRepository;
import fr.carnet.echange.repository.NotificationRepository;
import fr.carnet.echange.repository.UserRepository;
import fr.carnet.echange.repository.ZoneRepository;
import fr.carnet.echange.entity.Notification;
import fr.carnet.echange.enums.ExtraCaurisStatus;
import fr.carnet.echange.enums.ListingCategory;
import fr.carnet.echange.enums.ListingKind;
import fr.carnet.echange.enums.NotificationType;
import fr.carnet.echange.enums.OfferType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Statement;

@Component
public class DataLoader implements CommandLineRunner {

    private final ZoneRepository zoneRepository;
    private final UserRepository userRepository;
    private final BookCopyRepository bookCopyRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataSource dataSource;

    public DataLoader(ZoneRepository zoneRepository, UserRepository userRepository,
                      BookCopyRepository bookCopyRepository,
                      NotificationRepository notificationRepository,
                      PasswordEncoder passwordEncoder,
                      DataSource dataSource) {
        this.zoneRepository = zoneRepository;
        this.userRepository = userRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        migrateH2UserRoleEnum();
        seedZones();
        seedUsers();
        try {
            seedBooks();
            seedSellerBooks();
            seedDecorItems();
            seedMiscItems();
            seedCatalogVolume();
        } catch (Exception e) {
            System.err.println("Chargement d'exemples incomplet : " + e.getMessage());
        }
        try {
            seedDemoNotifications();
            migrateListingCategory();
            migrateOfferType();
            migrateCaurisFlags();
            migrateListingKind();
        } catch (Exception e) {
            System.err.println("Migration incomplète : " + e.getMessage());
        }
    }

    private void migrateH2UserRoleEnum() {
        try (var conn = dataSource.getConnection(); Statement st = conn.createStatement()) {
            String product = conn.getMetaData().getDatabaseProductName();
            if (product == null || !product.toLowerCase().contains("h2")) {
                return;
            }
            st.execute("ALTER TABLE USERS ALTER COLUMN ROLE ENUM('ADMIN','DELIVERER','LIBRARIAN','PARENT','STUDENT','SELLER')");
            st.execute("ALTER TABLE BOOK_COPIES ALTER COLUMN SUBJECT ENUM('MATHEMATIQUES','FRANCAIS','HISTOIRE_GEO','ANGLAIS','ESPAGNOL','ALLEMAND','SVT','PHYSIQUE_CHIMIE','TECHNOLOGIE','ARTS','MUSIQUE','EPS','AUTRE','MEUBLES','LUMINAIRES','TEXTILE','VAISSELLE','DECORATION')");
            st.execute("ALTER TABLE BOOK_COPIES ALTER COLUMN STATUS ENUM('PENDING_REVIEW','AVAILABLE','RESERVED','IN_DELIVERY','DELIVERED','LIBRARY_BORROWED','REJECTED')");
            st.execute("ALTER TABLE BOOK_COPIES ALTER COLUMN LISTING_CATEGORY ENUM('BOOKS','DECOR','MISC')");
            st.execute("ALTER TABLE BOOK_COPIES ALTER COLUMN LISTING_KIND ENUM('OFFER','WANTED')");
            st.execute("ALTER TABLE BOOK_COPIES ALTER COLUMN OFFER_TYPE ENUM('EXCHANGE','DONATION','SALE')");
            st.execute("ALTER TABLE BOOK_COPIES ALTER COLUMN EXTRA_CAURIS_STATUS ENUM('NONE','PENDING','APPROVED','REJECTED')");
            st.execute("ALTER TABLE BOOK_COPIES ALTER COLUMN \"LEVEL\" ENUM('CP','CE1','CE2','CM1','CM2','SIXIEME','CINQUIEME','QUATRIEME','TROISIEME','SECONDE','PREMIERE','TERMINALE','UNIVERSITE')");
            st.execute("ALTER TABLE USERS ALTER COLUMN SCHOOL_LEVEL ENUM('CP','CE1','CE2','CM1','CM2','SIXIEME','CINQUIEME','QUATRIEME','TROISIEME','SECONDE','PREMIERE','TERMINALE','UNIVERSITE')");
            st.execute("ALTER TABLE BOOK_COPIES ALTER COLUMN \"CONDITION\" ENUM('NEUF','BON','MOYEN','ABIME')");
        } catch (Exception ignored) {
            // PostgreSQL or already migrated
        }
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
            demo.setPhone("70000001");
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

        if (userRepository.findByEmail("vendeur@carnet.fr").isEmpty()) {
            Zone est = zoneRepository.findByCode("EST").orElseThrow();
            User seller = new User("Awa", "Touré", "vendeur@carnet.fr",
                    passwordEncoder.encode("demo1234"), UserRole.SELLER, null, est);
            seller.setStampBalance(2);
            seller.setWalletBalance(15000);
            userRepository.save(seller);
        }

        if (userRepository.findByEmail("admin@carnet.fr").isEmpty()) {
            Zone centre = zoneRepository.findByCode("CENTRE").orElseThrow();
            userRepository.save(new User("Équipe", "Perso", "admin@carnet.fr",
                    passwordEncoder.encode("demo1234"), UserRole.ADMIN, null, centre));
        }

        if (userRepository.findByEmail("anonyme@perso.local").isEmpty()) {
            Zone centre = zoneRepository.findByCode("CENTRE").orElseThrow();
            User anon = new User("Utilisateur", "Anonyme", "anonyme@perso.local",
                    passwordEncoder.encode("no-login-" + System.nanoTime()), UserRole.SELLER, null, centre);
            userRepository.save(anon);
        }

        userRepository.findByEmail("demo@carnet.fr").ifPresent(u -> {
            if (u.getPhone() == null) {
                u.setPhone("70000001");
                userRepository.save(u);
            }
        });
        userRepository.findByEmail("paul@carnet.fr").ifPresent(u -> {
            if (u.getPhone() == null) {
                u.setPhone("70000002");
                userRepository.save(u);
            }
        });
        userRepository.findByEmail("sophie@carnet.fr").ifPresent(u -> {
            if (u.getPhone() == null) {
                u.setPhone("70000003");
                userRepository.save(u);
            }
        });
        userRepository.findByEmail("karim@carnet.fr").ifPresent(u -> {
            if (u.getPhone() == null) {
                u.setPhone("70000004");
                userRepository.save(u);
            }
        });
        userRepository.findByEmail("vendeur@carnet.fr").ifPresent(u -> {
            if (u.getPhone() == null) {
                u.setPhone("70000005");
                userRepository.save(u);
            }
        });
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
                BookCondition.BON, img(0), demo, nord, false, OfferType.EXCHANGE, null);
        saveBook("Français 6ème — Hachette", Subject.FRANCAIS, SchoolLevel.SIXIEME,
                BookCondition.BON, img(1), karim, centre, false, OfferType.DONATION, null);
        saveBook("Histoire-Géo 5ème — Belin", Subject.HISTOIRE_GEO, SchoolLevel.CINQUIEME,
                BookCondition.MOYEN, img(2), paul, sud, false, OfferType.EXCHANGE, null);
        saveBook("Transmath 5ème — Nathan", Subject.MATHEMATIQUES, SchoolLevel.CINQUIEME,
                BookCondition.BON, img(3), paul, sud, false, OfferType.SALE, null);
        saveBook("Enjoy English 4ème — Didier", Subject.ANGLAIS, SchoolLevel.QUATRIEME,
                BookCondition.BON, img(4), karim, centre, false, OfferType.EXCHANGE, null);
        saveBook("SVT 5ème — Bordas", Subject.SVT, SchoolLevel.CINQUIEME,
                BookCondition.BON, img(5), paul, sud, false, OfferType.DONATION, null);
        saveBook("Physique-Chimie 3ème — Hatier", Subject.PHYSIQUE_CHIMIE, SchoolLevel.TROISIEME,
                BookCondition.MOYEN, img(6), karim, centre, false, OfferType.SALE, null);
        saveBook("Technologie 4ème — Delagrave", Subject.TECHNOLOGIE, SchoolLevel.QUATRIEME,
                BookCondition.BON, img(7), demo, nord, false, OfferType.EXCHANGE, null);

        // ——— Lycée ———
        saveBook("Maths Seconde — Transmath", Subject.MATHEMATIQUES, SchoolLevel.SECONDE,
                BookCondition.NEUF, img(8), karim, centre, false, OfferType.SALE, null);
        saveBook("Espagnol LV2 — Première", Subject.ESPAGNOL, SchoolLevel.PREMIERE,
                BookCondition.BON, img(9), paul, sud, false, OfferType.EXCHANGE, null);
        saveBook("Physique-Chimie Terminale — Bordas", Subject.PHYSIQUE_CHIMIE, SchoolLevel.TERMINALE,
                BookCondition.BON, img(10), karim, centre, false, OfferType.DONATION, null);

        // ——— Université ———
        saveBook("Introduction à l'économie — Licence", Subject.AUTRE, SchoolLevel.UNIVERSITE,
                BookCondition.BON, img(7), karim, centre, false, OfferType.EXCHANGE, null);

        // ——— Primaire (déposés par un parent) ———
        saveBook("J'apprends à lire — CP", Subject.FRANCAIS, SchoolLevel.CP,
                BookCondition.BON, img(11), sophie, est, false, OfferType.DONATION, null);
        saveBook("Mon livre de maths CM2", Subject.MATHEMATIQUES, SchoolLevel.CM2,
                BookCondition.MOYEN, img(12), sophie, est, false, OfferType.EXCHANGE, null);
        saveBook("Histoire-Géo CM1 — Magnard", Subject.HISTOIRE_GEO, SchoolLevel.CM1,
                BookCondition.BON, img(13), sophie, est, false, OfferType.SALE, null);

        // ——— Bibliothèque (emprunt avec caution) ———
        saveBook("Le Petit Prince — Saint-Exupéry", Subject.FRANCAIS, SchoolLevel.CM2,
                BookCondition.BON, img(14), sophie, est, true, OfferType.EXCHANGE, null);
        saveBook("Harry Potter à l'école des sorciers", Subject.FRANCAIS, SchoolLevel.CM1,
                BookCondition.BON, img(15), paul, sud, true, OfferType.EXCHANGE, null);
        saveBook("L'Arabe facile — initiation", Subject.AUTRE, SchoolLevel.SIXIEME,
                BookCondition.NEUF, img(16), demo, nord, true, OfferType.EXCHANGE, null);

        System.out.println("✅ " + bookCopyRepository.count() + " manuels d'exemple chargés");
    }

    private void seedSellerBooks() {
        User seller = userRepository.findByEmail("vendeur@carnet.fr").orElse(null);
        if (seller == null) {
            return;
        }
        if (!bookCopyRepository.findByDepositorIdOrderByCreatedAtDesc(seller.getId()).isEmpty()) {
            return;
        }

        User demo = userRepository.findByEmail("demo@carnet.fr").orElse(null);
        User paul = userRepository.findByEmail("paul@carnet.fr").orElse(null);
        Zone est = zoneRepository.findByCode("EST").orElseThrow();

        saveBook("Maths 4ème — Transmath", Subject.MATHEMATIQUES, SchoolLevel.QUATRIEME,
                BookCondition.BON, img(3), seller, est, false, OfferType.SALE, null);
        saveBook("Français 3ème — Hatier", Subject.FRANCAIS, SchoolLevel.TROISIEME,
                BookCondition.NEUF, img(1), seller, est, false, OfferType.SALE, null);

        BookCopy reserved = saveBook("Anglais 5ème — Enjoy English", Subject.ANGLAIS, SchoolLevel.CINQUIEME,
                BookCondition.BON, img(4), seller, est, false, OfferType.SALE, null);
        reserved.setStatus(CopyStatus.RESERVED);
        if (demo != null) {
            reserved.setReservedBy(demo);
        }
        bookCopyRepository.save(reserved);

        BookCopy delivered = saveBook("Histoire-Géo 6ème — Belin", Subject.HISTOIRE_GEO, SchoolLevel.SIXIEME,
                BookCondition.MOYEN, img(2), seller, est, false, OfferType.EXCHANGE, null);
        delivered.setStatus(CopyStatus.DELIVERED);
        if (paul != null) {
            delivered.setReservedBy(paul);
        }
        bookCopyRepository.save(delivered);
    }

    private void seedDecorItems() {
        User seller = userRepository.findByEmail("vendeur@carnet.fr").orElse(null);
        User sophie = userRepository.findByEmail("sophie@carnet.fr").orElse(null);
        User anon = userRepository.findByEmail("anonyme@perso.local").orElse(null);
        if (seller == null) {
            return;
        }
        boolean already = bookCopyRepository.findByDepositorIdOrderByCreatedAtDesc(seller.getId()).stream()
                .anyMatch(b -> b.getListingCategory() == ListingCategory.DECOR);
        if (already) {
            return;
        }

        Zone est = zoneRepository.findByCode("EST").orElseThrow();
        Zone centre = zoneRepository.findByCode("CENTRE").orElseThrow();

        BookCopy sofa = saveBook("Canapé 3 places — tissu beige", Subject.MEUBLES, SchoolLevel.CM2,
                BookCondition.BON, img(12), seller, est, false, OfferType.SALE, 45000);
        sofa.setListingCategory(ListingCategory.DECOR);
        bookCopyRepository.save(sofa);

        BookCopy lamp = saveBook("Lampe de salon en rotin", Subject.LUMINAIRES, SchoolLevel.CM2,
                BookCondition.NEUF, img(8), seller, est, false, OfferType.EXCHANGE, null);
        lamp.setListingCategory(ListingCategory.DECOR);
        bookCopyRepository.save(lamp);

        if (sophie != null) {
            BookCopy curtain = saveBook("Rideaux lin 140x260", Subject.TEXTILE, SchoolLevel.CM2,
                    BookCondition.BON, img(9), sophie, est, false, OfferType.DONATION, null);
            curtain.setListingCategory(ListingCategory.DECOR);
            bookCopyRepository.save(curtain);
        }
        if (anon != null) {
            BookCopy vase = saveBook("Vase céramique artisanat local", Subject.DECORATION, SchoolLevel.CM2,
                    BookCondition.BON, img(13), anon, centre, false, OfferType.DONATION, null);
            vase.setListingCategory(ListingCategory.DECOR);
            vase.setAnonymous(true);
            bookCopyRepository.save(vase);
        }
    }

    private void seedMiscItems() {
        User seller = userRepository.findByEmail("vendeur@carnet.fr").orElse(null);
        User sophie = userRepository.findByEmail("sophie@carnet.fr").orElse(null);
        if (seller == null) {
            return;
        }
        boolean already = bookCopyRepository.findByDepositorIdOrderByCreatedAtDesc(seller.getId()).stream()
                .anyMatch(b -> b.getListingCategory() == ListingCategory.MISC);
        if (already) {
            return;
        }

        Zone est = zoneRepository.findByCode("EST").orElseThrow();
        Zone nord = zoneRepository.findByCode("NORD").orElseThrow();

        BookCopy bag = saveBook("Cartable bleu marine", Subject.AUTRE, SchoolLevel.CM2,
                BookCondition.BON, img(5), seller, est, false, OfferType.EXCHANGE, null);
        bag.setListingCategory(ListingCategory.MISC);
        bookCopyRepository.save(bag);

        BookCopy bike = saveBook("Vélo enfant 16 pouces", Subject.AUTRE, SchoolLevel.CM2,
                BookCondition.MOYEN, img(6), seller, est, false, OfferType.SALE, 15000);
        bike.setListingCategory(ListingCategory.MISC);
        bookCopyRepository.save(bike);

        if (sophie != null) {
            BookCopy lunch = saveBook("Boîte à goûter — inox", Subject.AUTRE, SchoolLevel.CM2,
                    BookCondition.NEUF, img(11), sophie, nord, false, OfferType.DONATION, null);
            lunch.setListingCategory(ListingCategory.MISC);
            bookCopyRepository.save(lunch);
        }
    }

    private void seedCatalogVolume() {
        if (bookCopyRepository.findAll().stream().anyMatch(b -> "Cahier de maths CE1 — Hatier".equals(b.getTitle()))) {
            return;
        }
        User paul = userRepository.findByEmail("paul@carnet.fr").orElse(null);
        User sophie = userRepository.findByEmail("sophie@carnet.fr").orElse(null);
        User karim = userRepository.findByEmail("karim@carnet.fr").orElse(null);
        User demo = userRepository.findByEmail("demo@carnet.fr").orElse(null);
        User seller = userRepository.findByEmail("vendeur@carnet.fr").orElse(null);
        if (paul == null || sophie == null || karim == null || demo == null || seller == null) {
            return;
        }
        Zone nord = zoneRepository.findByCode("NORD").orElseThrow();
        Zone centre = zoneRepository.findByCode("CENTRE").orElseThrow();
        Zone sud = zoneRepository.findByCode("SUD").orElseThrow();
        Zone est = zoneRepository.findByCode("EST").orElseThrow();

        saveBook("Cahier de maths CE1 — Hatier", Subject.MATHEMATIQUES, SchoolLevel.CE1,
                BookCondition.BON, img(0), sophie, est, false, OfferType.DONATION, null);
        saveBook("Lecture CE2 — Ratus", Subject.FRANCAIS, SchoolLevel.CE2,
                BookCondition.BON, img(1), sophie, est, false, OfferType.EXCHANGE, null);
        saveBook("Sciences CM2 — Magnard", Subject.SVT, SchoolLevel.CM2,
                BookCondition.MOYEN, img(5), sophie, est, false, OfferType.DONATION, null);
        saveBook("Anglais 6ème — Join the Team", Subject.ANGLAIS, SchoolLevel.SIXIEME,
                BookCondition.NEUF, img(4), demo, nord, false, OfferType.EXCHANGE, null);
        saveBook("Français 5ème — Lelivrescolaire", Subject.FRANCAIS, SchoolLevel.CINQUIEME,
                BookCondition.BON, img(11), paul, sud, false, OfferType.DONATION, null);
        saveBook("Histoire 4ème — Hatier", Subject.HISTOIRE_GEO, SchoolLevel.QUATRIEME,
                BookCondition.BON, img(2), karim, centre, false, OfferType.EXCHANGE, null);
        saveBook("SVT 3ème — Bordas", Subject.SVT, SchoolLevel.TROISIEME,
                BookCondition.MOYEN, img(5), karim, centre, false, OfferType.SALE, null);
        saveBook("Maths Première — Hyperbole", Subject.MATHEMATIQUES, SchoolLevel.PREMIERE,
                BookCondition.BON, img(8), karim, centre, false, OfferType.EXCHANGE, null);
        saveBook("Philosophie Terminale — Hatier", Subject.FRANCAIS, SchoolLevel.TERMINALE,
                BookCondition.BON, img(10), paul, sud, false, OfferType.DONATION, null);
        saveBook("Droit civil — Licence 1", Subject.AUTRE, SchoolLevel.UNIVERSITE,
                BookCondition.BON, img(7), karim, centre, false, OfferType.EXCHANGE, null);
        saveBook("Allemand LV2 — 3ème", Subject.ALLEMAND, SchoolLevel.TROISIEME,
                BookCondition.MOYEN, img(9), demo, nord, false, OfferType.DONATION, null);
        saveBook("Arts plastiques 4ème", Subject.ARTS, SchoolLevel.QUATRIEME,
                BookCondition.BON, img(13), paul, sud, false, OfferType.DONATION, null);

        saveDecor("Table basse bois massif", Subject.MEUBLES, seller, est, OfferType.SALE, 18000, img(12));
        saveDecor("Chaise de bureau confort", Subject.MEUBLES, seller, est, OfferType.EXCHANGE, null, img(6));
        saveDecor("Tapis berbère 160x230", Subject.TEXTILE, sophie, est, OfferType.DONATION, null, img(9));
        saveDecor("Miroir rond rotin", Subject.DECORATION, demo, nord, OfferType.EXCHANGE, null, img(13));
        saveDecor("Coussins graphiques (lot de 4)", Subject.TEXTILE, sophie, est, OfferType.SALE, 4000, img(11));
        saveDecor("Lampe de chevet céramique", Subject.LUMINAIRES, karim, centre, OfferType.DONATION, null, img(8));
        saveDecor("Vaisselle colorée — 6 assiettes", Subject.VAISSELLE, paul, sud, OfferType.EXCHANGE, null, img(3));

        saveMisc("Trousse scolaire complète", seller, est, OfferType.DONATION, null, img(5));
        saveMisc("Calculatrice scientifique Casio", karim, centre, OfferType.EXCHANGE, null, img(7));
        saveMisc("Gourde inox 750 ml", sophie, nord, OfferType.DONATION, null, img(11));
        saveMisc("Ballon de football", paul, sud, OfferType.SALE, 3000, img(6));
        saveMisc("Sac à dos randonnée", demo, nord, OfferType.EXCHANGE, null, img(12));
        saveMisc("Jeux de société — Uno + Monopoly", sophie, est, OfferType.DONATION, null, img(16));
    }

    private void saveDecor(String title, Subject subject, User depositor, Zone zone,
                           OfferType offerType, Integer price, String photo) {
        BookCopy copy = saveBook(title, subject, SchoolLevel.CM2, BookCondition.BON, photo,
                depositor, zone, false, offerType, price);
        copy.setListingCategory(ListingCategory.DECOR);
        bookCopyRepository.save(copy);
    }

    private void saveMisc(String title, User depositor, Zone zone, OfferType offerType,
                          Integer price, String photo) {
        BookCopy copy = saveBook(title, Subject.AUTRE, SchoolLevel.CM2, BookCondition.BON, photo,
                depositor, zone, false, offerType, price);
        copy.setListingCategory(ListingCategory.MISC);
        bookCopyRepository.save(copy);
    }

    private void migrateListingCategory() {
        for (BookCopy copy : bookCopyRepository.findAll()) {
            if (copy.getListingCategory() == ListingCategory.MISC) {
                continue;
            }
            boolean decorSubject = copy.getSubject() == Subject.MEUBLES
                    || copy.getSubject() == Subject.LUMINAIRES
                    || copy.getSubject() == Subject.TEXTILE
                    || copy.getSubject() == Subject.VAISSELLE
                    || copy.getSubject() == Subject.DECORATION;
            copy.setListingCategory(decorSubject ? ListingCategory.DECOR : ListingCategory.BOOKS);
            bookCopyRepository.save(copy);
        }
    }

    private void seedDemoNotifications() {
        if (notificationRepository.count() > 0) {
            return;
        }
        User demo = userRepository.findByEmail("demo@carnet.fr").orElse(null);
        User livreur = userRepository.findByEmail("livreur@carnet.fr").orElse(null);
        User seller = userRepository.findByEmail("vendeur@carnet.fr").orElse(null);
        if (demo != null) {
            notificationRepository.save(new Notification(demo, NotificationType.WELCOME,
                    "Bienvenue Marie",
                    "Vous avez 1 cauri et 10 000 F. Explorez le catalogue ou déposez un manuel.",
                    "/catalog"));
        }
        if (livreur != null) {
            notificationRepository.save(new Notification(livreur, NotificationType.DELIVERY_STARTED,
                    "Nouvelle tournée possible",
                    "Des livraisons attendent dans votre secteur. Consultez l'espace livreur.",
                    "/deliveries"));
        }
        if (seller != null) {
            notificationRepository.save(new Notification(seller, NotificationType.WELCOME,
                    "Espace vendeur prêt",
                    "Vos annonces et vos ventes sont regroupées ici, à l'écart du catalogue public.",
                    "/seller"));
        }
    }

    private void migrateOfferType() {
        for (BookCopy copy : bookCopyRepository.findByOfferTypeIsNull()) {
            copy.setOfferType(OfferType.EXCHANGE);
            bookCopyRepository.save(copy);
        }
        for (BookCopy copy : bookCopyRepository.findAll()) {
            if (copy.getListingCategory() == ListingCategory.BOOKS && copy.getExpectedPrice() != null) {
                copy.setExpectedPrice(null);
                bookCopyRepository.save(copy);
            }
        }
    }

    private void migrateListingKind() {
        for (BookCopy copy : bookCopyRepository.findByListingKindIsNull()) {
            copy.setListingKind(ListingKind.OFFER);
            bookCopyRepository.save(copy);
        }
    }

    private void migrateCaurisFlags() {
        for (BookCopy copy : bookCopyRepository.findByExtraCaurisStatusIsNull()) {
            copy.setExtraCaurisStatus(ExtraCaurisStatus.NONE);
            boolean eligible = !copy.isLibraryMode()
                    && copy.getListingCategory() == ListingCategory.BOOKS
                    && copy.getDepositor() != null
                    && !"anonyme@perso.local".equalsIgnoreCase(copy.getDepositor().getEmail());
            copy.setCaurisCredited(eligible);
            bookCopyRepository.save(copy);
        }
    }

    private BookCopy saveBook(String title, Subject subject, SchoolLevel level, BookCondition condition,
                              String photoUrl, User depositor, Zone zone, boolean libraryMode,
                              OfferType offerType, Integer expectedPrice) {
        BookCopy copy = new BookCopy(title, subject, level, condition, photoUrl, depositor, zone, libraryMode);
        copy.setOfferType(offerType != null ? offerType : OfferType.EXCHANGE);
        copy.setExpectedPrice(offerType == OfferType.SALE ? expectedPrice : null);
        copy.setExtraCaurisStatus(ExtraCaurisStatus.NONE);
        boolean eligible = !libraryMode
                && depositor != null
                && !"anonyme@perso.local".equalsIgnoreCase(depositor.getEmail());
        copy.setCaurisCredited(eligible);
        return bookCopyRepository.save(copy);
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
