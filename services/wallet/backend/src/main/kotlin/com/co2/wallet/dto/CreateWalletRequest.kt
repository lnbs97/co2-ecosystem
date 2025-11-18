package com.co2.wallet.dto

data class CreateWalletRequest(
    val userId: String,
    val co2Balance: Double,
    val moneyBalance: Double
)
