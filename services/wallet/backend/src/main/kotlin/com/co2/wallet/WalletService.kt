package com.co2.wallet

import com.co2.wallet.dto.*
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

    private val SERVICE_NAME = "wallet-service"
    private val EXCHANGE_NAME = "co2_events"

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

        // Neues Event-Format für den Bus
        val systemEvent = SystemEvent(
            source = SERVICE_NAME,
            type = "WALLET_CREATED",
            data = mapOf(
                "userId" to savedWallet.userId,
                "initialCo2" to request.co2Balance,
                "initialMoney" to request.moneyBalance,
                "description" to "Wallet created"
            )
        )
        // Senden mit Routing Key 'wallet.created'
        rabbitTemplate.convertAndSend(EXCHANGE_NAME, "wallet.created", systemEvent)

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

        // 1. Objekt für die API-Antwort (Legacy/Frontend Compatibility)
        val txEvent = TransactionEvent(
            eventType = "CO2_TRANSFER",
            fromUserId = fromUserId,
            toUserId = request.toUserId,
            amount = request.amount,
            description = request.description,
            timestamp = Instant.now()
        )

        // 2. Objekt für den Event Bus (Neues Format)
        val systemEvent = SystemEvent(
            source = SERVICE_NAME,
            type = "CO2_TRANSFER",
            data = mapOf(
                "fromUserId" to fromUserId,
                "toUserId" to request.toUserId,
                "amount" to request.amount,
                "description" to request.description
            )
        )

        // Nachricht senden (jetzt aktiviert!)
        rabbitTemplate.convertAndSend(EXCHANGE_NAME, "wallet.transfer.co2", systemEvent)

        return txEvent
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

        // API Response
        val txEvent = TransactionEvent(
            eventType = "MONEY_TRANSFER",
            fromUserId = fromUserId,
            toUserId = request.toUserId,
            amount = request.amount,
            description = request.description,
            timestamp = Instant.now()
        )

        // Bus Event
        val systemEvent = SystemEvent(
            source = SERVICE_NAME,
            type = "MONEY_TRANSFER",
            data = mapOf(
                "fromUserId" to fromUserId,
                "toUserId" to request.toUserId,
                "amount" to request.amount,
                "currency" to "EUR",
                "description" to request.description
            )
        )

        rabbitTemplate.convertAndSend(EXCHANGE_NAME, "wallet.transfer.money", systemEvent)
        return txEvent
    }

    @Transactional
    fun transferCombined(fromUserId: String, request: CombinedTransferRequest): List<TransactionEvent> {
        val fromWallet = walletRepository.findByUserId(fromUserId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet for user $fromUserId not found.")
        val toWallet = walletRepository.findByUserId(request.toUserId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet for user ${request.toUserId} not found.")

        val insufficientCo2 = fromWallet.co2Balance < request.co2Amount
        val insufficientMoney = fromWallet.moneyBalance < request.moneyAmount

        if (insufficientCo2 && insufficientMoney) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient CO2 and money balance.")
        } else if (insufficientCo2) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient CO2 balance.")
        } else if (insufficientMoney) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient money balance.")
        }

        fromWallet.co2Balance -= request.co2Amount
        toWallet.co2Balance += request.co2Amount

        fromWallet.moneyBalance -= request.moneyAmount
        toWallet.moneyBalance += request.moneyAmount

        walletRepository.save(fromWallet)
        walletRepository.save(toWallet)

        val apiEvents = mutableListOf<TransactionEvent>()

        // CO2 Teil-Event
        if (request.co2Amount > 0) {
            val co2Tx = TransactionEvent(
                eventType = "CO2_TRANSFER",
                fromUserId = fromUserId,
                toUserId = request.toUserId,
                amount = request.co2Amount,
                description = "${request.description} (CO2)",
                timestamp = Instant.now()
            )
            apiEvents.add(co2Tx)

            val co2Sys = SystemEvent(
                source = SERVICE_NAME,
                type = "CO2_TRANSFER",
                data = mapOf(
                    "fromUserId" to fromUserId,
                    "toUserId" to request.toUserId,
                    "amount" to request.co2Amount,
                    "description" to "${request.description} (CO2)"
                )
            )
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, "wallet.transfer.co2", co2Sys)
        }

        // Money Teil-Event
        if (request.moneyAmount > 0) {
            val moneyTx = TransactionEvent(
                eventType = "MONEY_TRANSFER",
                fromUserId = fromUserId,
                toUserId = request.toUserId,
                amount = request.moneyAmount,
                description = "${request.description} (Money)",
                timestamp = Instant.now()
            )
            apiEvents.add(moneyTx)

            val moneySys = SystemEvent(
                source = SERVICE_NAME,
                type = "MONEY_TRANSFER",
                data = mapOf(
                    "fromUserId" to fromUserId,
                    "toUserId" to request.toUserId,
                    "amount" to request.moneyAmount,
                    "description" to "${request.description} (Money)"
                )
            )
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, "wallet.transfer.money", moneySys)
        }

        return apiEvents
    }
}