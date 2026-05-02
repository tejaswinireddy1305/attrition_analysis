#Customers whose name starts with ‘A’

SELECT DISTINCT customername
FROM superstore
WHERE customername LIKE 'a%';

#product sub-categories containing 'chair' 
select distinct productsubcategory from 
superstore where productsubcategory like '%chair%';

