package fr.carnet.echange.dto.book;

import fr.carnet.echange.dto.cauris.CaurisGrantRequestDto;

import java.util.List;

public record ModerationInboxDto(
        List<BookCopyDto> pendingListings,
        List<BookCopyDto> pendingCauris,
        List<BookCopyDto> extraCaurisRequests,
        List<CaurisGrantRequestDto> grantRequests
) {}
