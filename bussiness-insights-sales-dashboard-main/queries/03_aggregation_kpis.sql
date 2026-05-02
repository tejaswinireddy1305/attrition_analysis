#Aggregation Functions (SUM, AVG, COUNT, MIN, MAX)
SELECT 
    COUNT(DISTINCT orderid) AS total_orders,
    ROUND(SUM(sales),2) AS total_sales,
    ROUND(AVG(profit),2) AS avg_profit,
    MAX(sales) AS highest_order_value,
    MIN(sales) AS lowest_order_value
FROM superstore;
