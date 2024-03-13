import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Input,
    FormControl,
    FormLabel,
    Select,
    Stack,
    Text,
    Flex,
    useColorModeValue,
} from '@chakra-ui/react';
import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    query,
    where,
} from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';
import { IoRemoveCircleSharp } from 'react-icons/io5';
import { FaPrint } from 'react-icons/fa';
import { DeleteIcon } from '@chakra-ui/icons';

const PurchaseForm = () => {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [purchaseData, setPurchaseData] = useState([
        {
            productId: '',
            itemName: '',
            quantity: '',
            purchaseRate: '',
            total: 0,
        },
    ]);
    const [grandTotal, setGrandTotal] = useState(0);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        // Fetch customers from Firestore
        const fetchCustomers = async () => {
            const customersCollection = collection(firestore, 'customers');
            const customersSnapshot = await getDocs(customersCollection);
            const customersData = customersSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCustomers(customersData);
        };

        // Fetch products from Firestore
        const fetchProducts = async () => {
            const productsCollection = collection(firestore, 'products');
            const productsSnapshot = await getDocs(productsCollection);
            const productsData = productsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(productsData);
        };

        fetchCustomers();
        fetchProducts();
    }, []);

    const handleCustomerChange = (customerId) => {
        const selectedCustomerData = customers.find(
            (customer) => customer.id === customerId
        );
        setSelectedCustomer(selectedCustomerData);
    };
    const handleProductChange = (productId, index) => {
        const updatedPurchaseData = [...purchaseData];
        const selectedProduct = products.find(
            (product) => product.id === productId
        );

        updatedPurchaseData[index] = {
            productId: productId,
            itemName: selectedProduct?.itemName || 'N/A', // Assuming itemName is a property of your product
            quantity: updatedPurchaseData[index]?.quantity || '',
            purchaseRate: selectedProduct?.purchaseRate || '',
            total:
                updatedPurchaseData[index]?.quantity * selectedProduct?.purchaseRate ||
                0,
        };

        setPurchaseData(updatedPurchaseData);
        updateGrandTotal(updatedPurchaseData);
    };

    const handleQuantityChange = (newQuantity, index) => {
        const updatedPurchaseData = [...purchaseData];
        updatedPurchaseData[index].quantity = newQuantity;
        updatedPurchaseData[index].total =
            newQuantity * updatedPurchaseData[index].purchaseRate;
        setPurchaseData(updatedPurchaseData);
        updateGrandTotal(updatedPurchaseData);
    };

    const addProduct = () => {
        setPurchaseData([
            ...purchaseData,
            { productId: '', quantity: '', purchaseRate: '', total: 0 },
        ]);
    };

    const removeProduct = (index) => {
        const updatedPurchaseData = [...purchaseData];
        updatedPurchaseData.splice(index, 1);
        setPurchaseData(updatedPurchaseData);
        updateGrandTotal(updatedPurchaseData);
    };

    const updateGrandTotal = (updatedPurchaseData) => {
        const newGrandTotal = updatedPurchaseData.reduce(
            (sum, product) => sum + product.total,
            0
        );
        setGrandTotal(newGrandTotal);
    };

    const fetchProducts = async () => {
        try {
            const productsCollection = collection(firestore, 'products');
            const productsSnapshot = await getDocs(productsCollection);
            const productsData = productsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching products:', error.message);
        }
    };
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


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const purchaseCollection = collection(firestore, 'purchases');
            const newPurchaseDoc = await addDoc(purchaseCollection, {
                customerId: selectedCustomer?.id || null,
                customerName: selectedCustomer?.name || 'N/A',
                products: purchaseData.map((product) => {
                    const productInfo = products.find((p) => p.id === product.productId);
                    return {
                        productId: product.productId,
                        productName: productInfo?.itemName || 'N/A',
                        quantity: product.quantity,
                        purchaseRate: product.purchaseRate,
                        total: product.total,
                    };
                }),
                timestamp: selectedDate ? new Date(selectedDate) : serverTimestamp(), // Use selectedDate if available, otherwise use serverTimestamp()
                grandTotal,
                // ... other relevant data
            });

            console.log('Purchase saved successfully:', newPurchaseDoc.id);
            window.alert('Data has been saved.');
        } catch (error) {
            console.error('Error saving purchase:', error.message);
            window.alert('Data has been saved.');
        }
        // Reset form after submission
        setCustomers([]);
        setProducts([]);
        setSelectedCustomer(null);
        setPurchaseData([
            {
                productId: '',
                itemName: '',
                quantity: '',
                purchaseRate: '',
                total: 0,
            },
        ]);
        setGrandTotal(0);
        // Display alert
        fetchCustomers();
        fetchProducts();
    };


    const printReceipt = () => {
        // Assuming you have a separate component for the receipt, you can create a print-friendly HTML structure
        const receiptContent = generateReceiptContent();

        // Create a new window and print the receipt content
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <!-- Add any additional styling for the receipt here -->
            <style>
              body {
                font-family: Arial, sans-serif;
              }
            </style>
          </head>
          <body>
            ${receiptContent}
          </body>
        </html>
      `);
        printWindow.document.close();

        // Trigger the print dialog
        printWindow.print();
    };
    const generateReceiptContent = () => {
        // Generate the receipt content based on the purchaseData, selectedCustomer, and other relevant information
        // You can format this content as needed for your receipt

        let receiptContent = `<style>
                          body {
                            font-family: Arial, sans-serif;
                            font-size: 12px;
                          }
                          h1 {
                            margin: 8px 0;
                            font-size: 14px;
                          }
                          p {
                            margin: 5px 0;
                          }
                          ul {
                            list-style-type: none;
                            padding: 0;
                            margin: 0;
                          }
                          li {
                            margin-bottom: 5px;
                          }
                          table {
                            width: fit;
                            border-collapse: collapse;
                            margin-top: 10px; font-size: 12px;
                          }
                          th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                          }
                          img { width: 100px; height: 100px;}
                          </style>`;
        receiptContent += `<img src="https://bairacorp.in/assets/img/favicon.png" alt="description of the image" />
  `;
        receiptContent += `<h1>Receipt</h1>`;
        receiptContent += `<p>Customer: ${selectedCustomer?.name || 'N/A'}</p>`;
        receiptContent += `<ul>`;
        purchaseData.forEach((product, index) => {
            receiptContent += `<li>${products.find((p) => p.id === product.productId)?.itemName || 'N/A'
                } - Quantity: ${product.quantity}, Total: ${product.total}</li>`;
        });
        receiptContent += `</ul>`;
        receiptContent += `<table>`;
        receiptContent += `<tr><th>Product</th><th>Quantity</th><th>Total</th></tr>`;
        purchaseData.forEach((product, index) => {
            receiptContent += `<tr><td>${products.find((p) => p.id === product.productId)?.itemName || 'N/A'
                }</td><td>${product.quantity}</td><td>${product.total}</td></tr>`;
        });
        receiptContent += `</table>`;
        receiptContent += `<p>Grand Total: ${grandTotal}</p>`;

        return receiptContent;
    };

    const handleDateChange = async (e) => {
        setSelectedDate(e.target.value);

        try {
            const purchasesCollection = collection(firestore, 'purchases');
            // const q = query(purchasesCollection, where('timestamp', '==', e.target.value));
            // const querySnapshot = await getDocs(q);
            // const purchasesData = querySnapshot.docs.map((doc) => ({
            //   id: doc.id,
            //   ...doc.data(),
            // }));

            // Handle fetched purchase data for the selected date
        } catch (error) {
            console.error('Error fetching purchases:', error.message);
        }
    };

    const boxBg = useColorModeValue("white", "whiteAlpha.100");
    const textColor = useColorModeValue("secondaryGray.900", "white");

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
                <form onSubmit={handleSubmit}>
                    <Box>
                        <Text fontSize="2xl" className={'text-center mb-4'} fontWeight="bold">Purchase Form</Text>
                        <FormControl className='mb-4'>
                            <FormLabel fontSize='sm' fontWeight='700'>Select Customer</FormLabel>
                            <Select
                                color={textColor}
                                value={selectedCustomer?.id || ''}
                                placeholder="Select"
                                fontSize='sm'
                                onChange={(e) => handleCustomerChange(e.target.value)}
                            >
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize='sm' fontWeight='700'>Select Date</FormLabel>
                            <Input
                                color={textColor}
                                type="date"
                                fontSize='sm'
                                value={selectedDate}
                                onChange={handleDateChange}
                            />
                        </FormControl>
                    </Box>

                    {purchaseData.map((product, index) => (
                        <Flex className={'card p-4 mt-4 mb-4'} bgColor={boxBg} >
                            {/* // <Stack key={index} direction="row" spacing={2}> */}
                            <div key={index} className='row'>
                                <div className='mb-4'>
                                    <Flex justifyContent={{ base: "center", md: "end" }}>
                                        <Button size="sm" colorScheme='red' onClick={() => removeProduct(index)}><DeleteIcon me={2} /> Remove</Button>
                                    </Flex>
                                </div>
                                <div className='col-md-6'>
                                    <div className='mb-4'>
                                    <FormLabel color={textColor} fontSize='sm' fontWeight='700'>Select Dealer</FormLabel>
                                        <Select
                                            fontSize='sm'
                                            color={textColor}
                                            value={product.productId}
                                            placeholder="Select Product"
                                            onChange={(e) => handleProductChange(e.target.value, index)}
                                        >
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.itemName || p.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className='mb-4'>
                                    <FormLabel color={textColor} fontSize='sm' fontWeight='700'>Quantity (kg)</FormLabel>
                                        <Input
                                            color={textColor}
                                            type="number"
                                            fontSize='sm'
                                            value={product.quantity}
                                            onChange={(e) => handleQuantityChange(parseFloat(e.target.value), index)}
                                        />
                                    </div>

                                </div>
                                <div className='col-md-6'>
                                <FormLabel color={textColor} fontSize='sm' fontWeight='700'>Sale Rate</FormLabel>
                                    <Input className='mb-4' color={textColor} type="text" fontSize='sm' value={product.purchaseRate} readOnly />
                                    <FormLabel color={textColor} fontSize='sm' fontWeight='700'>Total</FormLabel>
                                    <Input className='mb-4' color={textColor} type="text" fontSize='sm' value={product.total.toFixed(2)} readOnly />

                                </div>

                            </div>
                            {/* // </Stack> */}
                        </Flex>
                    ))}

                    <div className='mb-4'>
                        <Flex justifyContent={{ base: "center", md: "unset" }}>
                            <Button
                                colorScheme="blue"
                                size="sm"
                                onClick={addProduct}
                            >
                                Add Product
                            </Button>
                        </Flex>
                    </div>


                    <div className='text-center mb-4'>
                        <Text fontSize='lg' fontWeight='700' className='text-primary'>Grand Total : {grandTotal.toFixed(2)}</Text>
                    </div>


                    {/* <Stack direction="row" spacing={4}> */}
                    <div className='d-flex justify-content-between'>
                        <Button colorScheme="blue" size="sm" type="submit">Submit</Button>
                        <Button colorScheme="red" size="sm" onClick={printReceipt}><FaPrint className='me-2' /> Print Receipt</Button>
                    </div>

                    {/* </Stack> */}
                </form>
            </Flex>
        </Box>
    );
};

export default PurchaseForm;
