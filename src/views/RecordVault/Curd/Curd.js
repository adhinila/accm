import React, { useEffect, useState } from 'react';
import {
    Box, FormLabel, Input, Button, VStack, Flex, Heading, Select, HStack,
    Table, Tbody, Td, Th, Thead, Tr, useColorModeValue
} from '@chakra-ui/react';
import { collection, getDocs, query, where, deleteDoc, doc, getDoc, addDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';
import Card from 'components/card/Card';
import { MdDelete } from 'react-icons/md';

const Curd = () => {
    const [purchases, setPurchases] = useState([]);
    const [customerFilter, setCustomerFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [customerNames, setCustomerNames] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        const fetchCustomerNames = async () => {
            try {
                const customersCollectionRef = collection(firestore, 'customers');
                const customersSnapshot = await getDocs(customersCollectionRef);
                const customerNamesArray = customersSnapshot.docs.map((doc) => doc.data().name);
                setCustomerNames(customerNamesArray);
            } catch (error) {
                console.error('Error fetching customer names:', error.message);
            }
        };

        fetchCustomerNames();
    }, []);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                let purchasesCollectionRef = collection(firestore, 'purchases');

                // Apply both customer name and timestamp (date) filters
                if (customerFilter !== '' && dateFilter !== '') {
                    const selectedDate = new Date(dateFilter);
                    const nextDate = new Date(selectedDate);
                    nextDate.setDate(selectedDate.getDate() + 1);

                    purchasesCollectionRef = query(
                        purchasesCollectionRef,
                        where('customerName', '==', customerFilter),
                        where('timestamp', '>=', selectedDate),
                        where('timestamp', '<', nextDate),
                        orderBy('timestamp', 'desc') // Order by timestamp descending
                    );
                } else if (customerFilter !== '') {
                    // Apply only customer name filter
                    purchasesCollectionRef = query(
                        purchasesCollectionRef,
                        where('customerName', '==', customerFilter),
                        orderBy('timestamp', 'desc') // Order by timestamp descending
                    );
                } else if (dateFilter !== '') {
                    // Apply only timestamp (date) filter
                    const selectedDate = new Date(dateFilter);
                    const nextDate = new Date(selectedDate);
                    nextDate.setDate(selectedDate.getDate() + 1);

                    purchasesCollectionRef = query(
                        purchasesCollectionRef,
                        where('timestamp', '>=', selectedDate),
                        where('timestamp', '<', nextDate),
                        orderBy('timestamp', 'desc') // Order by timestamp descending
                    );
                } else {
                    // If no filters are applied, simply order by timestamp descending
                    purchasesCollectionRef = query(
                        purchasesCollectionRef,
                        orderBy('timestamp', 'desc') // Order by timestamp descending
                    );
                }

                const unsubscribe = onSnapshot(purchasesCollectionRef, (querySnapshot) => {
                    const purchasesData = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setPurchases(purchasesData);
                });

                // Clean up the listener when component unmounts
                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching purchases:', error.message);
            }
        };

        fetchPurchases();
    }, [customerFilter, dateFilter]);

    const handleDelete = async (purchaseId) => {
        try {
            // Display a confirmation dialog
            const confirmDelete = window.confirm('Are you sure you want to delete this purchase?');

            if (!confirmDelete) {
                return; // User canceled the delete operation
            }

            // Fetch the purchase document before deleting
            const purchaseDocRef = doc(firestore, 'purchases', purchaseId);
            const purchaseDocSnapshot = await getDoc(purchaseDocRef);

            // Create a reference to the "deleted records" collection
            const deletedRecordsCollectionRef = collection(firestore, 'deleted_records');

            // Add the deleted purchase record to the "deleted records" collection
            await addDoc(deletedRecordsCollectionRef, {
                purchaseId: purchaseDocSnapshot.id,
                purchaseData: purchaseDocSnapshot.data(),
                deletionTime: new Date(),
            });

            // Delete the purchase record from the original collection
            await deleteDoc(purchaseDocRef);
            console.log(`Purchase with ID: ${purchaseId} deleted successfully`);
        } catch (error) {
            console.error('Error deleting purchase:', error.message);
        }
    };

    // const textColor = useColorModeValue("secondaryGray.900", "white");
    // const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    const boxBg = useColorModeValue("white", "whiteAlpha.100");
    const textColor = useColorModeValue("secondaryGray.900", "white");

    return (
        <>
            <Box pt={{ base: "10px", md: "80px", xl: "80px" }}>
                <Flex
                    direction='column'
                    bgColor={boxBg}
                    bgSize='cover'
                    py={{ base: "30px", md: "56px" }}
                    px={{ base: "10px", md: "20px" }}
                    borderRadius='30px'>

                    <Box textAlign="center" pb={'30px'}>
                        <Heading as="h6" size="md">Purchase History</Heading>
                    </Box>

                    <Box
                        direction='column'
                        w='100%'
                        px='0px'
                        overflowX={{ sm: "scroll", lg: "scroll" }}>

                            <VStack spacing={4} align="stretch">
                                <div className='row'>
                                    <div className='col-md-6 mb-4'>
                                        <FormLabel fontSize='sm' fontWeight='700'>Filter by Customer</FormLabel>
                                        <Select
                                        color={textColor}
                                            fontSize='sm'
                                            value={customerFilter}
                                            onChange={(e) => setCustomerFilter(e.target.value)}
                                        >
                                            <option value="">All Customers</option>
                                            {customerNames.map((customerName, index) => (
                                                <option key={index} value={customerName}>
                                                    {customerName}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className='col-md-6 mb-4'>
                                        <FormLabel fontSize='sm' fontWeight='700'>Filter by Date</FormLabel>
                                        <Input
                                        color={textColor}
                                            fontSize='sm'
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </VStack>

                            <Box pt={'10px'} overflow='auto'>
                                <Table variant='striped' mb='24px'>
                                    <Thead>
                                        <Tr>
                                            <Th pe='10px' color='gray.400' >Customer Name</Th>
                                            <Th pe='10px' color='gray.400' >Product</Th>
                                            <Th pe='10px' color='gray.400' >Quantity</Th>
                                            <Th pe='10px' color='gray.400' >Total</Th>
                                            <Th pe='10px' color='gray.400' >Date</Th>
                                            <Th pe='10px' color='gray.400' >Grand Total</Th>
                                            <Th pe='10px' color='gray.400' >Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {purchases.map((purchase, purchaseIndex) => (
                                            purchase.products.map((product, productIndex) => (
                                                <Tr
                                                    key={`${purchase.id}-${productIndex}`}
                                                    // style={{ backgroundColor: (purchaseIndex % 2 === 0) ? '#f2f2f2' : '#ffffff' }}
                                                    onClick={() => setExpandedRow(purchaseIndex === expandedRow ? null : purchaseIndex)}
                                                >
                                                    {productIndex === 0 && (
                                                        <Td rowSpan={purchase.products.length}>{purchase.customerName}</Td>
                                                    )}
                                                    <Td className='fw-bold' fontSize={'sm'}>{product.productName}</Td>
                                                    <Td className='fw-bold' fontSize={'sm'}>{product.quantity}</Td>
                                                    <Td className='fw-bold' fontSize={'sm'}>{product.total.toFixed(2)}</Td>
                                                    {productIndex === 0 && (
                                                        <>
                                                            <Td className='fw-bold' fontSize={'sm'} rowSpan={purchase.products.length}>
                                                                {purchase.timestamp.toDate().toLocaleDateString()}
                                                            </Td>
                                                            <Td className='fw-bold' fontSize={'sm'} rowSpan={purchase.products.length}>{purchase.grandTotal.toFixed(2)}</Td>
                                                            <Td className='fw-bold' fontSize={'sm'} rowSpan={purchase.products.length}>
                                                                <Button onClick={() => handleDelete(purchase.id)}><MdDelete color='red' size={20} /></Button>
                                                            </Td>
                                                        </>
                                                    )}
                                                </Tr>
                                            ))
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                    </Box>
                </Flex>
            </Box>
        </>
    );
};

export default Curd;
