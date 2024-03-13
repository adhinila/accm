import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';
import { Box, Flex, Heading, Table, Tbody, Td, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react'; // Import Chakra UI components

const AvailStock = () => {
  const [stockData, setStockData] = useState([]);

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
              productId,
              productName: productData.itemName || productData.name || 'N/A',
              availableQuantity,
              saleRate,
            };
          });
          const stockData = await Promise.all(promises);
          setStockData(stockData);
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
            <Heading as="h6" size="md">Available Stocks</Heading>
          </Box>
          <Table variant="simple"> {/* Use Chakra UI Table */}
            <Thead>
              <Tr>
                <Th color="gray.400">Product</Th>
                <Th color="gray.400">A.quantity</Th>
                <Th color="gray.400">Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stockData.map((product) => (
                <Tr key={product.productId}>
                  <Td className='fw-bold' fontSize={'sm'}>{product.productName}</Td>
                  <Td className='fw-bold' fontSize={'sm'}>{product.availableQuantity.toFixed(1)}</Td>
                  <Td className='fw-bold' fontSize={'sm'}>{(product.availableQuantity * product.saleRate).toFixed(1)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </Flex>
    </Box>
  );
};

export default AvailStock;
