package com.co2.wallet

import com.co2.wallet.dto.BalanceResponse
import com.co2.wallet.dto.Co2TransferRequest
import com.co2.wallet.dto.CombinedTransferRequest
import com.co2.wallet.dto.CreateWalletRequest
import com.co2.wallet.dto.MoneyTransferRequest
import com.co2.wallet.dto.TransactionEvent
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

@Service
class WalletService(
    private val walletRepository: WalletRepository,
    private val rabbitTemplate: RabbitTemplate
) {

    fun createWallet(request: CreateWalletRequest): Wallet {
        if (walletRepository.findByUserId(request.userId) != null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Wallet for user ${request.userId} already exists.")
        }
        val wallet = Wallet(
            userId = request.userId,
            co2Balance = request.co2Balance,
            moneyBalance = request.moneyBalance
        )
        val savedWallet = walletRepository.save(wallet)
        val event = TransactionEvent(
            eventType = "WALLET_CREATED",
            fromUserId = "",
            toUserId = savedWallet.userId,
            amount = 0.0,
            description = "Wallet created",
            timestamp = Instant.now()
        )
        rabbitTemplate.convertAndSend("demo_events_exchange", "", event)
        return savedWallet
    }

    fun getBalance(userId: String): BalanceResponse {
        val wallet = walletRepository.findByUserId(userId) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet for user $userId not found.")
        return BalanceResponse(wallet.co2Balance, wallet.moneyBalance)
    }

    @Transactional
    fun transferCo2(fromUserId: String, request: Co2TransferRequest): TransactionEvent {
        val fromWallet = walletRepository.findByUserId(fromUserId) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet for user $fromUserId not found.")
        val toWallet = walletRepository.findByUserId(request.toUserId) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet for user ${request.toUserId} not found.")

        if (fromWallet.co2Balance < request.amount) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient CO2 balance.")
        }

        fromWallet.co2Balance -= request.amount
        toWallet.co2Balance += request.amount

        walletRepository.save(fromWallet)
        walletRepository.save(toWallet)

        val event = TransactionEvent(
            eventType = "CO2_TRANSFER",
            fromUserId = fromUserId,
            toUserId = request.toUserId,
            amount = request.amount,
            description = request.description,
            timestamp = Instant.now()
        )
        // rabbitTemplate.convertAndSend("demo_events_exchange", "", event)
        return event
    }

    @Transactional
    fun transferMoney(fromUserId: String, request: MoneyTransferRequest): TransactionEvent {
        val fromWallet = walletRepository.findByUserId(fromUserId) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet for user $fromUserId not found.")
        val toWallet = walletRepository.findByUserId(request.toUserId) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet for user ${request.toUserId} not found.")

        if (fromWallet.moneyBalance < request.amount) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient money balance.")
        }

        fromWallet.moneyBalance -= request.amount
        toWallet.moneyBalance += request.amount

        walletRepository.save(fromWallet)
        walletRepository.save(toWallet)

        val event = TransactionEvent(
            eventType = "MONEY_TRANSFER",
            fromUserId = fromUserId,
            toUserId = request.toUserId,
            amount = request.amount,
            description = request.description,
            timestamp = Instant.now()
        )
        rabbitTemplate.convertAndSend("demo_events_exchange", "", event)
        return event
    }

    @Transactional
    fun transferCombined(fromUserId: String, request: CombinedTransferRequest): List<TransactionEvent> {
        val fromWallet = walletRepository.findByUserId(fromUserId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet for user $fromUserId not found.")
        val toWallet = walletRepository.findByUserId(request.toUserId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet for user ${request.toUserId} not found.")

        val insufficientCo2 = fromWallet.co2Balance < request.co2Amount
        val insufficientMoney = fromWallet.moneyBalance < request.moneyAmount

        // Check both balances and provide specific error messages
        if (insufficientCo2 && insufficientMoney) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient CO2 and money balance.")
        } else if (insufficientCo2) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient CO2 balance.")
        } else if (insufficientMoney) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient money balance.")
        }

        // Perform transfers
        fromWallet.co2Balance -= request.co2Amount
        toWallet.co2Balance += request.co2Amount

        fromWallet.moneyBalance -= request.moneyAmount
        toWallet.moneyBalance += request.moneyAmount

        walletRepository.save(fromWallet)
        walletRepository.save(toWallet)

        // Create and send events for each part of the transfer
        val events = mutableListOf<TransactionEvent>()

        if (request.co2Amount > 0) {
            val co2Event = TransactionEvent(
                eventType = "CO2_TRANSFER",
                fromUserId = fromUserId,
                toUserId = request.toUserId,
                amount = request.co2Amount,
                description = "${request.description} (CO2)",
                timestamp = Instant.now()
            )
            rabbitTemplate.convertAndSend("demo_events_exchange", "", co2Event)
            events.add(co2Event)
        }

        if (request.moneyAmount > 0) {
            val moneyEvent = TransactionEvent(
                eventType = "MONEY_TRANSFER",
                fromUserId = fromUserId,
                toUserId = request.toUserId,
                amount = request.moneyAmount,
                description = "${request.description} (Money)",
                timestamp = Instant.now()
            )
            rabbitTemplate.convertAndSend("demo_events_exchange", "", moneyEvent)
            events.add(moneyEvent)
        }

        return events
    }
}