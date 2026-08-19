package fr.carnet.echange.repository;

import fr.carnet.echange.entity.BookCopy;
import fr.carnet.echange.enums.CopyStatus;
import fr.carnet.echange.enums.ListingCategory;
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
        ORDER BY b.createdAt DESC
        """)
    List<BookCopy> search(
            @Param("status") CopyStatus status,
            @Param("level") SchoolLevel level,
            @Param("subject") Subject subject,
            @Param("libraryMode") Boolean libraryMode,
            @Param("zoneId") Long zoneId,
            @Param("title") String title,
            @Param("listingCategory") ListingCategory listingCategory
    );

    List<BookCopy> findByDepositorIdOrderByCreatedAtDesc(Long depositorId);

    List<BookCopy> findByOfferTypeIsNull();

    long countByStatus(CopyStatus status);
}
