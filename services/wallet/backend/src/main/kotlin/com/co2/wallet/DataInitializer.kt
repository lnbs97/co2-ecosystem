package com.co2.wallet

import com.co2.wallet.dto.CreateWalletRequest
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
class DataInitializer(private val walletService: WalletService) : CommandLineRunner {

    override fun run(vararg args: String?) {
        try {
            walletService.createWallet(CreateWalletRequest("person_a_uuid", 100.0, 500.0))
        } catch (e: Exception) {
            println("Wallet for person_a_uuid already exists.")
        }
        try {
            walletService.createWallet(CreateWalletRequest("person_b_uuid", 100.0, 500.0))
        } catch (e: Exception) {
            println("Wallet for person_b_uuid already exists.")
        }
        try {
            walletService.createWallet(CreateWalletRequest("shop_a_uuid", 10000.0, 100000.0))
        } catch (e: Exception) {
            println("Wallet for shop_a_uuid already exists.")
        }
        try {
            walletService.createWallet(CreateWalletRequest("shop_b_uuid", 10000.0, 100000.0))
        } catch (e: Exception) {
            println("Wallet for shop_b_uuid already exists.")
        }
        try {
            walletService.createWallet(CreateWalletRequest("exchange", 0.0, 0.0))
        } catch (e: Exception) {
            println("Wallet for exchange already exists.")
        }
    }
}
