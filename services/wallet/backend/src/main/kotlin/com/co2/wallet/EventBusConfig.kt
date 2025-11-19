package com.co2.wallet

import org.springframework.amqp.core.TopicExchange
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class EventBusConfig {

    @Bean
    fun topicExchange(): TopicExchange {
        return TopicExchange("demo_events_exchange")
    }
}
