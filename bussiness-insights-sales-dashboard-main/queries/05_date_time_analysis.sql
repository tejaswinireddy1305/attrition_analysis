#orderdate from superstore 
select orderdate from superstore;

#Monthly Sales Trend
SELECT 
    orderdate AS month,
    ROUND(SUM(sales),2) AS monthly_sales
FROM superstore
GROUP BY orderdate
ORDER BY month; 

#Average Delivery Time (Shipping Analysis)
SELECT 
    ROUND(AVG(DATEDIFF(shipdate, orderdate)),2) AS avg_delivery_days
FROM superstore;

#Year-wise Sales & Profit Trend
# is the bussiness growing year over year?

SELECT 
    YEAR(orderdate) AS year,
    ROUND(SUM(sales),2) AS total_sales,
    ROUND(SUM(profit),2) AS total_profit
FROM superstore
GROUP BY YEAR(orderdate)
ORDER BY year;

#monthwise sales and profit
SELECT 
    month(orderdate) AS month,
    ROUND(SUM(sales),2) AS total_sales,
    ROUND(SUM(profit),2) AS total_profit
FROM superstore
GROUP BY month(orderdate)
ORDER BY month;
 
 #day wise sales
 SELECT 
    day(orderdate) AS day,
    ROUND(SUM(sales),2) AS total_sales,
    ROUND(SUM(profit),2) AS total_profit
FROM superstore
GROUP BY day(orderdate)
ORDER BY day;


#quarter wise sales
SELECT 
    quarter(orderdate) AS quarter,
    ROUND(SUM(sales),2) AS total_sales,
    ROUND(SUM(profit),2) AS total_profit
FROM superstore
GROUP BY quarter(orderdate)
ORDER BY quarter;

#monthly sales
select month(orderdate) as month,
round(sum(sales), 2) as monthly_sales from superstore
group by month order by month;

#Region-wise avg Delivery Time
#which region have slow delivery
SELECT 
    region,
    ROUND(avg(DATEDIFF(shipdate, orderdate)),2) AS avg_delivery_days
FROM superstore
GROUP BY region
ORDER BY avg_delivery_days DESC;

#Shipping Delay Impact on Profit
#does delayed shipping reduce profit?
SELECT 
    DATEDIFF(shipdate, orderdate) AS delivery_days,
    ROUND(AVG(profit),2) AS avg_profit
FROM superstore
GROUP BY delivery_days
ORDER BY delivery_days;



