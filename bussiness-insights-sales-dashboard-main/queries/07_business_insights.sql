#orders with sales higher than all office suppliers sales
select OrderID,sales from superstore where 
sales > all (select sales from superstore where productcategory = officesuppliers );

#customer with above average sales
select CustomerName,sales from superstore where sales > (select avg(sales) from superstore);

#resuable  monthly sales view
create view monthlysales_view as select month(OrderDate) 
as month,round(sum(sales),2) as total_sales from superstore group by month(OrderDate);
select* from monthlysales_view;

#string functions
select CustomerName,upper(customername),
                    lower(customername),
                    length(customername),
                    substring(customername,1,5) from superstore;
                    
#second highest salary using sub query
select max(sales) as second_highest from superstore where
 sales<(select max(sales) from superstore);

#total sales & total profit
select round(sum(sales),2) as total_sales,
	   round(sum(profit),2) as total_profit from superstore;
       
# sales by product category
select ProductCategory,round(sum(sales),2) from superstore
 group by Productcategory order by Productcategory desc;
 

#profit by product subcategory
select productsubcategory,round(sum(profit),2) as subcategory from superstore
 group by productsubcategory order by productsubcategory desc;

# top 10 customer by sales 
select customername,round(sum(sales),2) as totalsales from superstore 
group by customername order by customername desc limit 10;

#sales by city
select city,sum(sales) as total_sales from superstore group by city order by city desc;

#profit analysis by product
select  ProductName,sum(sales) as sum_sales,
sum(Profit) as sum_profit from superstore group by ProductName order by sum_sales desc;


#regional sales and profit performance
select region ,round(sum(sales),2) as totalsales,round(sum(profit),2) as totalprofit from 
superstore group by region order by totalsales desc;

#Customer Segment Performance
SELECT 
    customersegment,
    ROUND(SUM(sales),2) AS total_sales,
    ROUND(SUM(profit),2) AS total_profit
FROM superstore
GROUP BY customersegment;

#Discount Impact on Profit
SELECT 
    discount,
    ROUND(AVG(profit),2) AS avg_profit
FROM superstore
GROUP BY discount
ORDER BY avg_profit;

#Loss-Making Orders
SELECT 
    orderid,
    sales,
    profit
FROM superstore
WHERE profit < 0;

#Top 5 Most Profitable Products (Sub-Category)
#which products drive maximum profit
SELECT 
    productsubcategory,
    ROUND(SUM(profit),2) AS total_profit
FROM superstore
GROUP BY productsubcategory
ORDER BY total_profit DESC
LIMIT 5;

#bottom 5 loss-making sub_category
#where is the business losing money?
select productsubcategory,round(sum(profit),2) as total_loss
from superstore group by productsubcategory
having total_loss<4
order by total_loss;

#Average Order Value (AOV)
#how much does a customer spend per order
SELECT 
    ROUND(SUM(quantityorderednew*unitprice) / COUNT(DISTINCT orderid), 2) AS avg_order_value
FROM superstore;
#Customer Repeat Purchase Analysis
#are customer comming back?
SELECT 
    customername,
    COUNT(DISTINCT orderid) AS total_orders,
    ROUND(SUM(sales),2) AS total_sales
FROM superstore
GROUP BY customername
HAVING total_orders >1
ORDER BY total_orders DESC;

#High Discount vs Profit Impact
#is giving more discount reducing profit?
SELECT 
    CASE 
        WHEN discount = 0 THEN 'No Discount'
        WHEN discount BETWEEN 0.01 AND 0.20 THEN 'Low Discount'
        WHEN discount BETWEEN 0.21 AND 0.50 THEN 'Medium Discount'
        ELSE 'High Discount'
    END AS discount_range,
    ROUND(SUM(sales),2) AS total_sales,
    ROUND(SUM(profit),2) AS total_profit
FROM superstore
GROUP BY discount_range
ORDER BY total_profit DESC;

#Category Contribution % to Total Sales
#which category contributes most to revenue?
SELECT 
    productcategory,
    ROUND(SUM(sales),2) AS category_sales,
    ROUND(
        (SUM(sales) / (SELECT SUM(sales) FROM superstore)) * 100, 2
    ) AS sales_percentage
FROM superstore
GROUP BY ProductCategory
ORDER BY sales_percentage DESC;
 
 # Customer Segment Profitability
 #which customer segment is most profitable?
 
 SELECT 
    customersegment,
    ROUND(SUM(sales),2) AS total_sales,
    ROUND(SUM(profit),2) AS total_profit,
    ROUND(AVG(profit),2) AS avg_profit_per_order
FROM superstore
GROUP BY customersegment;



# Orders with High Sales but Low/Negative Profit
#pricing or discount issue detection
SELECT 
    orderid,
    sales,
    profit,
    discount
FROM superstore
WHERE sales > 500 AND profit <= 0
ORDER BY sales DESC;


#Top 3 Cities by Profit in Each Region
#location based strategy
SELECT 
    region,
    city,
    ROUND(SUM(profit),2) AS total_profit
FROM superstore
GROUP BY region, city
ORDER BY region, total_profit DESC;


#High-Value Customers (Pareto 80/20 Rule)
#top customer contributing majority of revenue
SELECT 
    customername,
    ROUND(SUM(sales),2) AS total_sales
FROM superstore
GROUP BY CustomerName
ORDER BY total_sales DESC
LIMIT 20;

#Shipping Delay Impact on Profit
#does delayed shipping reduce profit?
SELECT 
    DATEDIFF(shipdate, orderdate) AS delivery_days,
    ROUND(AVG(profit),2) AS avg_profit
FROM superstore
GROUP BY delivery_days
ORDER BY delivery_days;

#Product Demand Analysis (Quantity Sold)
#which product sell the most
SELECT 
    ProductSubCategory,
    SUM(quantityorderednew) AS total_quantity_sold
FROM superstore
GROUP BY ProductSubCategory
ORDER BY total_quantity_sold DESC;

