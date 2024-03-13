import React, { useState } from 'react'
import { Box, FormControl, FormLabel, Input, Button, VStack, Flex, Text, Heading, useColorModeValue } from '@chakra-ui/react'
import { useForm } from 'react-hook-form';
import { collection, addDoc } from 'firebase/firestore'
import { firestore } from '../../../firebase/firebase'

const Dealer = () => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (e) => {
        // e.preventDefault();

        try {
            // Add customer data to Firestore
            const customersCollection = collection(firestore, 'dealers');
            await addDoc(customersCollection, {
                name,
                phoneNumber,
                address,
            });

            // Reset form fields after successful submission
            setName('');
            setPhoneNumber('');
            setAddress('');
            console.log('Customer data added to Firestore');
        } catch (error) {
            console.error('Error adding customer data to Firestore:', error);
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
                        <Heading as="h6" size="md">Dealer Creation</Heading>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Name</FormLabel>
                                <Input
                                    color={textColor}
                                    fontSize='sm'
                                    type="text"
                                    placeholder='Enter name'
                                    id="name"
                                    value={name}
                                    isInvalid={errors.name}
                                    {...register("name",
                                        { required: 'Username is required' }
                                    )}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {errors.name && <Text color="red">{errors.name.message}</Text>}
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Phone No.</FormLabel>
                                <Input
                                    color={textColor}
                                    fontSize='sm'
                                    type="text"
                                    placeholder='Enter phone no'
                                    id="phoneNumber"
                                    value={phoneNumber}
                                    isInvalid={errors.phoneNumber}
                                    {...register("phoneNumber",
                                        { required: 'Phone number is required' }
                                    )}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                                {errors.phoneNumber && <Text color="red">{errors.phoneNumber.message}</Text>}
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize='sm' fontWeight='700'>Address</FormLabel>
                                <Input
                                    color={textColor}
                                    fontSize='sm'
                                    type="text"
                                    placeholder='Enter address'
                                    id="address"
                                    value={address}
                                    isInvalid={errors.address}
                                    {...register("address",
                                        { required: 'Address is required' }
                                    )}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                {errors.address && <Text color="red">{errors.address.message}</Text>}
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

export default Dealer