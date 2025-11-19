package com.co2.wallet.dto

data class MoneyTransferRequest(
    val toUserId: String,
    val amount: Double,
    val description: String
)
