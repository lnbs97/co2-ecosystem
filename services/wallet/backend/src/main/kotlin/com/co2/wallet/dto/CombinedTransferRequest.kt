package com.co2.wallet.dto

data class CombinedTransferRequest(
    val toUserId: String,
    val co2Amount: Double,
    val moneyAmount: Double,
    val description: String
)