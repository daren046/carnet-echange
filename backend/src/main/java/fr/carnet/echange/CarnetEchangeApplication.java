package fr.carnet.echange;

import fr.carnet.echange.config.CorsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(CorsProperties.class)
public class CarnetEchangeApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarnetEchangeApplication.class, args);
    }
}
