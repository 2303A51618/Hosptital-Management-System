import React, { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Badge,
  VStack,
  Text,
  Button,
  Divider,
  HStack,
  useToast
} from '@chakra-ui/react';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../services/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data || []);
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (err) {
        // silent
      }
    };
    fetchNotifications();

    // Setup socket for real-time notifications
    const socket = io(process.env.REACT_APP_SOCKET_URL, { 
      withCredentials: true, 
      transports: ['websocket'] 
    });

    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        status: 'info',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    });

    return () => socket.close();
  }, [toast]);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await api.put(`/notifications/${notification._id}/read`);
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        // silent
      }
    }

    // Navigate based on action link
    if (notification.actionLink) {
      navigate(notification.actionLink);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        status: 'error',
        duration: 3000
      });
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment': return 'blue';
      case 'billing': return 'green';
      case 'room': return 'purple';
      case 'patient': return 'orange';
      case 'alert': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            icon={<FaBell />}
            variant="ghost"
            colorScheme="whiteAlpha"
            aria-label="Notifications"
            fontSize="20px"
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              fontSize="0.8em"
              px={2}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent maxW="400px">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <HStack justify="space-between" pr={8}>
            <Text fontWeight="bold">Notifications</Text>
            {unreadCount > 0 && (
              <Button size="xs" variant="link" colorScheme="blue" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </HStack>
        </PopoverHeader>
        <PopoverBody maxH="400px" overflowY="auto">
          <VStack spacing={2} align="stretch">
            {notifications.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No notifications
              </Text>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <Box
                  key={notification._id}
                  p={3}
                  borderWidth={1}
                  borderRadius="md"
                  bg={notification.read ? 'white' : 'blue.50'}
                  cursor={notification.actionLink ? 'pointer' : 'default'}
                  onClick={() => handleNotificationClick(notification)}
                  _hover={notification.actionLink ? { bg: 'gray.50' } : {}}
                  transition="all 0.2s"
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontWeight="bold" fontSize="sm">
                      {notification.title}
                    </Text>
                    <Badge colorScheme={getNotificationColor(notification.type)} fontSize="0.7em">
                      {notification.type}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {notification.message}
                  </Text>
                  {notification.actionLink && (
                    <Text fontSize="xs" color="blue.500" mt={1}>
                      Click to view →
                    </Text>
                  )}
                  <Text fontSize="xs" color="gray.400" mt={1}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </Text>
                </Box>
              ))
            )}
            {notifications.length > 10 && (
              <>
                <Divider />
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={() => navigate('/notifications')}
                >
                  View all notifications
                </Button>
              </>
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
