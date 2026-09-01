package id.dekat.chat.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class ChatHandshakeInterceptor implements HandshakeInterceptor {

    @Value("${jwt.access-secret}")
    private String accessSecret;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        // Allow handshake without strict auth; JWT via query param validation is optional
        // If token present, validate lightly
        String query = request.getURI().getQuery();
        if (query != null && (query.contains("token=") || query.contains("accessToken="))) {
            String token = extractToken(query);
            if (token != null) {
                try {
                    SecretKey key = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
                    io.jsonwebtoken.Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
                } catch (Exception e) {
                    // don't block handshake - let controller handle auth
                }
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {}

    private String extractToken(String query) {
        for (String param : query.split("&")) {
            String[] kv = param.split("=", 2);
            if (kv.length == 2 && (kv[0].equals("token") || kv[0].equals("accessToken") || kv[0].equals("access_token"))) {
                return kv[1];
            }
        }
        return null;
    }
}
