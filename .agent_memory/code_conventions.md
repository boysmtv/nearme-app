# DEKAT Booking Platform - Code Conventions

## Java Backend Conventions

### Package Structure
```
module/
  domain/          # Aggregate, Entity, Value Object, Repository interface
  application/     # Service (use cases), DTOs
  infrastructure/  # Repository impl, Kafka, Redis, external adapters
  web/             # Controller, Request/Response DTOs
```

### Entity Conventions
```java
@Entity
@Table(name = "table_name")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EntityName {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private UUID tenantId;
    
    @Version
    private Long version;
    
    @CreationTimestamp
    private Instant createdAt;
    
    @UpdateTimestamp
    private Instant updatedAt;
}
```

### Service Conventions
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleService {
    private final Repository repository;
    
    @Transactional
    public Result method(Input input) {
        // Validate
        // Execute business logic
        // Save
        // Publish event via outbox
        // Return result
    }
}
```

### Controller Conventions
```java
@RestController
@RequestMapping("/api/v1/path")
@RequiredArgsConstructor
public class ModuleController {
    private final ModuleService service;
    
    @PostMapping
    public ResponseEntity<Response> create(@RequestBody @Valid Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.create(request));
    }
}
```

## Flutter Conventions

### Feature Structure
```
features/
  feature_name/
    presentation/
      pages/
        feature_page.dart
    application/
    domain/
    data/
```

### State Management (Riverpod)
```dart
@riverpod
class FeatureState extends _$FeatureState {
  @override
  Future<Feature> build(String id) async {
    return ref.read(apiClientProvider).getFeature(id);
  }
}
```

### API Client
```dart
class ApiClient {
  final Dio _dio;
  
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    final response = await _dio.get(path, queryParameters: queryParameters);
    return response;
  }
}
```

## React Web Conventions

### Component Structure
```tsx
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export function ComponentName() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['key'],
    queryFn: () => api.getData(),
  });
  
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  
  return (
    <div className="tailwind-classes">
      {/* Content */}
    </div>
  );
}
```

## Database Conventions

### Migration Naming
```
V1__create_extensions.sql
V2__create_users_tables.sql
V3__create_access_control.sql
...
V14__seed_data.sql
```

### Table Conventions
- UUID primary keys
- tenant_id on all domain tables
- created_at, updated_at timestamps
- version for optimistic locking
- Explicit foreign keys
- Check constraints for enums

## API Conventions

### Request/Response
```json
{
  "id": "uuid",
  "field": "value",
  "created_at": "2026-08-23T10:00:00Z",
  "version": 1
}
```

### Error Response (RFC 9457)
```json
{
  "type": "https://api.dekat.id/problems/slot-conflict",
  "title": "Slot is no longer available",
  "status": 409,
  "detail": "The selected staff member already has another booking.",
  "instance": "/api/v1/bookings",
  "code": "BOOKING_SLOT_CONFLICT",
  "request_id": "0199...",
  "errors": []
}
```

### Money Format
```json
{
  "amount": 100000,
  "currency": "IDR"
}
```

## Git Conventions

### Branch Naming
- `feature/feature-name`
- `fix/bug-description`
- `chore/task-description`

### Commit Messages
```
feat: add booking confirmation endpoint
fix: resolve slot conflict race condition
chore: update dependencies
docs: update API documentation
```

### PR Title
```
feat(module): description
fix(module): description
```
