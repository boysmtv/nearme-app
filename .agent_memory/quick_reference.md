# DEKAT Booking Platform - Quick Reference

## Running the Project

### Backend
```bash
cd services/platform_backend

# Build
./gradlew build

# Run locally
./gradlew bootRun --args='--spring.profiles.active=dev'

# Run tests
./gradlew test

# Database migration
./gradlew flywayMigrate

# Check for issues
./gradlew check
```

### Flutter Customer App
```bash
cd apps/mobile_customer

# Get dependencies
flutter pub get

# Run on device
flutter run

# Run tests
flutter test

# Build APK
flutter build apk --release

# Build iOS
flutter build ios --release
```

### Flutter Partner App
```bash
cd apps/mobile_partner

flutter pub get
flutter run
flutter test
```

### React Web Public
```bash
cd apps/web_public

pnpm install
pnpm dev        # Development (port 3000)
pnpm build      # Production build
pnpm preview    # Preview production build
pnpm test       # Run tests
```

### React Web Provider
```bash
cd apps/web_provider

pnpm install
pnpm dev        # Development (port 3001)
pnpm build
pnpm test
```

### React Web Admin
```bash
cd apps/web_admin

pnpm install
pnpm dev        # Development (port 3002)
pnpm build
pnpm test
```

## Docker Commands

### Start All Services
```bash
cd infra/compose

# Development
docker compose -f compose.yaml -f compose.development.yaml up -d

# Production
docker compose -f compose.yaml -f compose.production.yaml \
  --project-name dekat-production \
  --env-file /etc/dekat/production.env \
  up -d
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api-blue
docker compose logs -f postgres
docker compose logs -f worker
```

### Stop Services
```bash
docker compose down

# Remove volumes (careful!)
docker compose down -v
```

### Check Status
```bash
docker compose ps
docker compose top
```

## Database Operations

### Connect to PostgreSQL
```bash
docker compose exec postgres psql -U dekat -d dekat
```

### Run Migrations
```bash
# Via Gradle
./gradlew flywayMigrate

# Via Docker
docker compose exec api-blue java -jar app.jar --spring.flyway.enabled=true
```

### Backup Database
```bash
# Manual backup
docker compose exec postgres pg_dump -U dekat dekat > backup.sql

# Via pgBackRest (production)
docker compose exec backup pgbackrest --stanza=main backup --type=full
```

### Restore Database
```bash
# From backup
docker compose exec postgres psql -U dekat -d dekat < backup.sql
```

## Redis Operations

### Connect to Redis
```bash
docker compose exec redis redis-cli
```

### Common Commands
```bash
# Check keys
KEYS *

# Check memory
INFO memory

# Flush cache (careful!)
FLUSHDB
```

## Kafka Operations

### List Topics
```bash
docker compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list
```

### Consume Messages
```bash
docker compose exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic dekat.booking.events.v1 \
  --from-beginning
```

### Check Consumer Groups
```bash
docker compose exec kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --list
```

## Monitoring

### Grafana
- URL: http://localhost:3000 (dev) or http://grafana.internal.dekat.id (prod)
- Default credentials: admin/admin

### Prometheus
- URL: http://localhost:9090 (dev) or http://prometheus.internal.dekat.id (prod)

### Loki (Logs)
- URL: http://localhost:3100 (dev)

### Tempo (Traces)
- URL: http://localhost:3200 (dev)

## Common Tasks

### Add New Module
1. Create module directory: `services/platform_backend/src/main/java/id/dekat/newmodule/`
2. Add to settings.gradle
3. Create domain, application, infrastructure, web packages
4. Add module dependency in build.gradle
5. Create migration if needed

### Add New API Endpoint
1. Create request/response DTOs in `web/dto/`
2. Add controller method in `web/`
3. Add service method in `application/`
4. Add repository method if needed in `domain/`
5. Update OpenAPI spec

### Add New Flutter Screen
1. Create page in `features/feature_name/presentation/pages/`
2. Add route in `core/router/app_router.dart`
3. Create provider if needed
4. Add to navigation

### Add New React Page
1. Create component in `pages/`
2. Add route in `App.tsx`
3. Add API call if needed
4. Add to navigation

## Troubleshooting

### Backend Won't Start
1. Check PostgreSQL is running: `docker compose ps postgres`
2. Check Redis is running: `docker compose ps redis`
3. Check Kafka is running: `docker compose ps kafka`
4. Check logs: `docker compose logs api-blue`

### Flutter Build Fails
1. Run `flutter clean`
2. Run `flutter pub get`
3. Run `dart run build_runner build --delete-conflicting-outputs`
4. Try again

### React Build Fails
1. Run `pnpm clean` or delete `node_modules`
2. Run `pnpm install`
3. Run `pnpm build`

### Database Migration Fails
1. Check current state: `docker compose exec postgres psql -U dekat -d dekat -c "SELECT * FROM flyway_schema_history"`
2. Repair if needed: `./gradlew flywayRepair`
3. Re-run: `./gradlew flywayMigrate`

## Environment Variables

### Required for Backend
```
DATABASE_URL=jdbc:postgresql://postgres:5432/dekat
DATABASE_APP_USER=dekat
DATABASE_APP_PASSWORD=secret
REDIS_URL=redis://redis:6379
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
JWT_PRIVATE_KEY_FILE=/run/secrets/jwt_private_key
PAYMENT_PROVIDER=midtrans
```

### Required for Flutter
```
API_BASE_URL=https://api.dekat.id/api/v1
```

### Required for React
```
VITE_API_BASE_URL=https://api.dekat.id/api/v1
```
