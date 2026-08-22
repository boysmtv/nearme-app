/**
 * DEKAT @Modulith module: access.
 *
 * <p>Package layout:
 * <pre>
 *   id.dekat.access
 *     .api          -- public contracts (REST controllers / DTOs consumed by other modules)
 *     .domain       -- aggregates, value-objects, repository ports
 *     .application  -- use-cases / services
 *     .infrastructure -- JPA repos, Kafka publishers, REST adapters
 *     .events       -- domain events produced by this module
 * </pre>
 */
@org.springframework.lang.NonNullApi
package id.dekat.access;
