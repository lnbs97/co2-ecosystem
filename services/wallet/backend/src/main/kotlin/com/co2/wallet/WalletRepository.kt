package com.co2.wallet

import org.springframework.data.jpa.repository.JpaRepository

interface WalletRepository : JpaRepository<Wallet, Long> {
    fun findByUserId(userId: String): Wallet?
}
