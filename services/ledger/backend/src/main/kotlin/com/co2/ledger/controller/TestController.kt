package com.co2.ledger.controller // Passe den Paketnamen an deine Struktur an

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/test") // Basis-URL für diesen Controller
class TestController {

    /**
     * Ein einfacher GET-Endpunkt, der eine JSON-Nachricht zurückgibt.
     * Erreichbar unter: GET /api/test/hello
     */
    @GetMapping("/hello")
    fun getTestMessage(): Map<String, String> {
        // Spring Boot wandelt diese Map automatisch in ein JSON-Objekt um
        return mapOf("message" to "Hallo Welt! Der Ledger-Service läuft. 🚀")
    }
}