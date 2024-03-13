import React, { useState, useEffect } from 'react'
import {
    Box,
    FormControl,
    FormLabel,
    VStack,
    Flex,
    Text,
    Heading,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useColorModeValue,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase'

const Report = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [financeData, setFinanceData] = useState(null);
    const [dueData, setDueData] = useState(null);
    const [loanHistory, setLoanHistory] = useState([]);
    const [selectedView, setSelectedView] = useState('currentStatement');
    const { register, formState: { errors } } = useForm({ mode: "onChange" });

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

    const handleCustomerChange = async (customerId) => {
        const selectedCustomerData = customers.find(
            (customer) => customer.id === customerId
        );
        setSelectedCustomer(selectedCustomerData);

        if (selectedCustomerData) {
            try {
                // Fetch existing finance information
                const financeQuery = query(
                    collection(firestore, 'finances'),
                    where('customerId', '==', selectedCustomerData.id)
                );
                const financeSnapshot = await getDocs(financeQuery);
                const financeData = financeSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Fetch loan history
                const loanHistoryQuery = query(
                    collection(firestore, 'finances'),
                    where('customerId', '==', selectedCustomerData.id)
                );
                const loanHistorySnapshot = await getDocs(loanHistoryQuery);
                const loanHistoryData = loanHistorySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setLoanHistory(loanHistoryData);

                // Calculate the total loan amount (including previous loans)
                const totalLoanAmount = financeData.reduce(
                    (total, entry) => total + parseFloat(entry.loanAmount),
                    0
                );

                // Set the total loan amount in the state
                setFinanceData([{ loanAmount: totalLoanAmount }]);

                // Fetch due information
                const dueQuery = query(
                    collection(firestore, 'duecollection'),
                    where('customerId', '==', selectedCustomerData.id)
                );
                const dueSnapshot = await getDocs(dueQuery);
                const dueData = dueSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setDueData(dueData);
            } catch (error) {
                console.error('Error fetching data:', error.message);
                setFinanceData([]); // Set an empty array to avoid rendering issues
                setDueData([]); // Set an empty array for due information
                setLoanHistory([]); // Set an empty array for loan history
            }
        }
    };

    const calculateTotalBalance = () => {
        // Calculate total balance including existing loan and due amounts
        const existingLoan = parseFloat(financeData[0]?.loanAmount) || 0;
        const totalPaidAmount = dueData.reduce(
            (acc, due) => acc + parseFloat(due.dueAmount),
            0
        );
        const totalBalance = existingLoan - totalPaidAmount;
        return totalBalance.toFixed(2);
    };
    // const getCurrentLoan = () => {
    //     const sortedLoanHistory = [...loanHistory].sort(
    //         (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()
    //     );

    //     const latestLoan = sortedLoanHistory.find(
    //         (entry) =>
    //             entry.timestamp.toDate().toLocaleDateString() !==
    //             sortedLoanHistory[0]?.timestamp.toDate().toLocaleDateString() ||
    //             entry.timestamp.toDate().toLocaleTimeString() !==
    //             sortedLoanHistory[0]?.timestamp.toDate().toLocaleTimeString()
    //     );

    //     return latestLoan || loanHistory[0];
    // };

    const prevLoanIndex = loanHistory.length - 2;
    const prevLoan = loanHistory[prevLoanIndex];
    const latestLoanIndex = loanHistory.length - 1; // Index of the latest loan entry
    const latestLoan = loanHistory[latestLoanIndex];
    // const currentLoan = getCurrentLoan();

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
                        <Heading as="h6" size="md">Finance</Heading>
                    </Box>

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
                            <FormLabel fontSize='sm' fontWeight='700'>Select View</FormLabel>
                            <Select
                                color={textColor}
                                fontSize='sm'
                                placeholder="Select"
                                id="view"
                                value={selectedView}
                                {...register("view",
                                    { required: 'View is required' }
                                )}
                                onChange={(e) => setSelectedView(e.target.value)}
                            >
                                <option value="currentStatement">Current Loan Statement</option>
                                <option value="loanHistory">Loan Amount History</option>
                            </Select>
                            {errors.view && <Text color="red">{errors.view.message}</Text>}
                        </FormControl>

                        {selectedCustomer && selectedView === 'loanHistory' && loanHistory.length > 0 && (
                            <Flex bgColor={boxBg}>
                                <Text className='text-center text-secondary fw-bold mb-4 mt-4'>Loan Amount History</Text>
                                <Table variant="striped">
                                    <Thead>
                                        <Tr>
                                            <Th color="gray.400">Loan Amount</Th>
                                            <Th color="gray.400">Date</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {loanHistory.map((entry, index) => (
                                            <Tr key={entry.id}>
                                                <Td className='fw-bold' fontSize={'sm'}>{parseFloat(entry.loanAmount) || 0}</Td>
                                                <Td className='fw-bold' fontSize={'sm'}>{entry.timestamp.toDate().toLocaleDateString()}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Flex>
                        )}

                        {selectedCustomer &&
                            selectedView === 'currentStatement' &&
                            financeData &&
                            financeData.length > 0 && (
                                <div>

                                    <div className='mt-4 mb-4'>
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th color="gray.400">Category</Th>
                                                    <Th color="gray.400">Loan Amount</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                <Tr>
                                                    <Td className='fw-bold' fontSize={'sm'}>Loan Amount</Td>
                                                    <Td className='fw-bold' fontSize={'sm'}>{parseFloat(financeData[0]?.loanAmount) || 0}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td className='fw-bold' fontSize={'sm'}>Previous Loan Amount</Td>
                                                    <Td className='fw-bold' fontSize={'sm'}>{parseFloat(prevLoan?.loanAmount) || 0}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td className='fw-bold' fontSize={'sm'}>Current Loan Amount</Td>
                                                    <Td className='fw-bold' fontSize={'sm'}>{parseFloat(latestLoan?.loanAmount) || 0}</Td>
                                                </Tr>
                                            </Tbody>
                                        </Table>
                                    </div>

                                    {/* Calculate cumulative paid amounts */}
                                    {financeData[0].dueAmount === 0 ? (
                                        <Text>Loan has been fully paid.</Text>
                                    ) : (
                                        <div>
                                            {dueData && dueData.length > 0 ? (
                                                <div>
                                                    <Text className='text-secondary fw-bold text-center mb-4'>Statement for Due Amount when Paid</Text>
                                                    <Table variant="striped">
                                                        <Thead>
                                                            <Tr>
                                                                <Th color="gray.400">Paid Amount</Th>
                                                                <Th color="gray.400">Date</Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            {dueData.map((due, index) => (
                                                                <Tr key={due.id}>
                                                                    <Td className='fw-bold' fontSize={'sm'}>{parseFloat(due.dueAmount)}</Td>
                                                                    <Td className='fw-bold' fontSize={'sm'}>{due.timestamp.toDate().toLocaleDateString()}</Td>
                                                                </Tr>
                                                            ))}
                                                        </Tbody>
                                                    </Table>
                                                    {parseFloat(calculateTotalBalance()) === 0 ? (
                                                        <Text className='text-center bg-success fw-bold border-1 p-2 text-white mt-4 mb-4'>Loan has been fully paid</Text>
                                                    ) : (
                                                        <Text className='text-center bg-danger fw-bold border-1 p-2 text-white mt-4 mb-4'>Total Balance : {calculateTotalBalance()}</Text>
                                                    )}
                                                </div>
                                            ) : (
                                                <Text className='text-center text-secondary'>No due payments recorded</Text>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                    </VStack>
                </Flex>
            </Box>
        </>
    )
}

export default Report