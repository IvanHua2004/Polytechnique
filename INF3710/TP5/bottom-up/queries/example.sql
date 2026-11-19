SELECT c.name, o.order_id, p.name
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN line_items li ON o.order_id = li.order_id
JOIN products p ON li.product_id = p.product_id
WHERE c.region = 'QC'
  AND p.category = 'books';
