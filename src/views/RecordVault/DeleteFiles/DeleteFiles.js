import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';
import { Box, Button, Flex, Heading, Table, Tbody, Td, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react';

const DeletedRecords = () => {
    const [deletedRecords, setDeletedRecords] = useState([]);

    useEffect(() => {
        const fetchDeletedRecords = async () => {
            try {
                const deletedRecordsCollectionRef = collection(firestore, 'deleted_records');
                const deletedRecordsSnapshot = await getDocs(deletedRecordsCollectionRef);
                const deletedRecordsData = deletedRecordsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setDeletedRecords(deletedRecordsData);
            } catch (error) {
                console.error('Error fetching deleted records:', error.message);
            }
        };

        fetchDeletedRecords();
    }, []);

    const handleDelete = async (recordId) => {
        try {
            const recordDocRef = doc(firestore, 'deleted_records', recordId);
            await deleteDoc(recordDocRef);
            setDeletedRecords(deletedRecords.filter(record => record.id !== recordId));
            console.log(`Record with ID: ${recordId} deleted successfully`);
        } catch (error) {
            console.error('Error deleting record:', error.message);
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
                px={{ base: "10px", md: "20px" }}
                borderRadius='30px'>
                <Box>
                    <Box textAlign="center" pb={'30px'}>
                        <Heading as="h6" size="md">Deleted Records</Heading>
                    </Box>
                    <Box overflow={'auto'}>
                        <Table variant="striped" colorScheme="teal">
                            <Thead>
                                <Tr>
                                    <Th color="gray.400">Customer Name</Th>
                                    <Th color="gray.400">Product Name</Th>
                                    <Th color="gray.400">Product Quantity</Th>
                                    <Th color="gray.400">Total</Th>
                                    <Th color="gray.400">Date</Th>
                                    <Th color="gray.400">Grand Total</Th>
                                    <Th color="gray.400">Delete Time</Th>
                                    <Th color="gray.400">Action</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {deletedRecords.map((record) => (
                                    <Tr key={record.id}>
                                        <Td className='fw-bold' fontSize={'sm'}>{record.purchaseData?.customerName || 'N/A'}</Td>
                                        <Td className='fw-bold' fontSize={'sm'}>{record.purchaseData?.products.map(product => product.productName).join(', ') || 'N/A'}</Td>
                                        <Td className='fw-bold' fontSize={'sm'}>{record.purchaseData?.products.reduce((total, product) => total + product.quantity, 0) || 'N/A'}</Td>
                                        <Td className='fw-bold' fontSize={'sm'}>{record.purchaseData?.products.reduce((total, product) => total + product.total, 0) || 'N/A'}</Td>
                                        <Td className='fw-bold' fontSize={'sm'}>{record.purchaseData?.timestamp?.toDate().toLocaleDateString() || 'N/A'}</Td>
                                        <Td className='fw-bold' fontSize={'sm'}>{record.purchaseData?.grandTotal.toFixed(2) || 'N/A'}</Td>
                                        <Td className='fw-bold' fontSize={'sm'}>{record.deletionTime?.toDate().toLocaleString() || 'N/A'}</Td>
                                        <Td className='fw-bold' fontSize={'sm'}>
                                            <Button onClick={() => handleDelete(record.id)}>Delete</Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
            </Flex>
        </Box>
    );
};

export default DeletedRecords;
