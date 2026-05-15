package com.fifa2026.prode;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ProdeApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProdeApplication.class, args);
    }
}
