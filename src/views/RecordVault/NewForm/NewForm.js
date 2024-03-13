import React, { useEffect, useState } from 'react'
import { Box, FormControl, FormLabel, Input, Button, VStack, Flex, Text, Heading, Select, useColorModeValue } from '@chakra-ui/react'
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase'

const NewForm = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loanAmount, setLoanAmount] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm();

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
        const selectedCustomerData = customers.find(
            (customer) => customer.id === customerId
        );
        setSelectedCustomer(selectedCustomerData);
    };

    const onSubmit = async () => {
        // e.preventDefault();

        try {
            const financeCollection = collection(firestore, 'finances');
            const newFinanceDoc = await addDoc(financeCollection, {
                customerId: selectedCustomer?.id || null,
                customerName: selectedCustomer?.name || 'N/A',
                loanAmount: parseFloat(loanAmount) || 0,
                timestamp: serverTimestamp(),
                // ... other relevant data
            });

            console.log('Finance information saved successfully:', newFinanceDoc.id);

            // Clear the form fields after submission
            setSelectedCustomer(null);
            setLoanAmount('');
        } catch (error) {
            console.error('Error saving finance information:', error.message);
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
                        <Heading as="h6" size="md">Finance Loan Form</Heading>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Select Customer</FormLabel>
                                <Select
                                    color={textColor}
                                    fontSize='sm'
                                    placeholder="Select"
                                    id="customer"
                                    value={selectedCustomer?.id || ''}
                                    {...register("customer",
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
                                {errors.customer && <Text color="red">{errors.customer.message}</Text>}
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Loan Amount</FormLabel>
                                <Input
                                    color={textColor}
                                    fontSize='sm'
                                    type="text"
                                    placeholder='Enter Loan Amount'
                                    id="loanamount"
                                    value={loanAmount}
                                    isInvalid={errors.loanamount}
                                    {...register("loanamount",
                                        {
                                            required: 'Loan amount is required',
                                        },
                                    )}
                                    onChange={(e) => setLoanAmount(e.target.value)}
                                />
                                {errors.loanamount && <Text color="red">{errors.loanamount.message}</Text>}
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

export default NewForm