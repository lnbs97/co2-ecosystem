package com.co2.wallet

import com.co2.wallet.dto.BalanceResponse
import com.co2.wallet.dto.Co2TransferRequest
import com.co2.wallet.dto.CombinedTransferRequest
import com.co2.wallet.dto.CreateWalletRequest
import com.co2.wallet.dto.MoneyTransferRequest
import com.co2.wallet.dto.TransactionEvent
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin
class WalletController(private val walletService: WalletService) {

    @PostMapping("/wallets")
    fun createWallet(@RequestBody request: CreateWalletRequest): Wallet {
        return walletService.createWallet(request)
    }

    @GetMapping("/balance")
    fun getBalance(@RequestHeader("X-User-ID") userId: String): BalanceResponse {
        return walletService.getBalance(userId)
    }

    @PostMapping("/transfer-co2")
    fun transferCo2(
        @RequestHeader("X-User-ID") fromUserId: String,
        @RequestBody request: Co2TransferRequest
    ): TransactionEvent {
        return walletService.transferCo2(fromUserId, request)
    }

    @PostMapping("/transfer-money")
    fun transferMoney(
        @RequestHeader("X-User-ID") fromUserId: String,
        @RequestBody request: MoneyTransferRequest
    ): TransactionEvent {
        return walletService.transferMoney(fromUserId, request)
    }

    @PostMapping("/transfer-combined")
    fun transferCombined(
        @RequestHeader("X-User-ID") fromUserId: String,
        @RequestBody request: CombinedTransferRequest
    ): List<TransactionEvent> {
        return walletService.transferCombined(fromUserId, request)
    }
}