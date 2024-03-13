import React, { useEffect, useState } from 'react'
import { Box, FormControl, FormLabel, Input, Button, VStack, Flex, Text, Heading, Select, useColorModeValue } from '@chakra-ui/react'
import { useForm } from 'react-hook-form';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase'

const UpdateRate = () => {
    const [productName, setProductName] = useState('');
    const [saleRate, setSaleRate] = useState('');
    const [purchaseRate, setPurchaseRate] = useState('');
    const [products, setProducts] = useState([]);
    const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange" });

    useEffect(() => {
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

        fetchProducts();
    }, []);


    const onSubmit = async () => {
        // e.preventDefault();

        try {
            // Find the selected product based on the product name
            const selectedProduct = products.find((product) => product.productName === productName);

            if (selectedProduct) {
                // Update product rates in Firestore
                const productDocRef = doc(firestore, 'products', selectedProduct.id);
                await updateDoc(productDocRef, {
                    saleRate,
                    purchaseRate,
                });

                // Reset form fields after successful submission
                setProductName('');
                setSaleRate('');
                setPurchaseRate('');
                console.log('Product rates updated in Firestore');
            } else {
                console.error('Product not found');
            }
        } catch (error) {
            console.error('Error updating product rates in Firestore:', error);
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
                        <Heading as="h6" size="md">Product Rate Update Form</Heading>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Product Name</FormLabel>
                                <Select
                                    color={textColor}
                                    fontSize='sm'
                                    placeholder="Select"
                                    id="productname"
                                    value={productName}
                                    {...register("productname",
                                        { required: 'Product name is required' }
                                    )}
                                    onChange={(e) => setProductName(e.target.value)}
                                >
                                    {products.map((product) => (
                                        <option key={product.id} value={product.productName}>
                                            {product.productName}
                                        </option>
                                    ))}
                                </Select>
                                {errors.productname && <Text color="red">{errors.productname.message}</Text>}
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Sale Rate</FormLabel>
                                <Input
                                    color={textColor}
                                    fontSize='sm'
                                    type="text"
                                    placeholder='Enter sate rate'
                                    id="salerate"
                                    value={saleRate}
                                    isInvalid={errors.salerate}
                                    {...register("salerate",
                                        {
                                            required: 'Sale rate is required',
                                        },
                                    )}
                                    onChange={(e) => setSaleRate(e.target.value)}
                                />
                                {errors.salerate && <Text color="red">{errors.salerate.message}</Text>}
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Purchase Rate</FormLabel>
                                <Input
                                    color={textColor}
                                    fontSize='sm'
                                    type="text"
                                    placeholder='Enter purchase rate'
                                    id="purchaserate"
                                    value={purchaseRate}
                                    isInvalid={errors.purchaserate}
                                    {...register("purchaserate",
                                        { required: 'Purchase rate is required' }
                                    )}
                                    onChange={(e) => setPurchaseRate(e.target.value)}
                                />
                                {errors.purchaserate && <Text color="red">{errors.purchaserate.message}</Text>}
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

export default UpdateRate