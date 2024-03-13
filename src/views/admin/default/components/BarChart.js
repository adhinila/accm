import React, { useState, useEffect } from 'react';
import Chart from "react-apexcharts";
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { firestore } from '../../../../firebase/firebase';
import { useColorModeValue } from '@chakra-ui/system';

const Stock = () => {
  const [dailyData, setDailyData] = useState([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");

  useEffect(() => {
    const fetchDailyData = async () => {
      const productsCollection = collection(firestore, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 28);

      const purchasesCollection = collection(firestore, 'purchases');
      const dailyPurchasesQuery = query(
        purchasesCollection,
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      );

      const dailyPurchasesSnapshot = await getDocs(dailyPurchasesQuery);
      const dailyData = [];

      for (let i = 0; i < 28; i++) {
        const currentDate = new Date(endDate);
        currentDate.setDate(currentDate.getDate() - i);
        const totalValue = calculateTotalValueForDay(dailyPurchasesSnapshot, productsData, currentDate);
        dailyData.push({ x: currentDate.getTime(), y: totalValue });
      }

      setDailyData(dailyData.reverse());
    };

    fetchDailyData();
  }, []);

  const calculateTotalValueForDay = (purchasesSnapshot, productsData, date) => {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    let totalValue = 0;

    purchasesSnapshot.forEach((purchaseDoc) => {
      const purchaseData = purchaseDoc.data();
      if (purchaseData.timestamp.toDate() >= startDate && purchaseData.timestamp.toDate() <= endDate) {
        purchaseData.products.forEach((product) => {
          const foundProduct = productsData.find((p) => p.id === product.productId);
          if (foundProduct) {
            const saleRate = parseFloat(foundProduct.saleRate) || 0;
            const quantity = parseFloat(product.quantity) || 0;
            totalValue += saleRate * quantity;
          }
        });
      }
    });

    return totalValue;
  };

  const chartData = [{
    name: 'Daily Stocks',
    data: dailyData
  }];

  const options = {
  chart: {
    type: 'area',
    height: 350,
    width: '100%',
    toolbar: {
      show: false
    }
  },
  xaxis: {
    type: 'datetime',
    title: {
      // text: 'Total Value',
      style: {
        color: [textColor] 
      }
    },
    labels: {
      style: {
        colors: [textColor] 
      }
    }
  },
  yaxis: {
    title: {
      text: 'Total Value',
      style: {
        color: [textColor]
      }
    },
    labels: {
      style: {
        colors: [textColor] // Customize y-axis labels color
      }
    }
  },
  tooltip: {
    theme: [textColor] // Customize tooltip theme
  },
  legend: {
    labels: {
      colors: [textColor] // Customize legend text color
    }
  },
  colors: ['#4287f5'], // Customize series color
  style: {
    fontFamily: 'Arial, sans-serif', // Customize font family
  }
};


  return (
    <>
      <Chart options={options} series={chartData} type="area" height={250} />
    </>
  );
};

export default Stock;
