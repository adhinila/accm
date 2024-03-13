import React, { useEffect, useState } from 'react'
import { Box, FormControl, FormLabel, Input, Button, VStack, Flex, Text, Heading, Select, useColorModeValue } from '@chakra-ui/react'
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase'

const Due = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [dueAmount, setDueAmount] = useState('');
    const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange" });

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const customersCollection = collection(firestore, 'customers');
                const customersSnapshot = await getDocs(customersCollection);
                const customersData = customersSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCustomers(customersData);
            } catch (error) {
                console.error('Error fetching customers:', error.message);
            }
        };

        fetchCustomers();
    }, []);

    const handleCustomerChange = (customerId) => {
        const selectedCustomerData = customers.find((customer) => customer.id === customerId);
        setSelectedCustomer(selectedCustomerData);
    };

    const onSubmit = async (e) => {
        // e.preventDefault();

        try {
            const dueCollection = collection(firestore, 'duecollection');

            // Check if there are existing due entries for the selected customer
            const existingDueEntries = await getDocs(
                collection(dueCollection, 'duecollection', selectedCustomer?.id)
            );

            // Check if there is a due entry for today
            const today = new Date().toDateString();
            const hasDueForToday = existingDueEntries.docs.some(
                (doc) => doc.data().timestamp.toDate().toDateString() === today
            );

            // If there is no due entry for today, update the dueAmount
            if (!hasDueForToday) {
                const newDueDoc = await addDoc(dueCollection, {
                    customerId: selectedCustomer?.id || null,
                    customerName: selectedCustomer?.name || 'N/A',
                    dueAmount: parseFloat(dueAmount) || 0,
                    timestamp: serverTimestamp(),
                    // ... other relevant data for the duecollection
                });

                console.log('Due information saved successfully:', newDueDoc.id);
            } else {
                console.log('Due information not updated on the same day.');
            }
        } catch (error) {
            console.error('Error saving due information:', error.message);
        }
    };

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
                        <Heading as="h6" size="md">Due Collection Form</Heading>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Select Customer</FormLabel>
                                <Select
                                    color={textColor}
                                    fontSize='sm'
                                    placeholder="Select"
                                    id="customers"
                                    value={selectedCustomer?.id || ''}
                                    {...register("customers",
                                        { required: 'Customer is required' }
                                    )}
                                    onChange={(e) => handleCustomerChange(e.target.value)}
                                >
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </Select>
                                {errors.customers && <Text color="red">{errors.customers.message}</Text>}
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Due Amount</FormLabel>
                                <Input
                                    color={textColor}
                                    fontSize='sm'
                                    type="number"
                                    placeholder='Enter Due Amount'
                                    id="dueAmount"
                                    value={dueAmount}
                                    isInvalid={errors.dueAmount}
                                    {...register("dueAmount",
                                        {
                                            required: 'Due Amount is required',
                                        },
                                    )}
                                    onChange={(e) => setDueAmount(e.target.value)}
                                />
                                {errors.dueAmount && <Text color="red">{errors.dueAmount.message}</Text>}
                            </FormControl>

                            <div>
                                <Button type='submit' colorScheme="blue" size="sm">Submit</Button>
                            </div>
                        </VStack>
                    </form>
                </Flex>
            </Box>
        </>
    )
}

export default Due