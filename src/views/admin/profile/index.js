import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';
import { Box, Button, Select, Table, Tbody, Td, Th, Thead, Tr, Input, Flex, Heading, FormControl, FormLabel, useColorModeValue } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const SoldStocks = () => {
  const [purchases, setPurchases] = useState([]);
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [dealerNames, setDealerNames] = useState([]);

  useEffect(() => {
    const fetchDealerNames = async () => {
      try {
        const dealersCollectionRef = collection(firestore, 'dealers');
        const dealersSnapshot = await getDocs(dealersCollectionRef);
        const dealerNamesArray = dealersSnapshot.docs.map(doc => doc.data().name);
        setDealerNames(dealerNamesArray);
      } catch (error) {
        console.error('Error fetching dealer names:', error.message);
      }
    };

    fetchDealerNames();
  }, []);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        let purchasesCollectionRef = collection(firestore, 'sales');

        if (customerFilter !== '' && dateFilter !== '') {
          const selectedDate = new Date(dateFilter);
          const nextDate = new Date(selectedDate);
          nextDate.setDate(selectedDate.getDate() + 1);

          purchasesCollectionRef = query(
            purchasesCollectionRef,
            where('dealerName', '==', customerFilter),
            where('timestamp', '>=', selectedDate),
            where('timestamp', '<', nextDate),
            orderBy('timestamp', 'desc')
          );
        } else if (customerFilter !== '') {
          purchasesCollectionRef = query(
            purchasesCollectionRef,
            where('dealerName', '==', customerFilter),
            orderBy('timestamp', 'desc')
          );
        } else if (dateFilter !== '') {
          const selectedDate = new Date(dateFilter);
          const nextDate = new Date(selectedDate);
          nextDate.setDate(selectedDate.getDate() + 1);

          purchasesCollectionRef = query(
            purchasesCollectionRef,
            where('timestamp', '>=', selectedDate),
            where('timestamp', '<', nextDate),
            orderBy('timestamp', 'desc')
          );
        } else {
          purchasesCollectionRef = query(
            purchasesCollectionRef,
            orderBy('timestamp', 'desc')
          );
        }

        const purchasesSnapshot = await getDocs(purchasesCollectionRef);
        const purchasesData = purchasesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPurchases(purchasesData);
      } catch (error) {
        console.error('Error fetching purchases:', error.message);
      }
    };

    fetchPurchases();
  }, [customerFilter, dateFilter]);

  const handleDelete = useCallback(async purchaseId => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this purchase?');

      if (!confirmDelete) {
        return;
      }

      const purchaseDocRef = doc(firestore, 'sales', purchaseId);
      await deleteDoc(purchaseDocRef);
      console.log(`Purchase with ID: ${purchaseId} deleted successfully`);

      // Update the UI by filtering out the deleted purchase
      setPurchases(prevPurchases => prevPurchases.filter(purchase => purchase.id !== purchaseId));
    } catch (error) {
      console.error('Error deleting purchase:', error.message);
    }
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
        px={{ base: "10px", md: "20px" }}
        borderRadius='30px'>
        <div>
          <Box textAlign="center" pb={'30px'}>
            <Heading as="h6" size="md">Sale History</Heading>
          </Box>
          <div className='row'>
            <div className='col-md-6'>
              <FormControl className={'mb-4'}>
                <FormLabel fontSize='sm' fontWeight='700'>
                  Filter by Dealer Name
                </FormLabel>
                <Select
                  fontSize='sm'
                  value={customerFilter}
                  onChange={e => setCustomerFilter(e.target.value)}
                >
                  <option value="">All Dealer</option>
                  {dealerNames.map((dealerName, index) => (
                    <option key={index} value={dealerName}>
                      {dealerName}
                    </option>
                  ))}
                </Select>

              </FormControl>
            </div>
            <div className='col-md-6'>
              <FormControl className={'mb-4'}>
                <FormLabel fontSize='sm' fontWeight='700'>
                  Filter by Date
                </FormLabel>
                <Input
                  fontSize='sm'
                  type="date"
                  color={{ base: 'white', md: 'unset' }}
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                />

              </FormControl>
            </div>
          </div>
          <Box overflow={'auto'}>
            <Table variant="striped" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th color="gray.400">Dealer Name</Th>
                  <Th color="gray.400">Product</Th>
                  <Th color="gray.400">Quantity</Th>
                  <Th color="gray.400">Total</Th>
                  <Th color="gray.400">Timestamp</Th>
                  <Th color="gray.400">Grand Total</Th>
                  <Th color="gray.400">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {purchases.map((purchase, purchaseIndex) => (
                  purchase.products.map((product, productIndex) => (
                    <Tr
                      key={`${purchase.id}-${productIndex}`}
                    // bgColor={purchaseIndex % 2 === 0 ? '#ccf7c3' : '#ffffff'}
                    >
                      {productIndex === 0 && (
                        <Td className='fw-bold' fontSize={'sm'} rowSpan={purchase.products.length}>{purchase.dealerName}</Td>
                      )}
                      <Td className='fw-bold' fontSize={'sm'}>{product.productName}</Td>
                      <Td className='fw-bold' fontSize={'sm'}>{product.quantity}</Td>
                      <Td className='fw-bold' fontSize={'sm'}>{product.total}</Td>
                      {productIndex === 0 && (
                        <>
                          <Td className='fw-bold' fontSize={'sm'}>{purchase.timestamp.toDate().toLocaleString()}</Td>
                          <Td className='fw-bold' fontSize={'sm'}>{purchase.grandTotal.toFixed(2)}</Td>
                          <Td className='fw-bold' fontSize={'sm'}>
                            <Button size={'sm'} color={'red'} onClick={() => handleDelete(purchase.id)}><DeleteIcon /></Button>
                          </Td>
                        </>
                      )}
                    </Tr>
                  ))
                ))}
              </Tbody>
            </Table>
          </Box>
        </div>
      </Flex>
    </Box>
  );
};

export default SoldStocks;
