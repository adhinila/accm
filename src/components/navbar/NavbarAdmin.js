import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import AdminNavbarLinks from 'components/navbar/NavbarLinksAdmin';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import routes from 'routes.js';

export default function AdminNavbar(props) {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		window.addEventListener('scroll', changeNavbar);

		return () => {
			window.removeEventListener('scroll', changeNavbar);
		};
	}, []);

	const { secondary, message } = props;

	// let navbarBg = useColorModeValue('rgba(244, 247, 254, 0.2)', 'rgba(11,20,55,0.5)');
	let menuBg = useColorModeValue('white', 'navy.800');

	const changeNavbar = () => {
		if (window.scrollY > 1) {
			setScrolled(true);
		} else {
			setScrolled(false);
		}
	};

	return (
		<>
			<Box
				position="absolute"
				top={{ base: 'unset', md: 0 }}
				pb="8px"
				px="15px"
				pt="8px"
			>
				<SidebarResponsive routes={routes} />
			</Box>

			<Box
				position="fixed"
				bottom={{ base: 0, md: 'unset' }} // Place at the bottom on mobile screens, unset on desktop
				top={{ base: 'unset', md: 0 }} // Place at the top on desktop screens, unset on mobile
				w={{ base: '100%', md: '100%' }}
				// bg={'white'}
				bg={menuBg}
				// borderRadius="16px"
				// borderWidth="1.5px"
				justifyContent={'center'}
				// borderStyle="solid"
				transitionDelay="0s, 0s, 0s, 0s"
				// transitionDuration=" 0.25s, 0.25s, 0.25s, 0s"
				// transitionProperty="box-shadow, background-color, filter, border"
				// transitionTimingFunction="linear, linear, linear, linear"
				pb="8px"
				px={{ base: '15px', md: 'unset' }}
				pt="8px"
				zIndex="999"
			>
				<Flex
					w="100%"
					flexDirection={{ sm: 'column', md: 'column' }}
					alignItems={{ xl: 'center' }}
				>
					<Box ms="auto" w={{ sm: '100%', md: '100%' }}>
						<AdminNavbarLinks
							onOpen={props.onOpen}
							logoText={props.logoText}
							secondary={props.secondary}
							fixed={props.fixed}
							scrolled={scrolled}
						/>
					</Box>
				</Flex>
				{secondary ? <Text color="white">{message}</Text> : null}
			</Box>
		</>
	);
}

AdminNavbar.propTypes = {
	brandText: PropTypes.string,
	variant: PropTypes.string,
	secondary: PropTypes.bool,
	fixed: PropTypes.bool,
	onOpen: PropTypes.func
};
