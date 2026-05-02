#Seasonal Analysis by Quarter
SELECT 
    CASE 
        WHEN MONTH(OrderDate) IN (12, 1, 2) THEN 'Winter'
        WHEN MONTH(OrderDate) IN (3, 4, 5) THEN 'Spring'
        WHEN MONTH(OrderDate) IN (6, 7, 8) THEN 'Summer'
        WHEN MONTH(OrderDate) IN (9, 10, 11) THEN 'Fall'
    END AS Season,
    COUNT(*) AS Total_Orders,
    SUM(Sales) AS Total_Sales,
    AVG(Sales) AS Avg_Sale_Amount,
    SUM(Profit) AS Total_Profit,
    AVG(Profit) AS Avg_Profit
FROM SuperStore
GROUP BY 
    CASE 
        WHEN MONTH(OrderDate) IN (12, 1, 2) THEN 'Winter'
        WHEN MONTH(OrderDate) IN (3, 4, 5) THEN 'Spring'
        WHEN MONTH(OrderDate) IN (6, 7, 8) THEN 'Summer'
        WHEN MONTH(OrderDate) IN (9, 10, 11) THEN 'Fall'
    END
ORDER BY Total_Sales DESC;

#Seasonal Analysis with Month Details
SELECT 
    CASE 
        WHEN MONTH(OrderDate) IN (12, 1, 2) THEN 'Winter'
        WHEN MONTH(OrderDate) IN (3, 4, 5) THEN 'Spring'
        WHEN MONTH(OrderDate) IN (6, 7, 8) THEN 'Summer'
        WHEN MONTH(OrderDate) IN (9, 10, 11) THEN 'Fall'
    END AS Season,
    MONTHNAME(OrderDate) AS Month_Name,
    COUNT(*) AS Total_Orders,
    SUM(Sales) AS Total_Sales,
    SUM(Profit) AS Total_Profit,
    ROUND(SUM(Profit)/SUM(Sales)*100, 2) AS Profit_Margin_Percent
FROM SuperStore
GROUP BY 
    CASE 
        WHEN MONTH(OrderDate) IN (12, 1, 2) THEN 'Winter'
        WHEN MONTH(OrderDate) IN (3, 4, 5) THEN 'Spring'
        WHEN MONTH(OrderDate) IN (6, 7, 8) THEN 'Summer'
        WHEN MONTH(OrderDate) IN (9, 10, 11) THEN 'Fall'
    END,
    MONTHNAME(OrderDate),
    MONTH(OrderDate)
ORDER BY Season, MONTH(OrderDate);

#Seasonal Analysis by Product Category
SELECT 
    ProductCategory,
    CASE 
        WHEN MONTH(OrderDate) IN (12, 1, 2) THEN 'Winter'
        WHEN MONTH(OrderDate) IN (3, 4, 5) THEN 'Spring'
        WHEN MONTH(OrderDate) IN (6, 7, 8) THEN 'Summer'
        WHEN MONTH(OrderDate) IN (9, 10, 11) THEN 'Fall'
    END AS Season,
    COUNT(*) AS Total_Orders,
    SUM(Sales) AS Total_Sales,
    SUM(Profit) AS Total_Profit,
    SUM(Quantityorderednew) AS Total_Units_Sold
FROM SuperStore
GROUP BY ProductCategory,
    CASE 
        WHEN MONTH(OrderDate) IN (12, 1, 2) THEN 'Winter'
        WHEN MONTH(OrderDate) IN (3, 4, 5) THEN 'Spring'
        WHEN MONTH(OrderDate) IN (6, 7, 8) THEN 'Summer'
        WHEN MONTH(OrderDate) IN (9, 10, 11) THEN 'Fall'
    END
ORDER BY ProductCategory, Total_Sales DESC;

# Identify Orders with Negative Profit and Their Characteristics
SELECT 
    OrderID,
    CustomerName,
    CustomerSegment,
    ProductCategory,
    ProductSubCategory,
    ProductName,
    Quantityorderednew,
    Sales,
    Profit,
    Discount,
    ShippingCost,
    CASE 
        WHEN Profit < 0 THEN 'Loss'
        ELSE 'Profit'
    END AS ProfitStatus,
    CASE 
        WHEN Discount > 0.05 THEN 'High Discount'
        WHEN Discount > 0.02 THEN 'Medium Discount'
        ELSE 'Low/No Discount'
    END AS DiscountLevel
FROM superstore
WHERE Profit < 0
ORDER BY Profit ASC
LIMIT 15;

#Shipping Mode Analysis with Cost Efficiency
SELECT 
    ShipMode,
    COUNT(*) AS TotalShipments,
    ROUND(AVG(DATEDIFF(ShipDate, OrderDate)), 2) AS AvgDeliveryDays,
    ROUND(SUM(ShippingCost), 2) AS TotalShippingCost,
    ROUND(AVG(ShippingCost), 2) AS AvgShippingCostPerOrder,
    ROUND(SUM(Sales), 2) AS TotalSales,
    ROUND(SUM(Profit), 2) AS TotalProfit,
    ROUND(SUM(ShippingCost) / SUM(Sales) * 100, 2) AS ShippingCostToSalesRatio
FROM superstore
GROUP BY ShipMode
ORDER BY TotalShipments DESC;

# Product Performance Analysis
SELECT 
    ProductCategory,
    ProductSubCategory,
    ProductName,
    COUNT(*) AS TimesOrdered,
    SUM(Quantityorderednew) AS TotalUnitsSold,
    ROUND(SUM(Sales), 2) AS TotalRevenue,
    ROUND(SUM(Profit), 2) AS TotalProfit,
    ROUND(AVG(Discount) * 100, 2) AS AvgDiscountPercentage,
    ROUND(SUM(Profit) / SUM(Quantityorderednew), 2) AS ProfitPerUnit,
    CASE 
        WHEN SUM(Profit) > 0 THEN 'Profitable'
        ELSE 'Loss-Making'
    END AS ProfitabilityStatus
FROM superstore
GROUP BY ProductCategory, ProductSubCategory, ProductName
ORDER BY TotalProfit DESC
LIMIT 15;

 #Discount Effectiveness Analysis
 SELECT 
    CASE 
        WHEN Discount = 0 THEN 'No Discount'
        WHEN Discount <= 0.05 THEN 'Low Discount (1-5%)'
        WHEN Discount <= 0.10 THEN 'Medium Discount (6-10%)'
        ELSE 'High Discount (>10%)'
    END AS DiscountTier,
    COUNT(*) AS TotalOrders,
    ROUND(AVG(Discount) * 100, 2) AS AvgDiscountPercentage,
    ROUND(SUM(Sales), 2) AS TotalSales,
    ROUND(SUM(Profit), 2) AS TotalProfit,
    ROUND(AVG(Sales), 2) AS AvgOrderValue,
    ROUND(AVG(Quantityorderednew), 2) AS AvgQuantityPerOrder,
    ROUND(SUM(Profit) / SUM(Sales) * 100, 2) AS ProfitMarginPercentage,
    ROUND(SUM(CASE WHEN Profit < 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS LossOrderPercentage
FROM superstore
GROUP BY DiscountTier
ORDER BY CASE DiscountTier
    WHEN 'No Discount' THEN 1
    WHEN 'Low Discount (1-5%)' THEN 2
    WHEN 'Medium Discount (6-10%)' THEN 3
    ELSE 4
END;

