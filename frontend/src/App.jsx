
import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Box, Flex, HStack, IconButton, useDisclosure, VStack, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, Button, Text, useColorMode, Tooltip } from '@chakra-ui/react';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import NotificationBell from './components/NotificationBell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Rooms from './pages/Rooms';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';

const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};


function Navbar() {
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const links = [
    { to: '/', label: 'Dashboard', roles: ['Admin', 'Doctor', 'Receptionist', 'Billing'] },
    { to: '/doctors', label: 'Doctors', roles: ['Admin', 'Doctor', 'Receptionist'] },
    { to: '/patients', label: 'Patients', roles: ['Admin', 'Doctor', 'Receptionist'] },
    { to: '/rooms', label: 'Rooms', roles: ['Admin', 'Receptionist'] },
    { to: '/appointments', label: 'Appointments', roles: ['Admin', 'Doctor', 'Receptionist'] },
    { to: '/billing', label: 'Billing', roles: ['Admin', 'Billing'] },
  ];
  if (!user) return null;
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
            {links.filter(l => l.roles.includes(user.role)).map(link => (
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
          <Text mr={2}>{user.name} ({user.role})</Text>
          <Button colorScheme="red" size="sm" onClick={logout}>Logout</Button>
        </Flex>
      </Flex>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="gray.800" color="white">
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="start">
              {links.filter(l => l.roles.includes(user.role)).map(link => (
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
    <AuthProvider>
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Box pt={4} px={4}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protected><Dashboard /></Protected>} />
            <Route path="/doctors" element={<Protected roles={['Admin', 'Doctor', 'Receptionist']}><Doctors /></Protected>} />
            <Route path="/patients" element={<Protected roles={['Admin', 'Doctor', 'Receptionist']}><Patients /></Protected>} />
            <Route path="/rooms" element={<Protected roles={['Admin', 'Receptionist']}><Rooms /></Protected>} />
            <Route path="/appointments" element={<Protected roles={['Admin', 'Doctor', 'Receptionist']}><Appointments /></Protected>} />
            <Route path="/billing" element={<Protected roles={['Admin', 'Billing']}><Billing /></Protected>} />
          </Routes>
        </Box>
      </Box>
    </AuthProvider>
  );
}
