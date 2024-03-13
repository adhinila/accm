// Chakra imports
import { Portal, Box, useDisclosure } from '@chakra-ui/react';
import Footer from 'components/footer/FooterAdmin.js';
// Layout components
import Navbar from 'components/navbar/NavbarAdmin.js';
import Sidebar from 'components/sidebar/Sidebar.js';
import { SidebarContext } from 'contexts/SidebarContext';
import React, { useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import routess from 'routess.js';
import routes from 'routes.js';

// Custom Chakra theme
export default function Dashboard(props) {
	const { ...rest } = props;
	// states and functions
	const [fixed] = useState(false);
	const [toggleSidebar, setToggleSidebar] = useState(false);
	// functions for changing the states from components
	const getRoute = () => {
		return window.location.pathname !== '/admin/full-screen-maps';
	};
	const getActiveRoute = (routess) => {
		let activeRoute = 'Default Brand Text';
		for (let i = 0; i < routess.length; i++) {
			if (routess[i].collapse) {
				let collapseActiveRoute = getActiveRoute(routess[i].items);
				if (collapseActiveRoute !== activeRoute) {
					return collapseActiveRoute;
				}
			} else if (routess[i].category) {
				let categoryActiveRoute = getActiveRoute(routess[i].items);
				if (categoryActiveRoute !== activeRoute) {
					return categoryActiveRoute;
				}
			} else {
				if (window.location.href.indexOf(routess[i].layout + routess[i].path) !== -1) {
					return routess[i].name;
				}
			}
		}
		return activeRoute;
	};
	const getActiveNavbar = (routess) => {
		let activeNavbar = false;
		for (let i = 0; i < routess.length; i++) {
			if (routess[i].collapse) {
				let collapseActiveNavbar = getActiveNavbar(routess[i].items);
				if (collapseActiveNavbar !== activeNavbar) {
					return collapseActiveNavbar;
				}
			} else if (routess[i].category) {
				let categoryActiveNavbar = getActiveNavbar(routess[i].items);
				if (categoryActiveNavbar !== activeNavbar) {
					return categoryActiveNavbar;
				}
			} else {
				if (window.location.href.indexOf(routess[i].layout + routess[i].path) !== -1) {
					return routess[i].secondary;
				}
			}
		}
		return activeNavbar;
	};
	const getActiveNavbarText = (routess) => {
		let activeNavbar = false;
		for (let i = 0; i < routess.length; i++) {
			if (routess[i].collapse) {
				let collapseActiveNavbar = getActiveNavbarText(routess[i].items);
				if (collapseActiveNavbar !== activeNavbar) {
					return collapseActiveNavbar;
				}
			} else if (routess[i].category) {
				let categoryActiveNavbar = getActiveNavbarText(routess[i].items);
				if (categoryActiveNavbar !== activeNavbar) {
					return categoryActiveNavbar;
				}
			} else {
				if (window.location.href.indexOf(routess[i].layout + routess[i].path) !== -1) {
					return routess[i].messageNavbar;
				}
			}
		}
		return activeNavbar;
	};
	const getRoutes = (routess) => {
		return routess.map((prop, key) => {
			if (prop.layout === '/admin') {
				return <Route path={prop.layout + prop.path} component={prop.component} key={key} />;
			}
			if (prop.collapse) {
				return getRoutes(prop.items);
			}
			if (prop.category) {
				return getRoutes(prop.items);
			} else {
				return null;
			}
		});
	};
	document.documentElement.dir = 'ltr';
	const { onOpen } = useDisclosure();
	document.documentElement.dir = 'ltr';
	return (
		<Box>
			<Box>
				<SidebarContext.Provider
					value={{
						toggleSidebar,
						setToggleSidebar
					}}>
					<Sidebar routes={routes} display='none' {...rest} />
					<Box
						float='right'
						minHeight='100vh'
						height='100%'
						overflow='auto'
						position='relative'
						maxHeight='100%'
						w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
						maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
						transition='all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)'
						transitionDuration='.2s, .2s, .35s'
						transitionProperty='top, bottom, width'
						transitionTimingFunction='linear, linear, ease'>
						<Portal>
						</Portal>
						<Box>
							<Navbar
								onOpen={onOpen}
								brandText={getActiveRoute(routess)}
								secondary={getActiveNavbar(routess)}
								message={getActiveNavbarText(routess)}
								fixed={fixed}
								{...rest}
							/>
						</Box>

						{getRoute() ? (
							<Box mx='auto' p={{ base: '20px', md: '30px' }} pe='20px' minH='100vh' pt='50px'>
								<Switch>
									{getRoutes(routess)}
									<Redirect from='/' to='/admin/dashboard' />
								</Switch>
							</Box>
						) : null}
						<Box>
							<Footer />
						</Box>
					</Box>
				</SidebarContext.Provider>
			</Box>
		</Box>
	);
}
