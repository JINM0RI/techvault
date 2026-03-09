# SQL Cheat Sheet

## Basic Query

```sql
SELECT id, name
FROM users
WHERE active = 1
ORDER BY name;
```

## Joins

```sql
SELECT o.id, c.name
FROM orders o
JOIN customers c ON c.id = o.customer_id;
```
