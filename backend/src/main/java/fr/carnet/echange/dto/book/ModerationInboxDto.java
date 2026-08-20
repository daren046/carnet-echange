package fr.carnet.echange.dto.book;

import java.util.List;

public record ModerationInboxDto(
        List<BookCopyDto> pendingListings,
        List<BookCopyDto> pendingCauris,
        List<BookCopyDto> extraCaurisRequests
) {}
