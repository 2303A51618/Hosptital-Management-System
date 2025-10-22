
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Box, Flex, HStack, IconButton, useDisclosure, VStack, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, Button, useColorMode, Tooltip } from '@chakra-ui/react';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import NotificationBell from './components/NotificationBell';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Rooms from './pages/Rooms';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';

function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/patients', label: 'Patients' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/billing', label: 'Billing' },
  ];
  return (
    <Box bg="gray.800" px={4} color="white" boxShadow="md">
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={<HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box fontWeight="bold" fontSize="xl">HospitalSystem</Box>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            {links.map(link => (
              <Button
                as={Link}
                to={link.to}
                key={link.to}
                variant={location.pathname === link.to ? 'solid' : 'ghost'}
                colorScheme={location.pathname === link.to ? 'teal' : 'whiteAlpha'}
              >
                {link.label}
              </Button>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={'center'} gap={3}>
          <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              colorScheme="whiteAlpha"
              aria-label="Toggle color mode"
            />
          </Tooltip>
          <NotificationBell />
        </Flex>
      </Flex>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="gray.800" color="white">
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="start">
              {links.map(link => (
                <Button
                  as={Link}
                  to={link.to}
                  key={link.to}
                  w="100%"
                  variant={location.pathname === link.to ? 'solid' : 'ghost'}
                  colorScheme={location.pathname === link.to ? 'teal' : 'whiteAlpha'}
                  onClick={onClose}
                >
                  {link.label}
                </Button>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Box pt={4} px={4}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/billing" element={<Billing />} />
        </Routes>
      </Box>
    </Box>
  );
}
