package com.co2.wallet.dto

import java.time.Instant

data class TransactionEvent(
    val eventType: String,
    val fromUserId: String,
    val toUserId: String,
    val amount: Double,
    val description: String,
    val timestamp: Instant
)
