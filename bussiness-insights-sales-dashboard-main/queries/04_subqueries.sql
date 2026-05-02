#Products That Have Never Made a Loss
SELECT 
    ProductCategory,
    ProductSubCategory,
    ProductName,
    COUNT(*) AS TimesOrdered,
    ROUND(SUM(Profit), 2) AS TotalProfit
FROM superstore
WHERE ProductName NOT IN (
    SELECT DISTINCT ProductName
    FROM superstore
    WHERE Profit < 0
)
GROUP BY ProductCategory, ProductSubCategory, ProductName
ORDER BY TotalProfit DESC;

#Find Most Expensive Order in Each Region
SELECT 
    s1.Region,
    s1.OrderID,
    s1.CustomerName,
    s1.sales AS OrderTotal,
    s1.OrderDate
FROM superstore s1
WHERE s1.Sales = (
    SELECT MAX(s2.Sales)
    FROM superstore s2
    WHERE s2.Region = s1.Region
)
ORDER BY s1.Sales DESC;


#Customers Who Bought Only Once (One-Time Buyers)
SELECT 
    CustomerID,
    CustomerName,
    CustomerSegment,
    OrderDate AS PurchaseDate,
    Sales AS PurchaseAmount
FROM superstore s1
WHERE CustomerID IN (
    SELECT CustomerID
    FROM superstore
    GROUP BY CustomerID
    HAVING COUNT(DISTINCT OrderID) = 1
)
ORDER BY PurchaseAmount DESC;

#Products With Above-Average Discount but Below-Average Sales
SELECT 
    ProductName,
    ROUND(AVG(Discount) * 100, 2) AS AvgDiscountPercentage,
    ROUND(AVG(Sales), 2) AS AvgSalesPerOrder,
    COUNT(*) AS TimesOrdered
FROM superstore
WHERE Discount > (
    SELECT AVG(Discount)
    FROM superstore
)
AND Sales < (
    SELECT AVG(Sales)
    FROM superstore
)
GROUP BY ProductName
HAVING COUNT(*) >= 3
ORDER BY AvgDiscountPercentage DESC;
# Orders That Were More Profitable Than the Average Order in Their Region
SELECT 
    OrderID,
    CustomerName,
    Region,
    Sales,
    Profit,
    OrderDate
FROM superstore s1
WHERE Profit > (
    SELECT AVG(Profit)
    FROM superstore s2
    WHERE s2.Region = s1.Region
    AND Profit > 0
)
ORDER BY Profit DESC
LIMIT 15;

#Find the Most Recent Order for Each Customer
SELECT 
    s1.CustomerID,
    s1.CustomerName,
    s1.OrderID,
    s1.OrderDate,
    s1.Sales,
    s1.ProductName
FROM superstore s1
WHERE s1.OrderDate = (
    SELECT MAX(s2.OrderDate)
    FROM superstore s2
    WHERE s2.CustomerID = s1.CustomerID
)
ORDER BY s1.OrderDate DESC;
