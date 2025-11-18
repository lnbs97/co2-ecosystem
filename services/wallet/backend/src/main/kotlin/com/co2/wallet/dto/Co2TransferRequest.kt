package com.co2.wallet.dto

data class Co2TransferRequest(
    val toUserId: String,
    val amount: Double,
    val description: String
)
