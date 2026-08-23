package id.dekat.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.modulith.Modulith;

@SpringBootApplication
@Modulith
public class DeKatApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeKatApplication.class, args);
    }
}