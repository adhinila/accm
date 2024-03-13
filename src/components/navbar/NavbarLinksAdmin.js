// Chakra Imports
import {
	Avatar,
	Box,
	Flex,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
	useColorModeValue,
	useMediaQuery
} from '@chakra-ui/react';
// Custom Components
import PropTypes from 'prop-types';
import React from 'react';
// Assets
import routess from 'routess.js';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import FixedPlugin from 'components/fixedPlugin/FixedPlugin';

export default function HeaderLinks(props) {
	const [isMobile] = useMediaQuery("(max-width: 768px)");
	const { secondary } = props;
	// Chakra Color Mode
	let menuBg = useColorModeValue('white', 'navy.800');
	// const shadow = useColorModeValue(
	// 	'14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
	// 	'14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
	// );
	const shadow = useColorModeValue(
		'14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
		'14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
	);
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');

	const history = useHistory();

	const handleMenuClick = (route) => {
		console.log('clicked', route.name);
		console.log('clicked', route.layout + route.path);
		history.push(route.layout + route.path);
	};

	return (
		<>
			<Flex
				// alignItems="center"
				flexDirection="row"
				justifyContent={'space-between'}
				bg={menuBg}
				flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
				p="10px"
				px="0%"
			>
				{isMobile ? (
					<>
						{routess.map((route, index) => (
							<Menu key={index} className='bg-danger'>
								<MenuButton p="0px" 
								onClick={() => handleMenuClick(route)}>
									{route.icon}
								</MenuButton>
							</Menu>
						))}
						<FixedPlugin />
						<Menu>
							<MenuButton p="0px">
								<Avatar
									_hover={{ cursor: 'pointer' }}
									color="white"
									name="Adela Parkson"
									bg="#11047A"
									size="sm"
									w="40px"
									h="40px"
								/>
							</MenuButton>
							<MenuList boxShadow={shadow} p="0px" mt="10px" borderRadius="20px" bg={menuBg} border="none">
								<Flex w="100%" mb="0px">
									<Text
										ps="20px"
										pt="16px"
										pb="10px"
										w="100%"
										borderBottom="1px solid"
										borderColor={borderColor}
										fontSize="sm"
										fontWeight="700"
										color={textColor}>
										👋&nbsp; Hey, Adela
									</Text>
								</Flex>
								<Flex flexDirection="column" p="10px">
									<MenuItem _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} borderRadius="8px" px="14px">
										<Text fontSize="sm">Profile Settings</Text>
									</MenuItem>
									<MenuItem _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} borderRadius="8px" px="14px">
										<Text fontSize="sm">Newsletter Settings</Text>
									</MenuItem>
									<MenuItem
										_hover={{ bg: 'none' }}
										_focus={{ bg: 'none' }}
										color="red.400"
										borderRadius="8px"
										px="14px">
										<Text fontSize="sm">Log out</Text>
									</MenuItem>
								</Flex>
							</MenuList>
						</Menu>
					</>
				) : (
					<>
					<Flex justifyContent={'center'}>
						{routess.map((route, index) => (
							<Menu key={index}>
								<MenuButton
									px="53px"
									
									onClick={() => handleMenuClick(route)}
									borderBottom={route.isActive ? '2px solid blue' : 'none'}
									_hover={{ borderBottom: '2px solid blue' }}
								>
									{route.name}
								</MenuButton>
							</Menu>
						))}
						<FixedPlugin />
						<Menu>
							<MenuButton px="40px">
								<Avatar
									_hover={{ cursor: 'pointer' }}
									color="white"
									name="Adela Parkson"
									bg="#11047A"
									size="sm"
									w="40px"
									h="40px"
								/>
							</MenuButton>
							<MenuList boxShadow={shadow} p="0px" mt="10px" borderRadius="20px" bg={menuBg} border="none">
								<Flex w="100%" mb="0px">
									<Text
										ps="20px"
										pt="16px"
										pb="10px"
										w="100%"
										borderBottom="1px solid"
										borderColor={borderColor}
										fontSize="sm"
										fontWeight="700"
										color={textColor}
									>
										👋&nbsp; Hey, Adela
									</Text>
								</Flex>
								<Flex flexDirection="column" p="10px">
									<MenuItem _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} borderRadius="8px" px="14px">
										<Text fontSize="sm">Profile Settings</Text>
									</MenuItem>
									<MenuItem _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} borderRadius="8px" px="14px">
										<Text fontSize="sm">Newsletter Settings</Text>
									</MenuItem>
									<MenuItem
										_hover={{ bg: 'none' }}
										_focus={{ bg: 'none' }}
										color="red.400"
										borderRadius="8px"
										px="14px"
									>
										<Text fontSize="sm">Log out</Text>
									</MenuItem>
								</Flex>
							</MenuList>
						</Menu>
						

					</Flex>
					</>
				)}
			</Flex>
		</>
	);
}

HeaderLinks.propTypes = {
	variant: PropTypes.string,
	fixed: PropTypes.bool,
	secondary: PropTypes.bool,
	onOpen: PropTypes.func
};
