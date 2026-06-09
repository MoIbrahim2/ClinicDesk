# Model

## Sources

- `docs/part2_usecases_domain.md`
- `docs/part3_database_architecture.md`

## What belongs here

- actors and use cases
- domain entities
- relationships
- business constraints
- table design
- validation rules

## What the team should do here

1. Convert the use cases into implementable backend rules.
2. Convert the ERD into actual entities and migrations.
3. Mark which relationships are required for MVP.
4. Define status enums early:
   - appointment status
   - visit status
   - invoice status
   - payment method
5. Define business rules early:
   - no double booking
   - invoice generated from completed visit
   - role-based access
   - patient record soft delete

## Output expected from this section

- entity list
- migration order
- validation rules
- seeded reference data list

