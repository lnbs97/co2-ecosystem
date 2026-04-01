package com.co2.wallet

import com.co2.wallet.dto.CreateWalletRequest
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
class DataInitializer(private val walletService: WalletService) : CommandLineRunner {

    override fun run(vararg args: String?) {
        listOf(
            CreateWalletRequest("exchange", 0.0, 0.0),
            CreateWalletRequest("shop-eco-fashion", 0.0, 0.0),
            CreateWalletRequest("shop-eco-flights", 0.0, 0.0),
            CreateWalletRequest("shop-eco-trains", 0.0, 0.0),
        ).forEach { request ->
            try {
                walletService.createWallet(request)
            } catch (e: Exception) {
                println("Wallet for ${request.userId} already exists.")
            }
        }
    }
}