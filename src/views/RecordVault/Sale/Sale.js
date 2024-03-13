import React, { useState, useEffect } from 'react';
import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { auth, firestore } from '../../../firebase/firebase';
import { FormControl, FormLabel, Select, Input, Button, Table, Box, Flex, Heading, useColorModeValue } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons'; // Assuming you have imported DeleteIcon from Chakra UI icons
import { FaPrint } from 'react-icons/fa';

const SaleForm = () => {
    const [dealers, setDealers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [saleData, setSaleData] = useState([
        {
            productId: '',
            itemName: '',
            quantity: '',
            saleRate: '',
            total: 0,
        },
    ]);
    const [grandTotal, setGrandTotal] = useState(0);

    useEffect(() => {
        // Fetch dealers from Firestore
        const fetchDealers = async () => {
            const dealersCollection = collection(firestore, 'dealers');
            const dealersSnapshot = await getDocs(dealersCollection);
            const dealersData = dealersSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setDealers(dealersData);
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

        fetchDealers();
        fetchProducts();
    }, []);

    const handleDealerChange = (dealerId) => {
        const selectedDealerData = dealers.find((dealer) => dealer.id === dealerId);
        setSelectedDealer(selectedDealerData);
    };

    const handleProductChange = (productId, index) => {
        const updatedSaleData = [...saleData];
        const selectedProduct = products.find(
            (product) => product.id === productId
        );

        updatedSaleData[index] = {
            productId: productId,
            itemName: selectedProduct?.itemName || 'N/A',
            quantity: updatedSaleData[index]?.quantity || '',
            saleRate: selectedProduct?.saleRate || '',
            total: updatedSaleData[index]?.quantity * selectedProduct?.saleRate || 0,
        };

        setSaleData(updatedSaleData);
        updateGrandTotal(updatedSaleData);
    };

    const handleQuantityChange = (newQuantity, index) => {
        const updatedSaleData = [...saleData];
        updatedSaleData[index].quantity = newQuantity;
        updatedSaleData[index].total =
            newQuantity * updatedSaleData[index].saleRate;
        setSaleData(updatedSaleData);
        updateGrandTotal(updatedSaleData);
    };

    const addProduct = () => {
        setSaleData([
            ...saleData,
            { productId: '', quantity: '', saleRate: '', total: 0 },
        ]);
    };

    const removeProduct = (index) => {
        const updatedSaleData = [...saleData];
        updatedSaleData.splice(index, 1);
        setSaleData(updatedSaleData);
        updateGrandTotal(updatedSaleData);
    };

    const updateGrandTotal = (updatedSaleData) => {
        const newGrandTotal = updatedSaleData.reduce(
            (sum, product) => sum + product.total,
            0
        );
        setGrandTotal(newGrandTotal);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const saleCollection = collection(firestore, 'sales');
            const newSaleDoc = await addDoc(saleCollection, {
                dealerId: selectedDealer?.id || null,
                dealerName: selectedDealer?.name || 'N/A',
                products: saleData.map((product) => {
                    const productInfo = products.find((p) => p.id === product.productId);
                    return {
                        productId: product.productId,
                        productName: productInfo?.itemName || 'N/A',
                        quantity: product.quantity,
                        saleRate: product.saleRate,
                        total: product.total,
                    };
                }),
                timestamp: serverTimestamp(),
                grandTotal,
                // ... other relevant data
            });

            console.log('Sale saved successfully:', newSaleDoc.id);

            // Reset form after submission
            setSelectedDealer(null);
            setSaleData([{ productId: '', quantity: '', saleRate: '', total: 0 }]);
            setGrandTotal(0);

            // Display alert
            window.alert('Sale saved successfully!');
        } catch (error) {
            console.error('Error saving sale:', error.message);
            window.alert('Error saving sale. Please try again.');
        }
    };

    const printPOS = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(`
      <html>
        <head>
          <title>POS Receipt</title>
          <style>
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
              margin-top: 10px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            img { width: 100px; height: 100px;}
          </style>
        </head>
        <body>
          ${generatePOSContent()}
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    };

    const generatePOSContent = () => {
        // Generate the POS receipt content based on the saleData, selectedDealer, and other relevant information

        let posReceiptContent = `<style>
    body {
      font-family: Arial, sans-serif;
      font-size: 10px; /* Adjusted font size for smaller paper */
      margin: 0; /* Remove default margin */
    }
    h1, h2 {
      margin: 8px 0;
      font-size: 12px; /* Adjusted font size for headings */
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
      margin-top: 10px;
      font-size: 10px; /* Adjusted font size for table */
    }
    th, td {
      border: 1px solid #ddd;
      padding: 6px; /* Adjusted padding for smaller elements */
      text-align: left;
    }
    td[colspan="3"] {
      text-align: right;
    }
  </style>`;

        // Adjusted styling for the POS receipt content
        posReceiptContent += `<h2>BAIRACORP AGENCY</h2>`;
        posReceiptContent += `<h1>Sale Receipt</h1>`;
        posReceiptContent += `<p>Dealer: ${selectedDealer?.name || 'N/A'}</p>`;
        posReceiptContent += `<p>Dealer Details:</p>`;
        posReceiptContent += `<ul>`;
        posReceiptContent += `<li>Address: ${selectedDealer?.address || 'N/A'
            }</li>`;
        posReceiptContent += `<li>Contact: ${selectedDealer?.phoneNumber || 'N/A'
            }</li>`;
        posReceiptContent += `</ul>`;

        posReceiptContent += `<table>`;
        posReceiptContent += `<tr><th>Product</th><th>Qty</th><th>Rate</th><th>Total</th></tr>`;
        saleData.forEach((product, index) => {
            posReceiptContent += `<tr><td>${products.find((p) => p.id === product.productId)?.itemName || 'N/A'
                }</td><td>${product.quantity}</td><td>${product.saleRate}</td><td>${product.total
                }</td></tr>`;
        });
        posReceiptContent += `<tr><th>Grand Total:</th><td colspan="3" style="text-align: right;">${grandTotal}</td></tr>`;
        posReceiptContent += `</table>`;

        return posReceiptContent;
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

                    <FormControl className={'mb-4'}>
                        <FormLabel fontSize='sm' fontWeight='700'>Select Dealer</FormLabel>
                        <Select
                            color={textColor}
                            fontSize='sm'
                            value={selectedDealer?.id || ''}
                            onChange={(e) => handleDealerChange(e.target.value)}
                        >
                            <option value="">Select Dealer</option>
                            {dealers.map((dealer) => (
                                <option key={dealer.id} value={dealer.id}>
                                    {dealer.name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                    {saleData.map((product, index) => (
                        <Flex key={index} className="mb-4 card p-4" bgColor={boxBg}>
                            <div className='row'>
                                <div className='mb-4'>
                                    <Flex justifyContent={{ base: "center", md: "end" }}>
                                        <Button size='sm' colorScheme="red" onClick={() => removeProduct(index)}>
                                            <DeleteIcon me={2} />
                                            Remove Product
                                        </Button>
                                    </Flex>
                                </div>
                                <div className='col-md-12'>
                                    <FormControl className={'mb-4'}>
                                        <FormLabel color={textColor} fontSize='sm' fontWeight='700'>Select Product</FormLabel>
                                        <Select
                                            color={textColor}
                                            fontSize='sm'
                                            value={product.productId}
                                            onChange={(e) => handleProductChange(e.target.value, index)}
                                        >
                                            <option value="">Select Product</option>
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.itemName || p.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className='col-md-4'>
                                    <FormControl className={'mb-4'}>
                                        <FormLabel color={textColor} fontSize='sm' fontWeight='700'>Quantity (kg)</FormLabel>
                                        <Input
                                            color={textColor}
                                            fontSize='sm'
                                            type="number"
                                            value={product.quantity}
                                            onChange={(e) =>
                                                handleQuantityChange(parseFloat(e.target.value), index)
                                            }
                                        />
                                    </FormControl>
                                </div>
                                <div className='col-md-4'>
                                    <FormControl className={'mb-4'}>
                                        <FormLabel color={textColor} fontSize='sm' fontWeight='700'>Sale Rate</FormLabel>
                                        <Input color={textColor} type="text" value={product.saleRate} readOnly />
                                    </FormControl>
                                </div>
                                <div className='col-md-4'>
                                    <FormControl className={'mb-4'}>
                                        <FormLabel color={textColor} fontSize='sm' fontWeight='700'>Total</FormLabel>
                                        <Input color={textColor} type="text" value={product.total.toFixed(2)} readOnly />
                                    </FormControl>
                                </div>
                            </div>

                            {/* <hr className='mt-4' /> */}
                        </Flex>
                    ))}
                    <div className='mb-4'>
                        <Button fontSize='sm' colorScheme={'blue'} onClick={addProduct}>Add Product</Button>
                    </div>
                    {/* <hr /> */}
                    <FormControl className='mb-4'>
                        <FormLabel fontSize='sm' fontWeight='700'>Grand Total:</FormLabel>
                        <Input color={textColor} fontSize='sm' type="text" value={grandTotal.toFixed(2)} readOnly />
                    </FormControl>

                    <div className='d-flex justify-content-between'>
                        <Button fontSize='sm' colorScheme={'blue'} type="submit">Submit</Button>
                        <Button fontSize='sm' colorScheme={'red'} onClick={printPOS}><FaPrint className='me-2' />Print POS Receipt</Button>
                    </div>

                </form>
            </Flex>
        </Box>
    );
};

export default SaleForm;
