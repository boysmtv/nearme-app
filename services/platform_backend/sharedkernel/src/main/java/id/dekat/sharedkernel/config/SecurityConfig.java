package id.dekat.sharedkernel.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${jwt.access-secret}")
    private String accessSecret;

    @Bean
    public BearerTokenResolver bearerTokenResolver() {
        DefaultBearerTokenResolver resolver = new DefaultBearerTokenResolver();
        resolver.setAllowFormEncodedBodyParameter(false);
        resolver.setAllowUriQueryParameter(true);
        // allow token via query param for WebSocket handshake (token, accessToken)
        return request -> {
            String uri = request.getRequestURI();
            // Skip JWT resolution for public/auth endpoints — allow anonymous access even if Authorization header present with invalid token
            if (uri.startsWith("/api/v1/public/") || uri.startsWith("/public/")
                    || uri.startsWith("/api/v1/auth/") || uri.startsWith("/auth/")
                    || uri.startsWith("/api/v1/actuator/") || uri.startsWith("/actuator/")) {
                return null;
            }
            // WebSocket/SSE handshake: allow JWT via query param ?token= or ?accessToken=
            if (uri.startsWith("/ws-chat") || uri.startsWith("/ws/") || uri.contains("/ws-chat") || uri.contains("/events")) {
                String token = request.getParameter("token");
                if (token == null) token = request.getParameter("accessToken");
                if (token == null) token = request.getParameter("access_token");
                if (token != null && !token.isBlank()) return token;
            }
            // Also check servletPath as fallback
            String servletPath = request.getServletPath();
            if (servletPath != null && (servletPath.startsWith("/public/") || servletPath.startsWith("/auth/"))) {
                return null;
            }
            return resolver.resolve(request);
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, BearerTokenResolver bearerTokenResolver) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/**", "/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/ws-chat/**", "/ws/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .bearerTokenResolver(bearerTokenResolver)
                .jwt(jwt -> jwt.decoder(jwtDecoder()))
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4100", "http://localhost:3001", "http://localhost:3002", "http://localhost:8081", "http://localhost:4101", "http://localhost:4102"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKey key = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
        return NimbusJwtDecoder.withSecretKey(key).build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
