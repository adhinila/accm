import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Flex,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { auth, firestore } from '../../../firebase/firebase';

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [todayStock, setTodayStock] = useState([]);

  useEffect(() => {
    const fetchStock = async () => {
      // Fetch products with saleRate from the products collection
      const productsCollection = collection(firestore, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        totalQuantity: 0,
        totalValue: 0,
      }));

      // Fetch today's purchases
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const purchasesCollection = collection(firestore, 'purchases');
      const todayPurchasesQuery = query(
        purchasesCollection,
        where('timestamp', '>=', Timestamp.fromDate(today)),
        where(
          'timestamp',
          '<',
          Timestamp.fromDate(new Date(today.getTime() + 86400000))
        )
      );
      const purchasesSnapshot = await getDocs(todayPurchasesQuery);

      // Calculate today's stock for each product
      const todayStockData = productsData.map((product) => {
        const productTodayStock = {
          id: product.id,
          itemName: product.itemName || product.name,
          totalQuantity: 0,
          totalValue: 0,
        };

        purchasesSnapshot.forEach((purchaseDoc) => {
          const purchaseData = purchaseDoc.data();
          const productInPurchase = purchaseData.products.find(
            (p) => p.productId === product.id
          );

          if (productInPurchase) {
            const quantity = parseFloat(productInPurchase.quantity) || 0;
            const saleRate = parseFloat(product.saleRate) || 0;

            productTodayStock.totalQuantity += quantity;
            productTodayStock.totalValue += quantity * saleRate;
          }
        });

        return productTodayStock;
      });

      // Update the state with the fetched data
      setTodayStock(todayStockData);
      setProducts(productsData);
    };

    fetchStock();
  }, []);

  const boxBg = useColorModeValue("white", "whiteAlpha.100");

  return (
    <Box pt={{ base: "10px", md: "80px", xl: "80px" }}>
      <Flex
        direction='column'
        bgColor={boxBg}
        bgSize='cover'
        mb={'50px'}
        py={{ base: "30px", md: "56px" }}
        // px={{ base: "30px", md: "20px" }}
        borderRadius='30px'>
        <div>
          <Box textAlign="center" pb={'30px'}>
            <Heading as="h6" size="md">Today's Stocks</Heading>
          </Box>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th color="gray.400">Product</Th>
                <Th color="gray.400">Quantity</Th>
                <Th color="gray.400">Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {todayStock.map((product) => (
                <Tr key={product.id}>
                  <Td className='fw-bold' fontSize={'sm'}>{product.itemName}</Td>
                  <Td className='fw-bold' fontSize={'sm'}>{product.totalQuantity.toFixed(1)}</Td>
                  <Td className='fw-bold' fontSize={'sm'}>{product.totalValue.toFixed(1)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </Flex>
    </Box>
  );
};

export default Stock;
