import React, { useState } from 'react'
import { Box, FormControl, FormLabel, Input, Button, VStack, Flex, Text, Heading, useColorModeValue } from '@chakra-ui/react'
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase'

const Products = () => {
    const [productName, setProductName] = useState('');
    const [itemName, setItemName] = useState(''); // Added state for item name
    const [saleRate, setSaleRate] = useState('');
    const [purchaseRate, setPurchaseRate] = useState('');
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async () => {
        // e.preventDefault();

        try {
            // Add product data to Firestore
            const productsCollection = collection(firestore, 'products');
            await addDoc(productsCollection, {
                productName,
                itemName, // Include item name in the Firestore document
                saleRate,
                purchaseRate,
                timestamp: serverTimestamp(),
            });

            // Reset form fields after successful submission
            setProductName('');
            setItemName(''); // Reset item name
            setSaleRate('');
            setPurchaseRate('');
            console.log('Product data added to Firestore');
        } catch (error) {
            console.error('Error adding product data to Firestore:', error);
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
                        <Heading as="h6" size="md">Products Creation Form</Heading>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Product Name</FormLabel>
                                <Input
                                    color={textColor}
                                    fontSize='sm'
                                    type="text"
                                    placeholder='Enter product name'
                                    id="productname"
                                    value={productName}
                                    isInvalid={errors.productname}
                                    {...register("productname",
                                        { required: 'Product name is required' }
                                    )}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                                {errors.productname && <Text color="red">{errors.productname.message}</Text>}
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Item Name</FormLabel>
                                <Input
                                    color={textColor}
                                    fontSize='sm'
                                    type="text"
                                    placeholder='Enter item name'
                                    id="itemname"
                                    value={itemName}
                                    isInvalid={errors.itemname}
                                    {...register("itemname",
                                        { required: 'Item name is required' }
                                    )}
                                    onChange={(e) => setItemName(e.target.value)}
                                />
                                {errors.itemname && <Text color="red">{errors.itemname.message}</Text>}
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
                                        { required: 'Sale rate is required' }
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

export default Products