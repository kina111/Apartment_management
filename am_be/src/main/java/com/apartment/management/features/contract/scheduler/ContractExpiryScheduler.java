package com.apartment.management.features.contract.scheduler;

import com.apartment.management.features.contract.repository.ContractRepository;
import com.apartment.management.features.room.repository.RoomRepository;
import com.apartment.management.infrastructure.notification.IEmailService;
import com.apartment.management.shared.entity.Contract;
import com.apartment.management.shared.entity.ContractTenant;
import com.apartment.management.shared.entity.Room;
import com.apartment.management.shared.entity.Tenant;
import com.apartment.management.shared.enums.ContractStatus;
import com.apartment.management.shared.enums.RoomStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ContractExpiryScheduler {

    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    private final IEmailService emailService;

    /**
     * Scan for expired contracts daily at midnight.
     * Supports setting custom CRON via app properties.
     */
    @Scheduled(cron = "${app.scheduler.contract-expiry-cron:0 0 0 * * *}")
    @Transactional
    public void checkContractExpiry() {
        log.info("Starting ContractExpiryScheduler task...");
        LocalDate today = LocalDate.now();
        List<Contract> expiredContracts = contractRepository.findExpiredContracts(today);

        if (expiredContracts.isEmpty()) {
            log.info("No contracts expired today.");
            return;
        }

        log.info("Found {} contracts that have expired.", expiredContracts.size());
        for (Contract contract : expiredContracts) {
            try {
                log.info("Processing expiry for contract ID {}, Room {}", contract.getContractId(), contract.getRoom().getRoomCode());
                
                contract.setStatus(ContractStatus.EXPIRED);
                contractRepository.save(contract);

                Room room = contract.getRoom();
                if (room != null) {
                    room.setStatus(RoomStatus.AVAILABLE);
                    roomRepository.save(room);
                    log.info("Room {} status set to AVAILABLE.", room.getRoomCode());
                }

                Tenant contractHolder = getContractHolder(contract);
                if (contractHolder != null) {
                    emailService.sendContractExpiryEmail(contract, contractHolder);
                } else {
                    log.warn("No contract holder found for contract ID {}", contract.getContractId());
                }

            } catch (Exception e) {
                log.error("Error processing contract expiry for contract ID " + contract.getContractId(), e);
            }
        }
        log.info("ContractExpiryScheduler task finished.");
    }

    private Tenant getContractHolder(Contract contract) {
        if (contract.getContractTenants() == null) {
            return null;
        }
        return contract.getContractTenants().stream()
                .filter(ct -> Boolean.TRUE.equals(ct.getIsContractHolder()))
                .map(ContractTenant::getTenant)
                .findFirst()
                .orElse(null);
    }
}
