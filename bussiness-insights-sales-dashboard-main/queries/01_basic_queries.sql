#all columns
select * from superstore;

#how many columns
select count(*) from superstore;

#Find customers from selected regions
SELECT DISTINCT CustomerName,region
FROM superstore
WHERE region IN ('West', 'East');

#Customers NOT from selected regions
SELECT customername, region
FROM superstore
WHERE region NOT IN ('West','East');

#cost estimation sales-profit
select orderid,sales,Profit,(sales-Profit)
as cost_estimation from superstore where Profit>0 and sales>100;

#orders with sales between 500 and 1000
select OrderID,sales from superstore where sales between 500 and 1000;

#Top profitable orders 
SELECT orderid, sales, profit
FROM superstore
ORDER BY profit DESC;

#orders with sales higher than all office suppliers sales
select OrderID,sales from superstore where 
sales > all (select sales from superstore where productcategory = officesuppliers );

#customer with above average sales
select CustomerName,sales from superstore where sales > (select avg(sales) from superstore);
