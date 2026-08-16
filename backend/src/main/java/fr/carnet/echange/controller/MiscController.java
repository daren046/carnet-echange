package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.transaction.TransactionDto;
import fr.carnet.echange.dto.zone.ZoneDto;
import fr.carnet.echange.entity.User;
import fr.carnet.echange.repository.ZoneRepository;
import fr.carnet.echange.service.FileStorageService;
import fr.carnet.echange.service.TransactionService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
public class MiscController {

    private final ZoneRepository zoneRepository;
    private final TransactionService transactionService;
    private final FileStorageService fileStorageService;

    public MiscController(ZoneRepository zoneRepository,
                          TransactionService transactionService,
                          FileStorageService fileStorageService) {
        this.zoneRepository = zoneRepository;
        this.transactionService = transactionService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/api/v1/zones")
    public ApiResponse<List<ZoneDto>> zones() {
        List<ZoneDto> zones = zoneRepository.findAll().stream()
                .map(z -> new ZoneDto(z.getId(), z.getCode(), z.getName()))
                .toList();
        return ApiResponse.ok(zones);
    }

    @GetMapping("/api/v1/transactions")
    public ApiResponse<List<TransactionDto>> history(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ApiResponse.ok(transactionService.history(user));
    }

    @GetMapping("/api/v1/files/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) throws Exception {
        Path file = fileStorageService.resolve(filename);
        if (!Files.exists(file) || !Files.isRegularFile(file)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(file.toUri());
        return ResponseEntity.ok()
                .contentType(detectMediaType(filename))
                .body(resource);
    }

    private MediaType detectMediaType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return MediaType.IMAGE_JPEG;
    }
}
