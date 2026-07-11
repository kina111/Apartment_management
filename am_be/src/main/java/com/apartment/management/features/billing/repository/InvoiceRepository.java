package com.apartment.management.features.billing.repository;

import com.apartment.management.shared.entity.Invoice;
import com.apartment.management.shared.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

    Optional<Invoice> findByContractContractIdAndInvoiceMonthAndPaymentStatusNot(Long contractId, String invoiceMonth, PaymentStatus status);

    @Query("SELECT i FROM Invoice i JOIN FETCH i.contract c JOIN FETCH c.room r JOIN FETCH r.building b WHERE i.invoiceId = :invoiceId")
    Optional<Invoice> findByIdWithDetails(@Param("invoiceId") Long invoiceId);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.contract.room.building.buildingId = :buildingId AND i.paymentStatus <> com.apartment.management.shared.enums.PaymentStatus.VOID")
    BigDecimal sumTotalAmountByBuildingId(@Param("buildingId") Long buildingId);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.contract.room.building.buildingId = :buildingId AND i.paymentStatus = com.apartment.management.shared.enums.PaymentStatus.PAID")
    BigDecimal sumPaidAmountByBuildingId(@Param("buildingId") Long buildingId);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.contract.room.building.buildingId IN :buildingIds AND i.paymentStatus <> com.apartment.management.shared.enums.PaymentStatus.VOID")
    BigDecimal sumTotalAmountByBuildingIds(@Param("buildingIds") List<Long> buildingIds);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.contract.room.building.buildingId IN :buildingIds AND i.paymentStatus = com.apartment.management.shared.enums.PaymentStatus.PAID")
    BigDecimal sumPaidAmountByBuildingIds(@Param("buildingIds") List<Long> buildingIds);

    @Query("SELECT i FROM Invoice i JOIN FETCH i.contract c JOIN FETCH c.room r JOIN FETCH r.building b WHERE i.paymentStatus IN (com.apartment.management.shared.enums.PaymentStatus.PENDING, com.apartment.management.shared.enums.PaymentStatus.OVERDUE) AND b.buildingId = :buildingId")
    List<Invoice> findUnpaidInvoicesByBuildingId(@Param("buildingId") Long buildingId);

    @Query("SELECT i FROM Invoice i JOIN FETCH i.contract c JOIN FETCH c.room r JOIN FETCH r.building b WHERE i.paymentStatus IN (com.apartment.management.shared.enums.PaymentStatus.PENDING, com.apartment.management.shared.enums.PaymentStatus.OVERDUE) AND b.buildingId IN :buildingIds")
    List<Invoice> findUnpaidInvoicesByBuildingIds(@Param("buildingIds") List<Long> buildingIds);

    @Query("SELECT id.newIndex FROM InvoiceDetail id JOIN id.invoice i JOIN i.contract c " +
           "WHERE c.contractId = :contractId AND id.itemName LIKE CONCAT('%', :itemName, '%') AND i.paymentStatus <> com.apartment.management.shared.enums.PaymentStatus.VOID " +
           "ORDER BY i.invoiceMonth DESC, i.invoiceId DESC")
    List<Integer> findLatestNewIndexByContractAndItemName(@Param("contractId") Long contractId, @Param("itemName") String itemName);

    List<Invoice> findByPaymentStatus(PaymentStatus status);
}
