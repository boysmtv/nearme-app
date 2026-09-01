package id.dekat.sharedkernel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${dekat.storage.base-path:./uploads}")
    private String storageBasePath;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4100", "http://localhost:3001", "http://localhost:3002", "http://localhost:8081", "http://localhost:4101", "http://localhost:4102")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String loc = storageBasePath;
        if (!loc.endsWith("/")) loc += "/";
        if (!loc.startsWith("file:")) loc = "file:" + loc;
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(loc)
                .setCachePeriod(3600);
    }
}
