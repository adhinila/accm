// Chakra imports
// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Text,
  Icon,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
// Custom icons
import React, { useState, useEffect } from "react";

import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { firestore } from '../../../../firebase/firebase';
// import './style.css';
import TotalProductValue from './Ratio/PurchaseValue';
import TotalSoldProductValue from './Ratio/SaleValue';
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";

export default function Default(props) {
  const { startContent, endContent, name, growth, value } = props;
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";


  // Ratio
  const [dailyData, setDailyData] = useState([]);
  const [yesterdayTotal, setYesterdayTotal] = useState(null);

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
        dailyData.push({ date: currentDate, totalValue });
      }

      setDailyData(dailyData.reverse());

      // Calculate yesterday's total value
      let yesterdayTotalValue = dailyData[dailyData.length - 2]?.totalValue || 0;
      if (yesterdayTotalValue === 0) {
        // If yesterday's total is zero, find the last non-zero value
        for (let i = dailyData.length - 3; i >= 0; i--) {
          if (dailyData[i].totalValue !== 0) {
            yesterdayTotalValue = dailyData[i].totalValue;
            break;
          }
        }
      }
      setYesterdayTotal(yesterdayTotalValue);
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



  const calculatePercentageChange = () => {
    if (yesterdayTotal !== null) {
      const currentTotal = dailyData[dailyData.length - 1]?.totalValue || 0;
      const percentageChange = ((currentTotal - yesterdayTotal) / yesterdayTotal) * 100;
      return percentageChange;
    }
    return 0;
  };

  const percentageChange = calculatePercentageChange();

  return (
    <>
      <Card py='20px'>
        <Flex
          my='auto'
          h='100%'
          align={{ base: "center", xl: "start" }}
          justify={{ base: "center", xl: "center" }}>
          {/* {startContent} */}

          <Stat my='auto' ms={startContent ? "18px" : "0px"}>
            <StatLabel
              lineHeight='100%'
              color={textColorSecondary}
              fontSize={{
                base: "sm",
              }}>
              Ratio
            </StatLabel>
            <StatNumber
              color={textColor}
              fontSize={{
                base: "lg",
                sm: "sm",
              }}>

              <div>
                {yesterdayTotal !== null && (
                  <div className="comparison-container">
                    <div className="comparison">
                      {percentageChange < 0 ? (
                        <span className="down-arrow"><Icon as={RiArrowDownSFill} color='red.500' />{`${percentageChange.toFixed(2)}%`}</span>
                      ) : (
                        <span className="up-arrow"><Icon as={RiArrowUpSFill} color='green.500' />{`${percentageChange.toFixed(2)}%`}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </StatNumber>
          </Stat>
          <Stat my='auto' ms={startContent ? "18px" : "0px"}>
            <StatLabel
              lineHeight='100%'
              color={textColorSecondary}
              fontSize={{
                base: "sm",
              }}>
              Today
            </StatLabel>
            <StatNumber
              color={textColor}
              fontSize={{
                base: "lg",
                sm: "sm",
              }}>

              <div>
                {yesterdayTotal !== null && (
                  <div className="comparison-container">
                    <div className="comparison">
                      <span>{`Rs.${(dailyData[dailyData.length - 1]?.totalValue || 0).toFixed(2)}`}</span>
                    </div>
                  </div>
                )}
              </div>

            </StatNumber>
          </Stat>
          <Stat my='auto' ms={startContent ? "18px" : "0px"}>
            <StatLabel
              lineHeight='100%'
              color={textColorSecondary}
              fontSize={{
                base: "sm",
              }}>
              Yesterday
            </StatLabel>
            <StatNumber
              color={textColor}
              fontSize={{
                base: "lg",
                sm: "sm",
              }}>

              <div>
                {yesterdayTotal !== null && (
                  <div className="comparison-container">
                    <div className="comparison">
                      <span>{`Rs.${yesterdayTotal.toFixed(0)}`}</span>
                    </div>
                  </div>
                )}
              </div>

            </StatNumber>
          </Stat>
        </Flex>
      </Card>

      <Card py='15px'>
        <Flex
          my='auto'
          h='100%'
          align={{ base: "center", xl: "start" }}
          justify={{ base: "center", xl: "center" }}>

          <Stat my='auto' ms={startContent ? "18px" : "0px"}>
            <StatLabel
              lineHeight='100%'
              color={textColorSecondary}
              fontSize={{
                base: "sm",
              }}>
              Purchase Value
            </StatLabel>
            <StatNumber
              color={textColor}
              fontSize={{
                base: "lg",
                sm: "sm",
              }}>
              <div>
                {yesterdayTotal !== null && (
                  <div className="comparison-container">
                    <div className="comparison">
                      <TotalProductValue />
                    </div>
                  </div>
                )}
              </div>
            </StatNumber>
          </Stat>
          <Stat my='auto' ms={startContent ? "18px" : "0px"}>
            <StatLabel
              lineHeight='100%'
              color={textColorSecondary}
              fontSize={{
                base: "sm",
              }}>
              Sales Value
            </StatLabel>
            <StatNumber
              color={textColor}
              fontSize={{
                base: "lg",
                sm: "sm",
              }}>
              <div>
                {yesterdayTotal !== null && (
                  <div className="comparison-container">
                    <div className="comparison">
                      <TotalSoldProductValue />
                    </div>
                  </div>
                )}
              </div>
            </StatNumber>
          </Stat>
        </Flex>
      </Card>
    </>
  );
}
