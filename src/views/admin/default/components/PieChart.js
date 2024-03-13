import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../../../firebase/firebase';
import Chart from "react-apexcharts";
import { useColorModeValue } from '@chakra-ui/system';

const AvailStock = () => {
  const [stockData, setStockData] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const productsCollection = collection(firestore, 'products');
        const unsubscribe = onSnapshot(productsCollection, async (querySnapshot) => {
          const promises = querySnapshot.docs.map(async (productDoc) => {
            const productId = productDoc.id;
            const productData = productDoc.data();
            const purchaseQuantity = await getTotalQuantity('purchases', productId);
            const saleQuantity = await getTotalQuantity('sales', productId);
            const availableQuantity = purchaseQuantity - saleQuantity;
            const saleRate = productData.saleRate || 0;
            return {
              productName: productData.itemName || productData.name || 'N/A',
              totalValue: availableQuantity * saleRate,
            };
          });
          const stockData = await Promise.all(promises);
          setStockData(stockData);

          // Calculate total value
          const totalValue = stockData.reduce((acc, curr) => acc + curr.totalValue, 0);
          setTotalValue(totalValue);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching stock data:', error.message);
      }
    };

    fetchStockData();
  }, []);

  const getTotalQuantity = async (collectionName, productId) => {
    try {
      const collectionRef = collection(firestore, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      let totalQuantity = 0;
      querySnapshot.forEach((doc) => {
        const productData = doc.data().products.find((p) => p.productId === productId);
        totalQuantity += productData ? productData.quantity : 0;
      });
      return totalQuantity;
    } catch (error) {
      console.error(`Error fetching total quantity for ${collectionName}:`, error.message);
      return 0;
    }
  };

  const textColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <div>
      <div className="container">
        <span>Total Value of Available Stocks: Rs.{totalValue.toFixed(2)}</span>
        <Chart
          options={{
            chart: {
              id: "basic-line"
            },
            xaxis: {
              categories: stockData.map(data => data.productName),
              labels: {
                style: {
                  colors: [textColor]
                }
              }
            },
            yaxis: {
              labels: {
                style: {
                  colors: [textColor]
                }
              }
            },
            tooltip: {
              theme: [textColor],
              y: {
                formatter: function(val) {
                  return "Rs." + val.toFixed(2)
                }
              }
            }
          }}
          series={[{
            name: 'Total Value',
            data: stockData.map(data => data.totalValue.toFixed(2))
          }]}
          type="line"
          width={450}
          height={300}
        />
      </div>
    </div>
  );
};

export default AvailStock;
