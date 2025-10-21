import React, { useState } from 'react';
import { Box, Button, Input, VStack, Heading, Text, InputGroup, InputLeftElement, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);  // ✅ Moved outside component

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [err, setErr] = useState('');
  const toast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed');
      toast({
        title: 'Login failed',
        description: e.response?.data?.message || 'Please check your credentials',
        status: 'error',
      });
    }
  };

  return (
    <Box minH="100vh" position="relative" overflow="hidden" bgGradient="linear(to-br, teal.50, blue.50)">
      {/* Background Blobs */}
      <MotionBox
        position="absolute"
        top="-10%"
        left="-10%"
        w="60vmin"
        h="60vmin"
        bgGradient="radial(teal.300, transparent)"
        borderRadius="50%"
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        filter="blur(40px)"
      />
      <MotionBox
        position="absolute"
        bottom="-10%"
        right="-10%"
        w="70vmin"
        h="70vmin"
        bgGradient="radial(purple.300, transparent)"
        borderRadius="50%"
        animate={{ x: [0, -20, 10, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        filter="blur(40px)"
      />

      {/* Login Card */}
      <MotionBox
        maxW="sm"
        mx="auto"
        mt={{ base: 24, md: 32 }}
        px={8}
        py={10}
        bg="whiteAlpha.700"
        borderRadius="2xl"
        boxShadow="xl"
        backdropFilter="saturate(180%) blur(10px)"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <MotionBox mb={6} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Heading size="lg" bgGradient="linear(to-r, teal.500, blue.500)" bgClip="text">HospitalSystem</Heading>
          <Text color="gray.600">Welcome back, please sign in</Text>
        </MotionBox>

        <form onSubmit={onSubmit}>
          <VStack gap={4}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none"><EmailIcon color="gray.400" /></InputLeftElement>
                <Input placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </InputGroup>
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none"><LockIcon color="gray.400" /></InputLeftElement>
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </InputGroup>
            </FormControl>
            {err && <Box color="red.500" w="100%">{err}</Box>}
            <Button colorScheme="teal" type="submit" w="100%" size="md" _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }} transition="all 0.2s">
              Sign in
            </Button>
          </VStack>
        </form>
      </MotionBox>
    </Box>
  );
}
