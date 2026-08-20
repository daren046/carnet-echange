package fr.carnet.echange.repository;

import fr.carnet.echange.entity.BookCopy;
import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.enums.ExtraCaurisStatus;
import fr.carnet.echange.enums.ListingCategory;
import fr.carnet.echange.enums.ListingKind;
import fr.carnet.echange.enums.SchoolLevel;
import fr.carnet.echange.enums.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {

    @Query("""
        SELECT b FROM BookCopy b
        WHERE b.status = :status
        AND (:level IS NULL OR b.level = :level)
        AND (:subject IS NULL OR b.subject = :subject)
        AND (:libraryMode IS NULL OR b.libraryMode = :libraryMode)
        AND (:zoneId IS NULL OR b.zone.id = :zoneId)
        AND (:title IS NULL OR :title = '' OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:listingCategory IS NULL OR b.listingCategory = :listingCategory)
        AND (:listingKind IS NULL OR b.listingKind = :listingKind)
        ORDER BY b.createdAt DESC
        """)
    List<BookCopy> search(
            @Param("status") CopyStatus status,
            @Param("level") SchoolLevel level,
            @Param("subject") Subject subject,
            @Param("libraryMode") Boolean libraryMode,
            @Param("zoneId") Long zoneId,
            @Param("title") String title,
            @Param("listingCategory") ListingCategory listingCategory,
            @Param("listingKind") ListingKind listingKind
    );

    List<BookCopy> findByDepositorIdOrderByCreatedAtDesc(Long depositorId);

    List<BookCopy> findByOfferTypeIsNull();

    List<BookCopy> findByListingKindIsNull();

    List<BookCopy> findByExtraCaurisStatusIsNull();

    List<BookCopy> findByStatusOrderByCreatedAtDesc(CopyStatus status);

    List<BookCopy> findByExtraCaurisStatusOrderByCreatedAtDesc(ExtraCaurisStatus extraCaurisStatus);

    List<BookCopy> findByCaurisCreditedFalseAndLibraryModeFalseAndListingCategoryAndStatusOrderByCreatedAtDesc(
            ListingCategory listingCategory, CopyStatus status);

    long countByStatus(CopyStatus status);
}
