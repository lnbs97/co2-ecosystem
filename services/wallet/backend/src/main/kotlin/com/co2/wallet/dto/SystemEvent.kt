package com.co2.wallet.dto

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.Instant
import java.util.UUID

// Eine generische Klasse für ALLE Events im Ökosystem
data class SystemEvent(
    val eventId: String = UUID.randomUUID().toString(),
    val source: String,          // z.B. "wallet-service"
    val type: String,            // z.B. "WALLET_CREATED", "MONEY_TRANSFER"
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    val timestamp: Instant = Instant.now(),
    val data: Map<String, Any>   // Flexibler Payload (Key-Value Paare)
)