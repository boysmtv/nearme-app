/**
 * DEKAT @Modulith module: customer.
 *
 * <p>Package layout:
 * <pre>
 *   id.dekat.customer
 *     .api          -- public contracts (REST controllers / DTOs consumed by other modules)
 *     .domain       -- aggregates, value-objects, repository ports
 *     .application  -- use-cases / services
 *     .infrastructure -- JPA repos, Kafka publishers, REST adapters
 *     .events       -- domain events produced by this module
 * </pre>
 */
@org.springframework.lang.NonNullApi
package id.dekat.customer;
