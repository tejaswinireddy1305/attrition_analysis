#joins#Find Customers Who Bought the Same Product Multiple Times
SELECT 
    d1.CustomerID,
    d1.CustomerName,
    d1.ProductName,
    COUNT(DISTINCT d1.OrderID) AS TimesOrdered,
    MIN(d1.OrderDate) AS FirstOrder,
    MAX(d1.OrderDate) AS LastOrder
FROM superstore d1
JOIN superstore d2 ON d1.CustomerID = d2.CustomerID 
    AND d1.ProductName = d2.ProductName
    AND d1.OrderID != d2.OrderID
GROUP BY d1.CustomerID, d1.CustomerName, d1.ProductName
HAVING TimesOrdered >= 2
ORDER BY TimesOrdered DESC;

# Find Products Ordered Together
SELECT 
    p1.OrderID,
    p1.ProductName AS Product1,
    p1.ProductCategory AS Category1,
    p2.ProductName AS Product2,
    p2.ProductCategory AS Category2
FROM superstore p1
INNER JOIN superstore p2 ON p1.OrderID = p2.OrderID
WHERE p1.ProductName < p2.ProductName
    AND p1.CustomerSegment = p2.CustomerSegment
LIMIT 15;


# Customer Purchase Patterns Across Regions
SELECT 
    c1.CustomerName,
    c1.Region AS Region1,
    c2.Region AS Region2,
    COUNT(DISTINCT c1.OrderID) AS Orders_Region1,
    COUNT(DISTINCT c2.OrderID) AS Orders_Region2,
    AVG(c1.Sales) AS AvgSale_Region1,
    AVG(c2.Sales) AS AvgSale_Region2
FROM superstore c1
INNER JOIN Document c2 ON c1.CustomerID = c2.CustomerID
    AND c1.Region != c2.Region
GROUP BY c1.CustomerName, c1.Region, c2.Region
HAVING COUNT(DISTINCT c1.OrderID) >= 2 
    AND COUNT(DISTINCT c2.OrderID) >= 2
ORDER BY c1.CustomerName;

#Corporate vs Consumer Comparison
SELECT 
    corp.ProductName,
    corp.ProductCategory,
    COUNT(corp.OrderID) AS CorporateOrders,
    COUNT(cons.OrderID) AS ConsumerOrders,
    AVG(corp.Sales) AS AvgSale_Corporate,
    AVG(cons.Sales) AS AvgSale_Consumer,
    AVG(corp.Profit) AS AvgProfit_Corporate,
    AVG(cons.Profit) AS AvgProfit_Consumer
FROM superstore corp
INNER JOIN superstore cons ON corp.ProductName = cons.ProductName
WHERE corp.CustomerSegment = 'Corporate'
    AND cons.CustomerSegment = 'Consumer'
GROUP BY corp.ProductName, corp.ProductCategory
HAVING COUNT(corp.OrderID) >= 2 AND COUNT(cons.OrderID) >= 2
ORDER BY CorporateOrders + ConsumerOrders DESC
LIMIT 10;


#All Possible Customer-Product Combinations
SELECT 
    c.CustomerName,
    c.CustomerSegment,
    p.ProductCategory,
    COUNT(o.OrderID) AS TimesOrdered
FROM (
    SELECT DISTINCT CustomerName, CustomerSegment 
    FROM superstore
    LIMIT 5
) c
CROSS JOIN (
    SELECT DISTINCT ProductCategory 
    FROM superstore
    LIMIT 5
) p
LEFT JOIN superstore o ON c.CustomerName = o.CustomerName 
    AND p.ProductCategory = o.ProductCategory
GROUP BY c.CustomerName, c.CustomerSegment, p.ProductCategory
ORDER BY c.CustomerName, p.ProductCategory;

#Region-ShipMode Performance Matrix
SELECT 
    r.Region,
    s.ShipMode,
    COUNT(o.OrderID) AS TotalOrders,
    AVG(o.Sales) AS AvgSaleAmount,
    AVG(o.Profit) AS AvgProfit
FROM (
    SELECT DISTINCT Region FROM superstore
) r
CROSS JOIN (
    SELECT DISTINCT ShipMode FROM superstore
) s
LEFT JOIN superstore o ON r.Region = o.Region AND s.ShipMode = o.ShipMode
GROUP BY r.Region, s.ShipMode
HAVING COUNT(o.OrderID) >= 2
ORDER BY r.Region, TotalOrders DESC;

