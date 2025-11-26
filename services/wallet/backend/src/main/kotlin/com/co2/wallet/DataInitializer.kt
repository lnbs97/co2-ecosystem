package com.co2.wallet

import com.co2.wallet.dto.CreateWalletRequest
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
class DataInitializer(private val walletService: WalletService) : CommandLineRunner {

    override fun run(vararg args: String?) {
        listOf(
            CreateWalletRequest("person_a_uuid", 100.0, 500.0),
            CreateWalletRequest("person_b_uuid", 100.0, 500.0),
            CreateWalletRequest("shop_a_uuid", 10000.0, 100000.0),
            CreateWalletRequest("shop_b_uuid", 10000.0, 100000.0),
            CreateWalletRequest("exchange", 0.0, 0.0)
        ).forEach { request ->
            try {
                walletService.createWallet(request)
            } catch (e: Exception) {
                println("Wallet for ${request.userId} already exists.")
            }
        }
    }
}